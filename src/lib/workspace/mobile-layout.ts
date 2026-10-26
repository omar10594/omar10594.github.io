import type { WindowRect } from './window-model.ts';

export interface MobileLayout {
  terminal: WindowRect;
  document: WindowRect;
  full: boolean;
  fraction: number;
}

/** A bottom terminal and optional document share the available mobile work area. */
export function getMobileLayout(
  areaWidth: number,
  areaHeight: number,
  terminalFraction: number,
  hasDocument: boolean,
): MobileLayout {
  const width = Number.isFinite(areaWidth) ? Math.max(0, areaWidth) : 0;
  const height = Number.isFinite(areaHeight) ? Math.max(0, areaHeight) : 0;
  const requestedFraction = Number.isNaN(terminalFraction) ? .34 : Math.max(0, Math.min(1, terminalFraction));
  if (!hasDocument || requestedFraction >= .96 || height < 150) {
    return {
      terminal: { x: 0, y: 0, width, height },
      document: { x: 0, y: 0, width, height: 0 },
      full: true,
      fraction: 1,
    };
  }

  const minimumTerminal = Math.min(150, height * .7);
  const minimumDocument = Math.min(100, height * .25);
  // When the keyboard leaves very little height, reduce the gap before either view.
  const gap = Math.min(8, Math.max(0, height - minimumTerminal - minimumDocument));
  const maximumTerminal = Math.max(minimumTerminal, height - minimumDocument - gap);
  const terminalHeight = Math.min(maximumTerminal, Math.max(minimumTerminal, height * requestedFraction));
  return {
    terminal: { x: 0, y: height - terminalHeight, width, height: terminalHeight },
    document: { x: 0, y: 0, width, height: Math.max(0, height - terminalHeight - gap) },
    full: false,
    fraction: height ? terminalHeight / height : 1,
  };
}
