/** A read-only virtual workspace. No visitor input is evaluated or executed. */
export const HOME = '/home/omar';

export interface WorkspaceDocument {
  path: string;
  title: string;
  content: string;
  kind?: 'document' | 'contact' | 'projects';
}

export interface DirectoryEntry {
  name: string;
  path: string;
  directory: boolean;
}

export type TerminalBlock =
  | { type: 'text'; text: string; tone?: 'muted' | 'error' | 'success' }
  | { type: 'listing'; path: string; entries: DirectoryEntry[]; long: boolean }
  | { type: 'document'; path: string }
  | { type: 'welcome' }
  | { type: 'help'; command?: string };

export type TerminalAction =
  | { type: 'open'; path: string }
  | { type: 'clear' }
  | { type: 'reset' }
  | { type: 'windows' }
  | { type: 'close'; target?: string };

/** A future adapter can handle this envelope, but no adapter is connected. */
export interface UnsupportedCommand {
  input: string;
  cwd: string;
  columns: number;
  reason: 'unknown-command' | 'shell-syntax' | 'unsupported-option';
}

export interface TerminalContext {
  cwd: string;
  previousCwd?: string;
  columns: number;
  documents: readonly WorkspaceDocument[];
}

export interface CommandResult {
  cwd: string;
  previousCwd?: string;
  blocks: TerminalBlock[];
  actions: TerminalAction[];
  unsupported?: UnsupportedCommand;
}

export interface CompletionResult {
  value: string;
  candidates: string[];
}

export const COMMANDS = [
  'info', 'help', 'pwd', 'ls', 'll', 'cd', 'cat', 'open', 'clear', 'reset', 'windows', 'close', '..', '...',
] as const;

export const COMMAND_HELP: Record<string, string> = {
  info: 'info                 Print the welcome screen.',
  help: 'help [command]       Show the available commands.',
  pwd: 'pwd                  Show the current directory.',
  ls: 'ls [-a] [-l] [path]  List a directory; click a file to open it.',
  ll: 'll [-a] [path]       Long listing, like ls -l.',
  cd: 'cd [path]            Change directory. ~ is home; - is the previous directory.',
  cat: 'cat <file> [...]     Read Markdown inside the terminal.',
  open: 'open <file|folder>   Open a document in its own window.',
  clear: 'clear                Clear terminal output. Use info to bring the welcome back.',
  reset: 'reset                Restore the initial desktop.',
  windows: 'windows              Show the open windows.',
  close: 'close [window]       Close a named window, or the terminal.',
  '..': '..                   Go up one directory (cd ..).',
  '...': '...                  Go up two directories (cd ../..).',
};

export function resolvePath(path: string, cwd = HOME): string {
  let expanded = path === '~' ? HOME : path.startsWith('~/') ? HOME + path.slice(1) : path;
  if (!expanded.startsWith('/')) expanded = `${cwd}/${expanded}`;
  const segments: string[] = [];
  for (const segment of expanded.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') segments.pop();
    else segments.push(segment);
  }
  return '/' + segments.join('/');
}

function documentAt(path: string, documents: readonly WorkspaceDocument[]): WorkspaceDocument | undefined {
  return documents.find((document) => resolvePath(document.path) === path);
}

export function isDirectory(path: string, documents: readonly WorkspaceDocument[]): boolean {
  const normalized = resolvePath(path);
  if (normalized === '/' || normalized === '/home' || normalized === HOME) return true;
  return documents.some((document) => resolvePath(document.path).startsWith(`${normalized}/`));
}

export function getDirectoryEntries(
  path: string,
  documents: readonly WorkspaceDocument[],
  includeHidden = false,
): DirectoryEntry[] {
  const normalized = resolvePath(path);
  const prefix = normalized === '/' ? '/' : normalized + '/';
  const entries = new Map<string, DirectoryEntry>();
  // The virtual home remains navigable even when a content set is empty.
  const paths = [HOME + '/', ...documents.map((document) => resolvePath(document.path))];
  for (const candidate of paths) {
    if (!candidate.startsWith(prefix)) continue;
    const rest = candidate.slice(prefix.length);
    const name = rest.split('/')[0];
    if (!name || (!includeHidden && name.startsWith('.'))) continue;
    const directory = rest.includes('/');
    entries.set(name, { name, path: prefix + name, directory });
  }
  return [...entries.values()].sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name, 'en'));
}

interface Tokenized {
  tokens: string[];
  error?: 'quote' | 'escape' | 'shell';
  openQuote?: boolean;
}

function tokenize(input: string, allowUnclosedQuote = false): Tokenized {
  const tokens: string[] = [];
  let current = '';
  let quote: "'" | '"' | undefined;
  let active = false;
  let escaping = false;
  for (const char of input) {
    if (/[\u0000-\u001f\u007f]/u.test(char)) return { tokens: [], error: 'shell' };
    if (escaping) { current += char; escaping = false; active = true; continue; }
    if (char === '\\' && quote !== "'") { escaping = true; active = true; continue; }
    if (quote) {
      if (char === quote) quote = undefined;
      else current += char;
      active = true;
      continue;
    }
    if (char === "'" || char === '"') { quote = char; active = true; continue; }
    if (/[;&|<>`$]/u.test(char)) return { tokens: [], error: 'shell' };
    if (/\s/u.test(char)) {
      if (active) { tokens.push(current); current = ''; active = false; }
      continue;
    }
    current += char;
    active = true;
  }
  if (escaping && !allowUnclosedQuote) return { tokens: [], error: 'escape' };
  if (quote && !allowUnclosedQuote) return { tokens: [], error: 'quote' };
  if (active) tokens.push(current);
  return { tokens, openQuote: Boolean(quote) };
}

function normalizedColumns(columns: number): number {
  return Number.isFinite(columns) ? Math.min(400, Math.max(8, Math.floor(columns))) : 80;
}

export function runCommand(input: string, context: TerminalContext): CommandResult {
  const cwd = resolvePath(context.cwd || HOME);
  const result: CommandResult = { cwd, previousCwd: context.previousCwd, blocks: [], actions: [] };
  const text = (message: string, tone: 'muted' | 'error' | 'success' = 'error') => {
    result.blocks.push({ type: 'text', text: message, tone });
    return result;
  };
  const unsupported = (reason: UnsupportedCommand['reason'], message: string) => {
    result.unsupported = { input, cwd, columns: normalizedColumns(context.columns), reason };
    return text(message);
  };
  if (input.length > 2048) return text('That input is too long. Keep commands under 2,048 characters.');
  if (!input.trim()) return result;
  const parsed = tokenize(input.trim());
  if (parsed.error === 'shell') {
    return unsupported('shell-syntax', 'This workspace supports one local command at a time. Pipes, substitutions and shell operators are not available. Type help to explore.');
  }
  if (parsed.error === 'quote') return text('An opening quote is missing its closing quote. Close it and try again.');
  if (parsed.error === 'escape') return text('The final backslash needs a character after it.');
  const [rawCommand, ...args] = parsed.tokens;
  if (!rawCommand) return result;
  const command = rawCommand;
  const { documents } = context;
  const usage = (name: string) => text(`Usage: ${COMMAND_HELP[name] || name}`, 'muted');
  const missing = (name: string) => text(`No such file or directory: ${name}. Try ls to see what is here.`);

  if (command === 'help') {
    if (args.length > 1) return usage('help');
    if (args[0] && !Object.hasOwn(COMMAND_HELP, args[0])) return text(`No local help for ${args[0]}. Type help to see the supported commands.`);
    result.blocks.push({ type: 'help', ...(args[0] ? { command: args[0] } : {}) });
    return result;
  }
  if (command === 'info') {
    if (args.length) return usage('info');
    result.blocks.push({ type: 'welcome' });
    return result;
  }
  if (command === 'pwd') {
    if (args.length) return usage('pwd');
    return text(cwd, 'muted');
  }
  if (command === 'clear' || command === 'reset' || command === 'windows') {
    if (args.length) return usage(command);
    result.actions.push({ type: command });
    return result;
  }
  if (command === 'close') {
    if (args.length > 1) return usage('close');
    result.actions.push({ type: 'close', ...(args[0] ? { target: args[0] } : {}) });
    return result;
  }
  if (command === 'cd' || command === '..' || command === '...') {
    if (args.length > (command === 'cd' ? 1 : 0)) return usage(command);
    const destination = command === '..' ? '..' : command === '...' ? '../..' : args[0] ?? '~';
    if (destination === '-' && !context.previousCwd) return text('There is no previous directory yet.');
    const path = destination === '-' ? resolvePath(context.previousCwd!) : resolvePath(destination, cwd);
    if (!isDirectory(path, documents)) {
      return documentAt(path, documents) ? text(`Not a directory: ${destination}. Use cat or open to read it.`) : missing(destination);
    }
    result.cwd = path;
    result.previousCwd = cwd;
    return result;
  }
  if (command === 'ls' || command === 'll') {
    let includeHidden = false;
    let long = command === 'll';
    let endOptions = false;
    const paths: string[] = [];
    for (const arg of args) {
      if (arg === '--' && !endOptions) { endOptions = true; continue; }
      if (!endOptions && arg.startsWith('-')) {
        if (!/^-[al]+$/u.test(arg)) return unsupported('unsupported-option', `Unsupported ${command} option: ${arg}. Available options are -a and -l.`);
        includeHidden ||= arg.includes('a');
        long ||= arg.includes('l');
      } else paths.push(arg);
    }
    const requested = paths.length ? paths : ['.'];
    for (const requestedPath of requested) {
      const path = resolvePath(requestedPath, cwd);
      const document = documentAt(path, documents);
      if (document) {
        result.blocks.push({ type: 'listing', path, entries: [{ name: path.split('/').pop()!, path, directory: false }], long });
      } else if (isDirectory(path, documents)) {
        const entries = getDirectoryEntries(path, documents, includeHidden);
        if (includeHidden) entries.unshift(
          { name: '.', path, directory: true },
          { name: '..', path: resolvePath('..', path), directory: true },
        );
        result.blocks.push({ type: 'listing', path, entries, long });
      } else result.blocks.push({ type: 'text', text: `No such file or directory: ${requestedPath}. Try ls.`, tone: 'error' });
    }
    return result;
  }
  if (command === 'cat' || command === 'open') {
    if (!args.length) return usage(command);
    for (const argument of args) {
      const path = resolvePath(argument, cwd);
      const resolved = command === 'open' && isDirectory(path, documents)
        ? documentAt(`${path === '/' ? '' : path}/README.md`, documents)
        : documentAt(path, documents);
      if (resolved) {
        if (command === 'cat') result.blocks.push({ type: 'document', path: resolvePath(resolved.path) });
        else result.actions.push({ type: 'open', path: resolvePath(resolved.path) });
      } else if (isDirectory(path, documents)) {
        if (command === 'open') result.blocks.push({ type: 'listing', path, entries: getDirectoryEntries(path, documents), long: false });
        else result.blocks.push({ type: 'text', text: `${argument} is a directory. Use ls ${argument} to explore it.`, tone: 'error' });
      } else result.blocks.push({ type: 'text', text: `No such file or directory: ${argument}. Try ls.`, tone: 'error' });
    }
    return result;
  }
  return unsupported('unknown-command', `Command not found: ${command}. This is a small portfolio workspace. Type help, or click a path to explore.`);
}

function quoteCompletion(path: string): string {
  return /\s|[;&|<>`$'"\\]/u.test(path) ? '"' + path.replace(/["\\]/gu, '\\$&') + '"' : path;
}

/** Completes one command or path; it never invokes runCommand or a service. */
export function completeInput(input: string, cwd: string, documents: readonly WorkspaceDocument[]): CompletionResult {
  const parsed = tokenize(input.trimStart(), true);
  if (parsed.error) return { value: input, candidates: [] };
  const tokens = parsed.tokens;
  const hasTrailingSpace = /\s$/u.test(input) && !parsed.openQuote;
  if (!tokens.length || (tokens.length === 1 && !hasTrailingSpace)) {
    const prefix = tokens[0] ?? '';
    const candidates = COMMANDS.filter((command) => command.startsWith(prefix));
    return { value: candidates.length === 1 ? `${candidates[0]} ` : input, candidates: [...candidates] };
  }
  const command = tokens[0];
  if (!['cd', 'ls', 'll', 'cat', 'open'].includes(command)) return { value: input, candidates: [] };
  const fragment = hasTrailingSpace ? '' : tokens[tokens.length - 1];
  if (fragment.startsWith('-')) return { value: input, candidates: [] };
  const slashIndex = fragment.lastIndexOf('/');
  const parentFragment = slashIndex >= 0 ? fragment.slice(0, slashIndex + 1) : '';
  const basename = slashIndex >= 0 ? fragment.slice(slashIndex + 1) : fragment;
  const parentPath = fragment === '~' ? HOME : resolvePath(parentFragment || '.', cwd);
  const entries = getDirectoryEntries(parentPath, documents, basename.startsWith('.'))
    .filter((entry) => entry.name.startsWith(basename) && (command !== 'cd' || entry.directory));
  const candidates = entries.map((entry) => `${parentFragment}${entry.name}${entry.directory ? '/' : ''}`);
  if (fragment === '~') return { value: input.slice(0, input.lastIndexOf('~')) + '~/', candidates: ['~/'] };
  if (candidates.length !== 1) return { value: input, candidates };
  const candidate = candidates[0];
  const completedTokens = hasTrailingSpace ? tokens : tokens.slice(0, -1);
  const prefix = completedTokens.map(quoteCompletion).join(' ');
  return { value: `${prefix} ${quoteCompletion(candidate)}${entries[0].directory ? '' : ' '}`, candidates };
}
