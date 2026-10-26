export interface WindowRect { x: number; y: number; width: number; height: number; }

/** Document identity follows the canonical virtual path, not its basename. */
export function windowIdForDocumentPath(path: string): string {
  const shortcuts: Record<string, string> = {
    '/home/omar/about.md': 'about',
    '/home/omar/contact.md': 'contact',
    '/home/omar/README.md': 'welcome',
    '/home/omar/cv/README.md': 'cv',
    '/home/omar/projects/README.md': 'projects',
  };
  return shortcuts[path] ?? `file:${encodeURIComponent(path)}`;
}

/** Center a bounded desktop composition, with documents in front of the terminal. */
export function getStartupLayout(areaWidth: number, areaHeight: number): Record<'terminal' | 'about' | 'contact', WindowRect> {
  const width = Math.max(0, areaWidth);
  const height = Math.max(0, areaHeight);
  const fit = (rect: WindowRect): WindowRect => {
    const w = Math.min(width, Math.max(0, rect.width));
    const h = Math.min(height, Math.max(0, rect.height));
    return { x: Math.max(0, Math.min(rect.x, width - w)), y: Math.max(0, Math.min(rect.y, height - h)), width: w, height: h };
  };
  const compositionWidth = Math.min(width, 1320);
  const left = (width - compositionWidth) / 2;
  const right = left + compositionWidth;
  const aboutWidth = Math.min(520, Math.max(440, Math.round(compositionWidth * .4)));
  const contactWidth = Math.min(420, Math.max(390, Math.round(compositionWidth * .31)));
  const contactHeight = Math.min(height, 280, Math.max(180, Math.round(height * .43)));
  const aboutHeight = Math.min(height, 400, Math.max(180, height - contactHeight - 52));
  return {
    terminal: fit({ x: left, y: 0, width: Math.min(1040, Math.max(920, Math.round(compositionWidth * .78))), height: height - 20 }),
    about: fit({ x: right - aboutWidth, y: 12, width: aboutWidth, height: aboutHeight }),
    contact: fit({ x: right - contactWidth, y: height - contactHeight - 12, width: contactWidth, height: contactHeight }),
  };
}
