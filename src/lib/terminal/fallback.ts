import type { UnsupportedCommand } from './engine';

/** The future model is an optional text-output adapter, independent of the shell. */
export interface UnsupportedInputRequest extends UnsupportedCommand {
  rows: number;
  publicFiles: readonly { path: string; title: string }[];
}

export interface CharacterReply {
  lines: readonly { text: string; tone?: 'default' | 'muted' | 'accent' }[];
}

export type UnsupportedInputAdapter = (
  request: UnsupportedInputRequest,
  signal: AbortSignal,
) => Promise<CharacterReply | null>;

// Disconnected in phase 1. No browser credentials or model request.
export const unsupportedInputAdapter: UnsupportedInputAdapter | undefined = undefined;
