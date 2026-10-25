import { resolvePath } from '../terminal/engine';

/** Authored Markdown is rendered as nodes, never inserted as HTML. */
function appendInline(parent: HTMLElement, text: string, sourcePath: string): void {
  const tokens = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(tokens)) {
    const index = match.index!;
    parent.append(document.createTextNode(text.slice(cursor, index)));
    if (match[1]) {
      const href = match[2];
      if (/^https:\/\//i.test(href)) {
        const link = document.createElement('a');
        link.textContent = match[1];
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        parent.append(link);
      } else if (!/^[a-z][a-z\d+.-]*:/i.test(href) && !href.startsWith('//')) {
        const path = resolvePath(href, sourcePath.slice(0, sourcePath.lastIndexOf('/')));
        const link = document.createElement('a');
        link.textContent = match[1];
        link.href = `#file=${encodeURIComponent(path)}`;
        link.dataset.command = `open "${path}"`;
        parent.append(link);
      } else parent.append(document.createTextNode(match[1]));
    } else {
      const element = document.createElement(match[3] ? 'code' : 'strong');
      element.textContent = match[3] ?? match[4];
      parent.append(element);
    }
    cursor = index + match[0].length;
  }
  parent.append(document.createTextNode(text.slice(cursor)));
}

export function renderMarkdown(markdown: string, sourcePath: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (line.startsWith('```')) {
      const code = document.createElement('pre');
      const contents: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith('```')) contents.push(lines[index++]);
      code.textContent = contents.join('\n');
      fragment.append(code);
      index++;
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const element = document.createElement(`h${heading[1].length + 1}`);
      appendInline(element, heading[2], sourcePath);
      fragment.append(element);
      index++;
      continue;
    }
    if (/^---+$/.test(line.trim())) { fragment.append(document.createElement('hr')); index++; continue; }
    if (/^[-*]\s/.test(line)) {
      const list = document.createElement('ul');
      while (index < lines.length && /^[-*]\s/.test(lines[index])) {
        const item = document.createElement('li');
        appendInline(item, lines[index++].slice(2), sourcePath);
        list.append(item);
      }
      fragment.append(list);
      continue;
    }
    const paragraph = document.createElement('p');
    const contents: string[] = [line];
    index++;
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|[-*]\s|```|---+$)/.test(lines[index])) contents.push(lines[index++]);
    appendInline(paragraph, contents.join(' '), sourcePath);
    fragment.append(paragraph);
  }
  return fragment;
}
