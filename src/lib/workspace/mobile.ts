import { documents, encodedEmail } from './content';
import { renderMarkdown } from './markdown';
import { projects, projectDocumentPath, projectRoute } from '../../features/projects/registry';
import {
  backTarget,
  CV_PATH,
  hashForRoute,
  hrefForPath,
  PROJECTS_PATH,
  routeForPath,
  routeFromHash,
  type MobileRoute,
} from './mobile-route';

const SVG_NS = 'http://www.w3.org/2000/svg';
type FocusMode = 'none' | 'content' | 'preserve';

const ICON_PATHS: Record<string, string[]> = {
  projects: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M3 10h18'],
  about: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  cv: ['M7 3h7l4 4v14H7Z', 'M14 3v4h4', 'M10 12h5', 'M10 16h5'],
  contact: ['M3 6h18v12H3Z', 'm3 7 9 7 9-7'],
  chevron: ['m9 5 7 7-7 7'],
  playbusiness: ['M4 19V5', 'M4 19h16', 'M8 15l3-4 3 2 5-7'],
  sosimple: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c2.6 3 2.6 15 0 18', 'M12 3c-2.6 3-2.6 15 0 18'],
  'miss-luciana': ['M3 9l9-5 9 5-9 5-9-5Z', 'M7 11v5c3 2 7 2 10 0v-5'],
  horarios: ['M5 5h14v15H5Z', 'M9 3v4', 'M15 3v4', 'M5 10h14', 'M9 14h2', 'M9 17h5'],
  roomies: ['M4 11l8-7 8 7', 'M6 10v9h12v-9', 'M10 19v-5h4v5'],
  default: ['M4 5h16v14H4Z', 'M4 9h16'],
};

const PROJECT_IMAGES: Record<string, string> = {
  playbusiness: '/projects/playbusiness/logo.svg',
  sosimple: '/projects/sosimple/icon.svg',
  'miss-luciana': '/projects/miss-luciana/icon.svg',
  horarios: '/projects/horarios/icon.svg',
};

const initializedRoots = new WeakSet<HTMLElement>();

interface MobileApp {
  recover(): void;
}

interface HistoryEntry {
  id: number;
  key: string;
  scroll: number;
}

interface RenderOptions {
  animate: boolean;
  focus: FocusMode;
  restore: boolean;
}

/** Called from the Astro script. Does nothing until the mobile breakpoint matches. */
export function initializeMobileWorkspace(): void {
  const root = document.getElementById('mobile-workspace');
  if (!(root instanceof HTMLElement) || initializedRoots.has(root)) return;
  initializedRoots.add(root);

  const query = window.matchMedia('(max-width: 700px)');
  let app: MobileApp | null = null;
  const sync = (): void => {
    if (!query.matches) return;
    if (app) app.recover();
    else app = createMobileApp(root, query);
  };

  query.addEventListener('change', sync);
  if (query.matches) sync();
}

function createMobileApp(root: HTMLElement, query: MediaQueryList): MobileApp {
  const titleNode = root.querySelector<HTMLElement>('#mobile-title');
  const pathNode = root.querySelector<HTMLElement>('#mobile-path');
  const backNode = root.querySelector<HTMLElement>('#mobile-back');
  const homeNode = root.querySelector<HTMLElement>('#mobile-home');
  const navNode = root.querySelector<HTMLElement>('#mobile-nav');
  const contentNode = root.querySelector<HTMLElement>('#mobile-content');
  const announcerNode = root.querySelector<HTMLElement>('#mobile-announcer');

  if (!titleNode || !pathNode || !backNode || !homeNode || !navNode || !contentNode || !announcerNode) {
    return { recover: () => undefined };
  }

  const titleElement = titleNode;
  const pathElement = pathNode;
  const backElement = backNode;
  const homeElement = homeNode;
  const navElement = navNode;
  const content = contentNode;
  const announcer = announcerNode;

  const homeSource = content.querySelector<HTMLElement>('.mobile-home');
  let currentRoute = routeFromHash(window.location.hash);
  let currentKey = currentRoute.key;
  let nextEntryId = 1;
  let entries: HistoryEntry[] = [{ id: nextEntryId++, key: currentKey, scroll: 0 }];
  let cursor = 0;
  let renderedEntryId: number | null = null;
  let pendingHistoryFocus: FocusMode = 'preserve';
  let projectTimer: number | null = null;
  let announcedTitle = '';
  let cachedEmail: string | null = null;

  markEntry(entries[0].id, currentKey, true);
  renderRoute(currentRoute, { animate: false, focus: 'none', restore: false });

  root.addEventListener('click', (event) => {
    if (!query.matches || event.defaultPrevented) return;
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) return;

    const actionElement = eventTarget.closest<HTMLElement>('[data-mobile-action]');
    if (actionElement && root.contains(actionElement)) {
      const action = actionElement.dataset.mobileAction;
      if (action === 'back') {
        event.preventDefault();
        goBack();
        return;
      }
      if (action === 'home') {
        event.preventDefault();
        navigateTo(routeForPath(null), { animate: true, focus: 'content', restore: false });
        return;
      }
      if (action === 'projects') {
        event.preventDefault();
        navigateTo(routeForPath(PROJECTS_PATH), { animate: true, focus: 'content', restore: false });
        return;
      }
      if (action === 'reveal-email') {
        event.preventDefault();
        revealEmail();
        return;
      }
      if (action === 'copy-email') {
        event.preventDefault();
        void copyEmail();
        return;
      }
    }

    const anchor = eventTarget.closest<HTMLAnchorElement>('a[href]');
    if (!anchor || !root.contains(anchor)) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = anchor.getAttribute('href') ?? '';
    if (!href.startsWith('#file=')) return;
    event.preventDefault();
    navigateTo(routeFromHash(href), { animate: true, focus: 'content', restore: false });
  });

  const onHistoryChange = (): void => {
    if (!query.matches) return;
    saveCurrentScroll();
    const route = routeFromHash(window.location.hash);
    const marker = readMarker();
    const index = marker ? entries.findIndex((entry) => entry.id === marker.id) : -1;

    if (index >= 0) {
      cursor = index;
      entries[cursor].key = route.key;
    } else {
      const id = nextEntryId++;
      entries = [{ id, key: route.key, scroll: 0 }];
      cursor = 0;
      markEntry(id, route.key, true);
    }

    const sameEntry = entries[cursor].id === renderedEntryId;
    const focus = pendingHistoryFocus;
    pendingHistoryFocus = 'preserve';
    if (sameEntry && route.key === currentKey) return;
    renderRoute(route, { animate: false, focus, restore: !sameEntry });
  };

  window.addEventListener('popstate', onHistoryChange);
  window.addEventListener('hashchange', onHistoryChange);

  function readMarker(): { id: number; key: string } | null {
    const state: unknown = window.history.state;
    if (!state || typeof state !== 'object' || !('mobileWorkspace' in state)) return null;
    const marker = (state as { mobileWorkspace?: unknown }).mobileWorkspace;
    if (!marker || typeof marker !== 'object') return null;
    const id = (marker as { id?: unknown }).id;
    const key = (marker as { key?: unknown }).key;
    if (typeof id !== 'number' || typeof key !== 'string') return null;
    return { id, key };
  }

  function markEntry(id: number, key: string, replace: boolean, url?: string): boolean {
    try {
      const existing = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      const state = { ...existing, mobileWorkspace: { id, key } };
      if (replace) window.history.replaceState(state, '', url);
      else window.history.pushState(state, '', url);
      return true;
    } catch {
      return false;
    }
  }

  function saveCurrentScroll(): void {
    if (renderedEntryId === null) return;
    const entry = entries.find((item) => item.id === renderedEntryId);
    if (entry) entry.scroll = content.scrollTop;
  }

  function scrollForRoute(key: string): number {
    for (let index = cursor; index >= 0; index--) {
      if (entries[index].key === key) return entries[index].scroll;
    }
    return 0;
  }

  function urlForRoute(route: MobileRoute): string | null {
    const hash = hashForRoute(route);
    if (hash === null) return null;
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    try {
      return new URL(url, window.location.href).href === window.location.href ? null : url;
    } catch {
      return null;
    }
  }

  function pushRoute(route: MobileRoute): boolean {
    const url = urlForRoute(route);
    if (url === null) return false;
    const id = nextEntryId++;
    if (!markEntry(id, route.key, false, url)) return false;
    entries = entries.slice(0, cursor + 1);
    entries.push({ id, key: route.key, scroll: 0 });
    cursor = entries.length - 1;
    return true;
  }

  function navigateTo(route: MobileRoute, options: RenderOptions): void {
    if (!query.matches || route.key === currentKey) return;
    saveCurrentScroll();
    if (!pushRoute(route)) return;
    renderRoute(route, options);
  }

  function goBack(): void {
    if (!query.matches) return;
    if (cursor > 0) {
      saveCurrentScroll();
      pendingHistoryFocus = 'content';
      window.history.back();
      return;
    }

    const target = backTarget(currentRoute);
    if (!target || target.key === currentKey) return;
    saveCurrentScroll();
    replaceWithRoute(target, scrollForRoute(target.key));
  }

  function replaceWithRoute(route: MobileRoute, scroll: number): void {
    const url = urlForRoute(route);
    if (url === null) return;
    const id = nextEntryId++;
    if (!markEntry(id, route.key, true, url)) return;
    entries = [{ id, key: route.key, scroll }];
    cursor = 0;
    renderRoute(route, { animate: false, focus: 'content', restore: true });
  }

  function renderRoute(route: MobileRoute, options: RenderOptions): void {
    const hadFocus = content.contains(document.activeElement);

    currentRoute = route;
    currentKey = route.key;

    titleElement.textContent = route.title;
    pathElement.textContent = route.displayPath;
    const isHome = route.kind === 'home';
    backElement.hidden = isHome;
    homeElement.hidden = isHome;
    navElement.classList.toggle('is-home', isHome);

    if (projectTimer !== null) {
      window.clearTimeout(projectTimer);
      projectTimer = null;
    }

    let isProject = route.kind === 'project';
    let view: HTMLElement;
    try {
      view = buildView(route);
    } catch {
      view = buildNotFoundView('This view could not be opened.');
      isProject = false;
    }

    content.classList.toggle('is-project', isProject);
    if (options.animate && !isProject) view.classList.add('is-entering');
    content.replaceChildren(view);
    content.scrollTop = options.restore ? entries[cursor].scroll : 0;

    if (announcedTitle !== route.title) {
      announcer.textContent = route.title;
      announcedTitle = route.title;
    }

    if (options.focus === 'content' || (options.focus === 'preserve' && hadFocus)) focusContent(view);
    renderedEntryId = entries[cursor].id;
  }

  function buildView(route: MobileRoute): HTMLElement {
    switch (route.kind) {
      case 'home':
        return buildHomeView();
      case 'projects':
        return buildProjectsView();
      case 'project':
        return buildProjectView(route);
      case 'document':
        return buildDocumentView(route);
      case 'not-found':
        return buildNotFoundView();
    }
    return buildNotFoundView();
  }

  function buildHomeView(): HTMLElement {
    if (homeSource) return homeSource.cloneNode(true) as HTMLElement;

    const view = document.createElement('section');
    view.className = 'mobile-view mobile-home';
    const name = document.createElement('h2');
    name.className = 'mobile-home-name';
    name.tabIndex = -1;
    name.textContent = 'Guillermo Omar López López';
    const phrase = document.createElement('p');
    phrase.className = 'mobile-home-line';
    phrase.textContent = 'I build web products and the systems behind them.';
    const links = document.createElement('nav');
    links.className = 'mobile-home-links';
    links.setAttribute('aria-label', 'Portfolio sections');
    links.append(
      makeRow('Projects', 'Selected products and case studies', PROJECTS_PATH, 'projects', true),
      makeRow('About', 'How I work and what I value', '/home/omar/about.md', 'about'),
      makeRow('CV', 'Experience, education and skills', CV_PATH, 'cv'),
      makeRow('Contact', 'Email, GitHub and LinkedIn', '/home/omar/contact.md', 'contact'),
    );
    view.append(name, phrase, links);
    return view;
  }

  function buildProjectsView(): HTMLElement {
    const view = document.createElement('section');
    view.className = 'mobile-view mobile-projects';
    const heading = document.createElement('h2');
    heading.className = 'mobile-view-title';
    heading.tabIndex = -1;
    heading.textContent = 'Projects';
    const intro = document.createElement('p');
    intro.className = 'mobile-projects-intro';
    intro.textContent = 'Selected products, tools and the systems behind them.';
    const list = document.createElement('nav');
    list.className = 'mobile-project-list';
    list.setAttribute('aria-label', 'Projects');

    for (const project of projects) {
      const row = document.createElement('a');
      row.className = 'mobile-row mobile-project-row';
      row.href = hrefForPath(projectDocumentPath(project.id));

      const icon = document.createElement('span');
      icon.className = 'mobile-row-icon mobile-project-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.append(projectIcon(project.id));

      const copy = document.createElement('span');
      copy.className = 'mobile-row-copy';
      const name = document.createElement('span');
      name.className = 'mobile-row-title';
      name.textContent = project.title;
      const summary = document.createElement('span');
      summary.className = 'mobile-row-subtitle';
      summary.textContent = project.summary;
      copy.append(name, summary);

      row.append(icon, copy, makeIcon('chevron', 'mobile-chevron'));
      list.append(row);
    }

    view.append(heading, intro, list);
    return view;
  }

  function buildDocumentView(route: MobileRoute): HTMLElement {
    const workspaceDocument = documents.find((item) => item.path === route.path);
    if (!workspaceDocument) return buildNotFoundView();

    const view = document.createElement('section');
    view.className = 'mobile-view mobile-document';
    view.append(renderMarkdown(workspaceDocument.content, workspaceDocument.path));
    for (const link of view.querySelectorAll('a[data-command]')) link.removeAttribute('data-command');
    if (workspaceDocument.kind === 'contact') view.insertBefore(contactActions(), view.querySelector('ul'));
    return view;
  }

  function buildProjectView(route: MobileRoute): HTMLElement {
    const project = projects.find((item) => projectDocumentPath(item.id) === route.path);
    if (!project) return buildNotFoundView();

    const view = document.createElement('section');
    view.className = 'mobile-view mobile-project';
    const heading = document.createElement('h2');
    heading.className = 'mobile-sr-only';
    heading.tabIndex = -1;
    heading.textContent = project.title;

    const bar = document.createElement('div');
    bar.className = 'mobile-project-bar';
    const status = document.createElement('p');
    status.className = 'mobile-project-status';
    status.setAttribute('role', 'status');
    status.textContent = 'Loading project…';
    const fallback = document.createElement('a');
    fallback.className = 'mobile-project-open';
    fallback.href = projectRoute(project.id);
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Open project page';
    bar.append(status, fallback);

    const frame = document.createElement('iframe');
    frame.className = 'mobile-project-frame';
    frame.title = `${project.title} project`;
    frame.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads',
    );
    let loaded = false;
    const timer = window.setTimeout(() => {
      if (!loaded) status.textContent = 'Still loading…';
    }, 8000);
    projectTimer = timer;
    frame.addEventListener('load', () => {
      loaded = true;
      if (projectTimer === timer) {
        window.clearTimeout(timer);
        projectTimer = null;
      }
      status.textContent = '';
    });
    frame.addEventListener('error', () => {
      loaded = true;
      if (projectTimer === timer) {
        window.clearTimeout(timer);
        projectTimer = null;
      }
      status.textContent = 'Could not load the project in this view.';
    });
    frame.src = projectRoute(project.id);

    view.append(heading, bar, frame);
    return view;
  }

  function buildNotFoundView(message = 'That page is not part of the mobile workspace.'): HTMLElement {
    const view = document.createElement('section');
    view.className = 'mobile-view mobile-not-found';
    const heading = document.createElement('h2');
    heading.className = 'mobile-view-title';
    heading.tabIndex = -1;
    heading.textContent = 'Not found';
    const copy = document.createElement('p');
    copy.textContent = message;
    const actions = document.createElement('div');
    actions.className = 'mobile-not-found-actions';

    const home = document.createElement('a');
    home.href = '/';
    home.dataset.mobileAction = 'home';
    home.textContent = 'Go home';
    const projectsLink = document.createElement('a');
    projectsLink.href = hrefForPath(PROJECTS_PATH);
    projectsLink.dataset.mobileAction = 'projects';
    projectsLink.textContent = 'View projects';
    actions.append(home, projectsLink);

    view.append(heading, copy, actions);
    return view;
  }

  function contactActions(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-contact-actions';

    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.id = 'mobile-contact-reveal';
    reveal.className = 'mobile-contact-action';
    reveal.dataset.mobileAction = 'reveal-email';
    reveal.textContent = 'Reveal email';

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.id = 'mobile-contact-copy';
    copy.className = 'mobile-contact-action';
    copy.dataset.mobileAction = 'copy-email';
    copy.textContent = 'Copy email';

    const output = document.createElement('a');
    output.id = 'mobile-contact-output';
    output.className = 'mobile-contact-output';
    output.hidden = true;

    const status = document.createElement('p');
    status.id = 'mobile-contact-status';
    status.className = 'mobile-contact-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    wrapper.append(reveal, copy, output, status);
    return wrapper;
  }

  function makeRow(title: string, subtitle: string, path: string, icon: string, primary = false): HTMLAnchorElement {
    const row = document.createElement('a');
    row.className = primary ? 'mobile-row mobile-row-primary' : 'mobile-row';
    row.href = hrefForPath(path);
    const iconBox = document.createElement('span');
    iconBox.className = 'mobile-row-icon';
    iconBox.setAttribute('aria-hidden', 'true');
    iconBox.append(makeIcon(icon));
    const copy = document.createElement('span');
    copy.className = 'mobile-row-copy';
    const name = document.createElement('span');
    name.className = 'mobile-row-title';
    name.textContent = title;
    const summary = document.createElement('span');
    summary.className = 'mobile-row-subtitle';
    summary.textContent = subtitle;
    copy.append(name, summary);
    row.append(iconBox, copy, makeIcon('chevron', 'mobile-chevron'));
    return row;
  }

  function projectIcon(id: string): Node {
    const source = PROJECT_IMAGES[id];
    if (!source) return makeIcon(id);

    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.className = 'mobile-project-mark';
    const fallback = makeIcon(id);
    fallback.setAttribute('class', 'mobile-project-fallback-icon');
    fallback.setAttribute('hidden', '');
    img.addEventListener('error', () => {
      img.hidden = true;
      fallback.removeAttribute('hidden');
    });
    img.src = source;
    const box = document.createElement('span');
    box.className = 'mobile-project-asset';
    box.append(img, fallback);
    return box;
  }

  function makeIcon(name: string, className = 'mobile-icon'): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', className);
    for (const path of ICON_PATHS[name] ?? ICON_PATHS.default) {
      const shape = document.createElementNS(SVG_NS, 'path');
      shape.setAttribute('d', path);
      svg.append(shape);
    }
    return svg;
  }

  function focusContent(view: HTMLElement): void {
    const heading = view.querySelector<HTMLElement>('h1, h2, h3, h4');
    const target = heading ?? view;
    if (!heading) view.tabIndex = -1;
    else heading.setAttribute('tabindex', '-1');
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  }

  function decodeEmail(): string | null {
    if (cachedEmail) return cachedEmail;
    try {
      const decoded = window.atob(encodedEmail).trim();
      if (!decoded || !decoded.includes('@')) return null;
      cachedEmail = decoded;
      return decoded;
    } catch {
      return null;
    }
  }

  function setContactStatus(message: string): void {
    const status = root.querySelector<HTMLElement>('#mobile-contact-status');
    if (status) status.textContent = message;
  }

  function showEmail(email: string): void {
    const output = root.querySelector<HTMLAnchorElement>('#mobile-contact-output');
    if (output) {
      output.textContent = email;
      output.href = `mailto:${email}`;
      output.hidden = false;
    }
    const reveal = root.querySelector<HTMLElement>('#mobile-contact-reveal');
    if (reveal) reveal.hidden = true;
  }

  function revealEmail(): void {
    const email = decodeEmail();
    if (!email) {
      setContactStatus('Email address unavailable.');
      return;
    }
    showEmail(email);
    const output = root.querySelector<HTMLAnchorElement>('#mobile-contact-output');
    if (output) output.focus({ preventScroll: true });
    setContactStatus('Email revealed.');
  }

  async function copyEmail(): Promise<void> {
    const email = decodeEmail();
    if (!email) {
      setContactStatus('Email address unavailable.');
      return;
    }
    showEmail(email);
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(email);
      setContactStatus('Email copied.');
    } catch {
      setContactStatus('Copy unavailable. Select the address above.');
    }
  }

  function recover(): void {
    if (!query.matches) return;
    pendingHistoryFocus = 'preserve';
    saveCurrentScroll();
    const route = routeFromHash(window.location.hash);
    const marker = readMarker();
    const index = marker ? entries.findIndex((entry) => entry.id === marker.id) : -1;
    let restore = false;

    if (index >= 0) {
      cursor = index;
      const sameKey = entries[cursor].key === route.key;
      if (!sameKey) {
        entries[cursor].key = route.key;
        entries[cursor].scroll = 0;
      }
      restore = sameKey && entries[cursor].id !== renderedEntryId;
    } else {
      const id = nextEntryId++;
      const sameKey = route.key === currentKey;
      entries = [{ id, key: route.key, scroll: sameKey ? content.scrollTop : 0 }];
      cursor = 0;
      markEntry(id, route.key, true);
      restore = sameKey;
    }

    if (route.key === currentKey && entries[cursor].id === renderedEntryId) return;
    renderRoute(route, { animate: false, focus: 'preserve', restore });
  }

  return { recover };
}
