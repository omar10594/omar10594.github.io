import {
  HOME, COMMANDS, COMMAND_HELP, runCommand, completeInput, resolvePath,
  type TerminalBlock, type WorkspaceDocument,
} from '../terminal/engine';
import type { UnsupportedInputRequest } from '../terminal/fallback';
import { documents, encodedEmail } from './content';
import { renderMarkdown } from './markdown';
import { getStartupLayout, windowIdForDocumentPath, type WindowRect } from './window-model';

interface WorkspaceWindow {
  id: string;
  element: HTMLElement;
  path?: string;
  title: string;
  closed: boolean;
  minimized: boolean;
  maximized: boolean;
  rect: WindowRect;
  restoreRect?: WindowRect;
}

export function initializeDesktop(): void {
  const desktop = document.querySelector<HTMLElement>('#desktop');
  if (!desktop || desktop.dataset.initialized) return;
  desktop.dataset.initialized = 'true';
  const area = document.querySelector<HTMLElement>('#window-area')!;
  const terminal = document.querySelector<HTMLElement>('#window-terminal')!;
  const output = document.querySelector<HTMLElement>('#terminal-output')!;
  const input = document.querySelector<HTMLInputElement>('#command-input')!;
  const form = document.querySelector<HTMLFormElement>('#terminal-form')!;
  const tasks = document.querySelector<HTMLElement>('#window-tasks')!;
  const announcement = document.querySelector<HTMLElement>('#workspace-announcement')!;
  const welcomeTemplate = document.querySelector<HTMLTemplateElement>('#welcome-template')!;
  const windows = new Map<string, WorkspaceWindow>();
  let activeId = 'about';
  let zIndex = 10;
  let cwd = HOME;
  let previousCwd: string | undefined;
  let history: string[] = [];
  let historyIndex = 0;
  let historyDraft = '';
  let dimensions = { columns: 80, rows: 24 };
  let lastUnsupportedRequest: UnsupportedInputRequest | undefined;
  const compact = () => window.innerWidth <= 700;
  const shortPath = (path: string) => path === HOME ? '~' : path.startsWith(HOME + '/') ? '~' + path.slice(HOME.length) : path;
  const announce = (text: string) => { announcement.textContent = text; };
  const documentFor = (path: string) => documents.find((item) => item.path === path);
  const idFor = windowIdForDocumentPath;
  const documentLabel = (path: string) => path.startsWith(HOME + '/') ? path.slice(HOME.length + 1) : path;

  function bounds(rect: WindowRect): WindowRect {
    const width = Math.min(Math.max(300, rect.width), area.clientWidth);
    const height = Math.min(Math.max(180, rect.height), area.clientHeight);
    return { width, height, x: Math.max(0, Math.min(rect.x, area.clientWidth - width)), y: Math.max(0, Math.min(rect.y, area.clientHeight - height)) };
  }

  function applyRect(win: WorkspaceWindow): void {
    const rect = compact() || win.maximized
      ? { x: 0, y: 0, width: area.clientWidth, height: area.clientHeight }
      : bounds(win.rect);
    Object.assign(win.element.style, {
      left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: 'none',
    });
    win.element.classList.toggle('is-maximized', win.maximized);
    const maximize = win.element.querySelector<HTMLButtonElement>('[data-window-action="maximize"]');
    if (maximize) {
      const label = `${win.maximized ? 'Restore' : 'Maximize'} ${win.title}`;
      maximize.setAttribute('aria-label', label);
      maximize.title = label;
    }
  }

  function syncWindows(): void {
    windows.forEach((win) => {
      win.element.hidden = win.closed || win.minimized || (compact() && win.id !== activeId);
      win.element.classList.toggle('is-active', win.id === activeId);
      const button = tasks.querySelector<HTMLButtonElement>(`[data-task="${win.id}"]`);
      if (button) {
        button.hidden = win.closed && !['terminal', 'about', 'contact'].includes(win.id);
        button.classList.toggle('is-current', win.id === activeId && !win.closed && !win.minimized);
        button.classList.toggle('is-minimized', win.minimized);
        button.setAttribute('aria-pressed', String(win.id === activeId && !win.closed && !win.minimized));
        button.title = `${win.minimized ? 'Restore' : 'Open'} ${win.title}`;
      }
    });
  }

  function focusWindow(id: string, moveFocus = false): void {
    const win = windows.get(id);
    if (!win) return;
    win.closed = false;
    win.minimized = false;
    activeId = id;
    win.element.style.zIndex = String(++zIndex);
    applyRect(win);
    syncWindows();
    if (moveFocus) {
      if (id === 'terminal') input.focus({ preventScroll: true });
      else win.element.focus({ preventScroll: true });
    }
  }

  function selectNextWindow(): void {
    const next = [...windows.values()].filter((win) => !win.closed && !win.minimized).at(-1);
    activeId = next?.id ?? '';
    if (next) focusWindow(next.id, true);
    else {
      syncWindows();
      tasks.querySelector<HTMLButtonElement>('[data-task="terminal"]')?.focus();
    }
  }

  function closeWindow(win: WorkspaceWindow, minimize = false): void {
    win.closed = !minimize;
    win.minimized = minimize;
    if (win.id === activeId) selectNextWindow();
    syncWindows();
    if (win.path && window.location.hash === `#file=${encodeURIComponent(win.path)}`) {
      const next = windows.get(activeId);
      window.history.replaceState(null, '', next?.path ? `#file=${encodeURIComponent(next.path)}` : window.location.pathname + window.location.search);
    }
    announce(`${win.title} ${minimize ? 'minimized' : 'closed'}. Reopen it from the bottom bar.`);
  }

  function toggleMaximize(win: WorkspaceWindow): void {
    if (compact()) return;
    if (!win.maximized) { win.restoreRect = { ...win.rect }; win.maximized = true; }
    else { win.maximized = false; win.rect = win.restoreRect ?? win.rect; }
    focusWindow(win.id);
    announce(`${win.title} ${win.maximized ? 'maximized' : 'restored'}.`);
  }

  function makeTask(win: WorkspaceWindow): void {
    if (tasks.querySelector(`[data-task="${win.id}"]`)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'task-button';
    button.dataset.task = win.id;
    button.textContent = win.title;
    button.setAttribute('aria-pressed', 'false');
    tasks.append(button);
  }

  function contactActions(): HTMLElement {
    const actions = document.createElement('div');
    actions.className = 'contact-actions';
    actions.dataset.contactActions = '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'contact-action';
    button.dataset.revealEmail = '';
    button.textContent = 'Reveal email';
    const status = document.createElement('p');
    status.className = 'contact-status';
    status.setAttribute('role', 'status');
    actions.append(button, status);
    return actions;
  }

  function fillDocument(container: HTMLElement, doc: WorkspaceDocument): void {
    container.replaceChildren(renderMarkdown(doc.content, doc.path));
    if (doc.kind === 'contact') container.insertBefore(contactActions(), container.querySelector('ul'));
  }

  function createDocumentWindow(doc: WorkspaceDocument): WorkspaceWindow {
    const id = idFor(doc.path);
    const element = document.createElement('section');
    element.id = `window-${id}`;
    element.className = 'workspace-window document-window';
    element.dataset.window = id;
    element.dataset.documentPath = doc.path;
    element.tabIndex = -1;
    element.setAttribute('aria-label', doc.title);
    const header = document.createElement('header');
    header.className = 'window-titlebar';
    header.dataset.dragHandle = '';
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    const controlSettings = [ ['close', 'Close', '×'], ['minimize', 'Minimize', '−'], ['maximize', 'Maximize', '+'] ] as const;
    controlSettings.forEach(([action, label, symbol]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `window-control ${action}-control`;
      button.dataset.windowAction = action;
      button.setAttribute('aria-label', `${label} ${doc.title}`);
      button.title = `${label} ${doc.title}`;
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = symbol;
      button.append(span);
      controls.append(button);
    });
    const title = document.createElement('span');
    title.className = 'window-title';
    title.textContent = documentLabel(doc.path);
    const type = document.createElement('span');
    type.className = 'file-type';
    type.setAttribute('aria-hidden', 'true');
    type.textContent = 'md';
    header.append(controls, title, type);
    const article = document.createElement('article');
    article.className = 'document-content markdown-content';
    fillDocument(article, doc);
    const resize = document.createElement('div');
    resize.className = 'resize-handle';
    resize.dataset.resizeHandle = '';
    resize.setAttribute('aria-hidden', 'true');
    element.append(header, article, resize);
    area.append(element);
    const count = windows.size - 1;
    const win: WorkspaceWindow = { id, path: doc.path, title: doc.title, element, closed: false, minimized: false, maximized: false,
      rect: bounds({ x: Math.max(18, (area.clientWidth - 590) / 2) + count * 12, y: Math.max(15, (area.clientHeight - 500) / 2) + count * 10, width: 590, height: 500 }),
    };
    windows.set(id, win);
    configureTitlebar(win);
    makeTask(win);
    return win;
  }

  function openDocument(path: string, updateHash = false, moveFocus = true): void {
    const doc = documentFor(path);
    if (!doc) return;
    const win = windows.get(idFor(path)) ?? createDocumentWindow(doc);
    focusWindow(win.id, moveFocus);
    const fragment = `#file=${encodeURIComponent(path)}`;
    if (updateHash && window.location.hash !== fragment) window.history.pushState(null, '', fragment);
    announce(`Opened ${doc.title}.`);
  }

  function resetDesktop(moveFocus = true): void {
    cwd = HOME;
    previousCwd = undefined;
    input.value = '';
    output.replaceChildren();
    echoCommand('info');
    output.append(welcomeTemplate.content.cloneNode(true));
    const initialLayout = getStartupLayout(area.clientWidth, area.clientHeight);
    zIndex = 10;
    windows.forEach((win) => {
      win.closed = !['terminal', 'about', 'contact'].includes(win.id);
      win.minimized = false;
      win.maximized = false;
      const rect = initialLayout[win.id as keyof typeof initialLayout];
      if (rect) win.rect = rect;
      applyRect(win);
    });
    for (const id of ['terminal', 'contact', 'about']) windows.get(id)!.element.style.zIndex = String(++zIndex);
    updatePrompt();
    focusWindow('about', moveFocus);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    announce('Desktop reset.');
  }

  function updatePrompt(): void {
    document.querySelector('#prompt-path')!.textContent = shortPath(cwd);
    document.querySelector('#terminal-title-path')!.textContent = shortPath(cwd);
  }

  function appendText(text: string, tone?: string): void {
    const pre = document.createElement('pre');
    pre.className = `terminal-text${tone ? ` tone-${tone}` : ''}`;
    pre.textContent = text;
    output.append(pre);
  }

  function appendBlock(block: TerminalBlock): void {
    if (block.type === 'text') appendText(block.text, block.tone);
    else if (block.type === 'welcome') output.append(welcomeTemplate.content.cloneNode(true));
    else if (block.type === 'document') {
      const doc = documentFor(block.path);
      if (!doc) return;
      const article = document.createElement('article');
      article.className = 'terminal-document markdown-content';
      fillDocument(article, doc);
      output.append(article);
    } else if (block.type === 'listing') {
      if (!block.entries.length) { appendText('(empty directory)', 'muted'); return; }
      const listing = document.createElement('div');
      listing.className = `terminal-listing${block.long ? ' is-long' : ''}`;
      block.entries.forEach((entry) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `file-link${entry.directory ? ' is-directory' : ''}`;
        button.dataset.command = `${entry.directory ? 'cd' : 'open'} "${entry.path}"`;
        if (block.long) {
          const permissions = document.createElement('span');
          permissions.className = 'file-permissions';
          permissions.textContent = entry.directory ? 'dr-x' : '-r--';
          permissions.title = 'Read-only virtual workspace';
          button.append(permissions);
        }
        const name = document.createElement('span');
        name.textContent = entry.name + (entry.directory ? '/' : '');
        button.append(name);
        listing.append(button);
      });
      output.append(listing);
    } else if (block.type === 'help') {
      const intro = document.createElement('p');
      intro.className = 'help-intro';
      intro.textContent = 'A small, read-only workspace. Click files to open them, or explore with these commands.';
      output.append(intro);
      const commands = block.command ? [block.command] : [...COMMANDS];
      commands.forEach((command) => {
        const row = document.createElement('div');
        row.className = 'help-command';
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = command;
        button.dataset.insertCommand = command + (['cd', 'cat', 'open', 'close'].includes(command) ? ' ' : '');
        const text = document.createElement('span');
        text.textContent = (COMMAND_HELP[command] ?? command).replace(/^\S+(?:\s\[[^\]]+\]|\s<[^>]+>)?\s+/, '');
        row.append(button, text);
        output.append(row);
      });
      appendText('Tab: complete a path · ↑↓: command history · Ctrl+L: clear', 'muted');
      appendText('Focus a window title bar: arrows move · Shift+arrows resize · Enter maximizes · Home centers', 'muted');
    }
  }

  function echoCommand(value: string): void {
    const echo = document.createElement('div');
    echo.className = 'command-echo';
    for (const [className, text] of [['prompt-user', 'omar'], ['prompt-punctuation', ':'], ['prompt-path', shortPath(cwd)], ['prompt-punctuation', '$ '], ['', value]]) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      echo.append(span);
    }
    output.append(echo);
  }

  function executeCommand(value: string, fromClick = false): void {
    if (!value.trim()) return;
    focusWindow('terminal', false);
    echoCommand(value);
    if (history.at(-1) !== value) history.push(value);
    history = history.slice(-100);
    historyIndex = history.length;
    const result = runCommand(value, { cwd, previousCwd, columns: dimensions.columns, documents });
    cwd = result.cwd;
    previousCwd = result.previousCwd;
    result.blocks.forEach(appendBlock);
    if (result.unsupported) {
      lastUnsupportedRequest = { ...result.unsupported, rows: dimensions.rows, publicFiles: documents.map(({ path, title }) => ({ path, title })) };
      // Only a typed, in-memory envelope. No model or network is connected.
      void lastUnsupportedRequest;
    }
    result.actions.forEach((action) => {
      if (action.type === 'open') openDocument(action.path, true);
      else if (action.type === 'clear') output.replaceChildren();
      else if (action.type === 'reset') resetDesktop();
      else if (action.type === 'windows') {
        windows.forEach((win) => { if (!win.closed) appendText(`${(win.path ? shortPath(win.path) : win.id).padEnd(18)} ${win.minimized ? 'minimized' : 'open'}${win.id === activeId ? ' · active' : ''}`, 'muted'); });
      } else if (action.type === 'close') {
        const name = action.target?.toLowerCase().replace(/\.md$/, '');
        const path = action.target ? resolvePath(action.target, cwd) : undefined;
        const win = name ? [...windows.values()].find((item) => item.path === path)
          ?? [...windows.values()].find((item) => item.id.toLowerCase() === name || item.title.toLowerCase() === name)
          : windows.get('terminal');
        if (win && !win.closed) closeWindow(win);
        else appendText(`No open window named ${action.target}. Try windows.`, 'error');
      }
    });
    updatePrompt();
    input.value = '';
    while (output.childElementCount > 180) output.firstElementChild?.remove();
    output.scrollTop = output.scrollHeight;
    if (fromClick && /^cd\s/.test(value) && !result.blocks.some((block) => block.type === 'text' && block.tone === 'error')) executeCommand('ls');
    else if (activeId === 'terminal' && !compact()) input.focus({ preventScroll: true });
    const spoken = result.blocks.filter((block) => block.type === 'text').map((block) => block.text).join(' ');
    announce(spoken || `Ran ${value}.`);
  }

  windows.set('terminal', { id: 'terminal', element: terminal, title: 'Terminal', closed: false, minimized: false, maximized: false, rect: { x: 0, y: 0, width: 860, height: 660 } });
  area.querySelectorAll<HTMLElement>('[data-document-path]').forEach((element) => {
    const doc = documentFor(element.dataset.documentPath!);
    if (!doc) return;
    fillDocument(element.querySelector<HTMLElement>('[data-document-content]')!, doc);
    windows.set(element.dataset.window!, { id: element.dataset.window!, element, path: doc.path, title: doc.title, closed: false, minimized: false, maximized: false, rect: { x: 30, y: 30, width: 500, height: 420 } });
  });

  function configureTitlebar(win: WorkspaceWindow): void {
    const header = win.element.querySelector<HTMLElement>('[data-drag-handle]')!;
    header.tabIndex = 0;
    header.setAttribute('role', 'group');
    header.setAttribute('aria-label', `${win.title} window title bar`);
    header.setAttribute('aria-describedby', 'window-keyboard-help');
    header.title = 'Drag to move. Keyboard: arrows move; Shift+arrows resize; Enter maximizes.';
  }
  windows.forEach(configureTitlebar);

  desktop.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    const command = target.closest<HTMLElement>('[data-command]');
    if (command) { event.preventDefault(); executeCommand(command.dataset.command!, true); return; }
    const insert = target.closest<HTMLElement>('[data-insert-command]');
    if (insert) { input.value = insert.dataset.insertCommand!; focusWindow('terminal', true); return; }
    const task = target.closest<HTMLElement>('[data-task]');
    if (task) {
      const id = task.dataset.task!;
      if (windows.has(id)) focusWindow(id, true);
      else {
        const doc = documents.find((item) => idFor(item.path) === id);
        if (doc) openDocument(doc.path);
      }
      return;
    }
    if (target.closest('#reset-desktop')) { resetDesktop(); return; }
    const control = target.closest<HTMLElement>('[data-window-action]');
    if (control) {
      const id = control.closest<HTMLElement>('[data-window]')?.dataset.window;
      const win = id ? windows.get(id) : undefined;
      if (!win) return;
      if (control.dataset.windowAction === 'maximize') toggleMaximize(win);
      else closeWindow(win, control.dataset.windowAction === 'minimize');
      return;
    }
    const reveal = target.closest<HTMLButtonElement>('[data-reveal-email]');
    if (reveal) {
      const container = reveal.closest<HTMLElement>('[data-contact-actions]')!;
      const mail = document.createElement('a');
      mail.className = 'contact-action';
      mail.href = 'mailto:' + atob(encodedEmail);
      mail.textContent = atob(encodedEmail);
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'contact-action';
      copy.dataset.copyEmail = '';
      copy.textContent = 'Copy';
      reveal.replaceWith(mail, copy);
      container.querySelector<HTMLElement>('.contact-status')!.textContent = 'Email revealed. Click the address to write, or copy it.';
      mail.focus();
      return;
    }
    const copy = target.closest<HTMLElement>('[data-copy-email]');
    if (copy) {
      const status = copy.closest<HTMLElement>('[data-contact-actions]')!.querySelector<HTMLElement>('.contact-status')!;
      try { await navigator.clipboard.writeText(atob(encodedEmail)); status.textContent = 'Copied to clipboard.'; }
      catch { status.textContent = 'Copy was unavailable. Select the address to copy it manually.'; }
    }
  });

  form.addEventListener('submit', (event) => { event.preventDefault(); executeCommand(input.value); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      const completion = completeInput(input.value, cwd, documents);
      if (completion.candidates.length) {
        event.preventDefault();
        input.value = completion.value;
        if (completion.candidates.length > 1) { appendText(completion.candidates.join('  '), 'muted'); output.scrollTop = output.scrollHeight; announce(completion.candidates.join(', ')); }
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex === history.length) historyDraft = input.value;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? input.value;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? historyDraft;
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') { event.preventDefault(); output.replaceChildren(); }
    else if (event.ctrlKey && event.key.toLowerCase() === 'c') { event.preventDefault(); echoCommand(input.value + '^C'); input.value = ''; output.scrollTop = output.scrollHeight; }
    else if (event.key === 'Escape') { input.value = ''; }
  });

  area.addEventListener('pointerdown', (event) => {
    const target = event.target as HTMLElement;
    const element = target.closest<HTMLElement>('[data-window]');
    const win = element ? windows.get(element.dataset.window!) : undefined;
    if (!win || event.button !== 0) return;
    focusWindow(win.id);
    const resize = !!target.closest('[data-resize-handle]');
    const drag = !!target.closest('[data-drag-handle]') && !target.closest('button, a');
    if (compact() || win.maximized || (!resize && !drag)) return;
    event.preventDefault();
    const initial = { ...bounds(win.rect) };
    const startX = event.clientX;
    const startY = event.clientY;
    const handle = resize ? target.closest<HTMLElement>('[data-resize-handle]')! : target.closest<HTMLElement>('[data-drag-handle]')!;
    handle.setPointerCapture(event.pointerId);
    desktop.classList.add('is-manipulating');
    const move = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      win.rect = bounds(resize ? { ...initial, width: initial.width + dx, height: initial.height + dy } : { ...initial, x: initial.x + dx, y: initial.y + dy });
      applyRect(win);
    };
    const stop = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', stop);
      handle.removeEventListener('pointercancel', stop);
      desktop.classList.remove('is-manipulating');
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  });
  area.addEventListener('dblclick', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-drag-handle]') || target.closest('button')) return;
    const id = target.closest<HTMLElement>('[data-window]')?.dataset.window;
    if (id && windows.has(id)) toggleMaximize(windows.get(id)!);
  });
  area.addEventListener('keydown', (event) => {
    const header = event.target as HTMLElement;
    if (!header.matches('[data-drag-handle]') || compact()) return;
    const win = windows.get(header.closest<HTMLElement>('[data-window]')!.dataset.window!)!;
    if (event.key === 'Enter') { event.preventDefault(); toggleMaximize(win); return; }
    if (win.maximized) return;
    if (event.key === 'Home') {
      event.preventDefault();
      win.rect = bounds({ ...win.rect, x: (area.clientWidth - win.rect.width) / 2, y: (area.clientHeight - win.rect.height) / 2 });
      applyRect(win);
      announce(`${win.title} centered.`);
      return;
    }
    const delta: Record<string, [number, number]> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    const change = delta[event.key];
    if (!change) return;
    event.preventDefault();
    const rect = bounds(win.rect);
    win.rect = bounds(event.shiftKey ? { ...rect, width: rect.width + change[0], height: rect.height + change[1] } : { ...rect, x: rect.x + change[0], y: rect.y + change[1] });
    applyRect(win);
    announce(event.shiftKey ? `${win.title}: ${Math.round(win.rect.width)} by ${Math.round(win.rect.height)} pixels.` : `${win.title} moved.`);
  });
  desktop.addEventListener('focusin', (event) => {
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-window]');
    if (element && element.dataset.window !== activeId) focusWindow(element.dataset.window!);
  });

  function measureTerminal(): void {
    const cell = document.querySelector('#cell-measure')!.getBoundingClientRect().width || 8.4;
    const lineHeight = parseFloat(getComputedStyle(output).fontSize) * 1.8;
    dimensions = { columns: Math.max(10, Math.floor(output.clientWidth / cell)), rows: Math.max(3, Math.floor(output.clientHeight / lineHeight)) };
    document.querySelector('#terminal-dimensions')!.textContent = `${dimensions.columns} × ${dimensions.rows}`;
  }
  new ResizeObserver(measureTerminal).observe(output);
  document.fonts.ready.then(measureTerminal);
  window.addEventListener('resize', () => {
    windows.forEach(applyRect);
    syncWindows();
    measureTerminal();
  });
  const readHash = () => {
    if (!window.location.hash || window.location.hash === '#') { focusWindow('terminal', true); return; }
    if (!window.location.hash.startsWith('#file=')) return;
    try { openDocument(decodeURIComponent(window.location.hash.slice(6)), false); } catch { /* An invalid fragment leaves the usable desktop in place. */ }
  };
  window.addEventListener('popstate', readHash);
  window.addEventListener('hashchange', readHash);
  const initialHash = window.location.hash;
  resetDesktop(false);
  if (initialHash) {
    window.history.replaceState(null, '', initialHash);
    readHash();
  }
  measureTerminal();
}
