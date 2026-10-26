import { completeInput, type WorkspaceDocument } from './engine.ts';

/** Full ghost-text completion, only when it can extend the input unchanged. */
export function getInlineSuggestion(input: string, cwd: string, documents: readonly WorkspaceDocument[]): string {
  if (input === '') return 'help';
  const completion = completeInput(input, cwd, documents);
  if (completion.candidates.length !== 1 || !completion.value.startsWith(input)) return '';
  return /\S/u.test(completion.value.slice(input.length)) ? completion.value : '';
}
