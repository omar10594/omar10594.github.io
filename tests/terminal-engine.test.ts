import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME, completeInput, getDirectoryEntries, resolvePath, runCommand } from '../src/lib/terminal/engine.ts';
import type { TerminalContext, WorkspaceDocument } from '../src/lib/terminal/engine.ts';

const documents: WorkspaceDocument[] = [
  { path: HOME + '/README.md', title: 'Welcome', content: '# Welcome\nA small workspace.' },
  { path: HOME + '/about.md', title: 'About', content: '# About\nActual Markdown.' },
  { path: HOME + '/contact.md', title: 'Contact', content: '# Contact', kind: 'contact' },
  { path: HOME + '/.notes.md', title: 'Notes', content: '# Notes' },
  { path: HOME + '/projects/README.md', title: 'Projects', content: '# Phase 2', kind: 'projects' },
  { path: HOME + '/notes/build log.md', title: 'Build log', content: '# Build log' },
];
const context: TerminalContext = { cwd: HOME, columns: 82, documents };

test('normalizes relative, absolute and home paths without escaping the virtual root', () => {
  assert.equal(resolvePath('projects/../about.md'), HOME + '/about.md');
  assert.equal(resolvePath('~/projects/./README.md', '/'), HOME + '/projects/README.md');
  assert.equal(resolvePath('../../../../../../'), '/');
  assert.equal(resolvePath(''), HOME);
  assert.equal(resolvePath('/home//omar///about.md/'), HOME + '/about.md');
});

test('lists inferred directories first and hidden entries only when requested', () => {
  const normal = getDirectoryEntries(HOME, documents);
  assert.deepEqual(normal.slice(0, 2).map((entry) => entry.name), ['notes', 'projects']);
  assert.equal(normal.some((entry) => entry.name === '.notes.md'), false);
  assert.equal(getDirectoryEntries(HOME, documents, true).some((entry) => entry.name === '.notes.md'), true);
  assert.deepEqual(getDirectoryEntries('/', documents), [{ name: 'home', path: '/home', directory: true }]);
  assert.deepEqual(getDirectoryEntries('/', []), [{ name: 'home', path: '/home', directory: true }]);
});

test('ll and ls flags emit clickable paths, dot directories and long mode', () => {
  const result = runCommand('ll -a projects/..', context);
  assert.equal(result.blocks[0].type, 'listing');
  if (result.blocks[0].type !== 'listing') throw Error('Expected listing');
  assert.equal(result.blocks[0].long, true);
  assert.equal(result.blocks[0].entries[0].name, '.');
  assert.equal(result.blocks[0].entries[1].path, '/home');
  assert.equal(result.blocks[0].entries.find((entry) => entry.name === 'about.md')?.path, HOME + '/about.md');
  const flags = runCommand('ls -la', context).blocks[0];
  assert.equal(flags.type === 'listing' && flags.long, true);
});

test('cd, .., ... and cd - preserve previous-directory navigation', () => {
  const into = runCommand('cd projects', context);
  assert.equal(into.cwd, HOME + '/projects');
  assert.equal(into.previousCwd, HOME);
  const back = runCommand('cd -', { ...context, cwd: into.cwd, previousCwd: into.previousCwd });
  assert.equal(back.cwd, HOME);
  assert.equal(back.previousCwd, HOME + '/projects');
  assert.equal(runCommand('..', { ...context, cwd: HOME + '/projects' }).cwd, HOME);
  assert.equal(runCommand('...', { ...context, cwd: HOME + '/projects' }).cwd, '/home');
  assert.equal(runCommand('cd', { ...context, cwd: '/' }).cwd, HOME);
  assert.equal(runCommand('cd ~', { ...context, cwd: '/' }).cwd, HOME);
  assert.equal(runCommand('cd about.md', context).cwd, HOME);
  assert.equal(runCommand('cd -', context).unsupported, undefined);
});

test('cat emits document references; open directories opens a README window', () => {
  assert.deepEqual(runCommand('cat about.md contact.md', context).blocks, [
    { type: 'document', path: HOME + '/about.md' },
    { type: 'document', path: HOME + '/contact.md' },
  ]);
  assert.deepEqual(runCommand('open projects', context).actions, [{ type: 'open', path: HOME + '/projects/README.md' }]);
  assert.deepEqual(runCommand('open about.md', context).actions, [{ type: 'open', path: HOME + '/about.md' }]);
  assert.equal(runCommand('cat projects', context).blocks[0].type, 'text');
  assert.equal(runCommand('open notes', context).blocks[0].type, 'listing');
});

test('quoted and escaped spaces address a real workspace file', () => {
  const expected = [{ type: 'document', path: HOME + '/notes/build log.md' }];
  assert.deepEqual(runCommand('cat "notes/build log.md"', context).blocks, expected);
  assert.deepEqual(runCommand("cat 'notes/build log.md'", context).blocks, expected);
  assert.deepEqual(runCommand('cat notes/build\\ log.md', context).blocks, expected);
  assert.equal(runCommand('cat "notes/build log.md', context).unsupported, undefined);
});

test('advanced input creates only a typed, inert future-fallback envelope', () => {
  for (const input of ['curl example.com', 'sudo rm -rf /', 'ls | cat', 'ls; open about.md', 'cat $(pwd)', 'pwd > output', '`whoami`', 'ls\ncat about.md']) {
    const result = runCommand(input, context);
    assert.deepEqual(result.actions, []);
    assert.equal(result.cwd, HOME);
    assert.equal(result.unsupported?.input, input);
    assert.equal(result.unsupported?.columns, 82);
    assert.equal(result.blocks[0].type, 'text');
  }
  assert.equal(runCommand('ls -R', context).unsupported?.reason, 'unsupported-option');
  assert.equal(runCommand('rm anything', context).unsupported?.reason, 'unknown-command');
  assert.equal(runCommand('cat absent.md', context).unsupported, undefined);
  assert.equal(runCommand('cd missing', context).unsupported, undefined);
  assert.equal(runCommand('unsupported', { ...context, columns: Number.NaN }).unsupported?.columns, 80);
});

test('shell characters inside a quoted filename stay literal and never execute', () => {
  const result = runCommand('cat "$(pwd); ignored.md"', context);
  assert.deepEqual(result.actions, []);
  assert.equal(result.unsupported, undefined);
  assert.equal(result.blocks[0].type, 'text');
});

test('basic actions and help stay declarative', () => {
  assert.deepEqual(runCommand('clear', context).actions, [{ type: 'clear' }]);
  assert.deepEqual(runCommand('reset', context).actions, [{ type: 'reset' }]);
  assert.deepEqual(runCommand('windows', context).actions, [{ type: 'windows' }]);
  assert.deepEqual(runCommand('close "about.md"', context).actions, [{ type: 'close', target: 'about.md' }]);
  assert.deepEqual(runCommand('info', context).blocks, [{ type: 'welcome' }]);
  assert.deepEqual(runCommand('help cd', context).blocks, [{ type: 'help', command: 'cd' }]);
  assert.equal(runCommand('help toString', context).blocks[0].type, 'text');
  assert.equal(runCommand('pwd', context).blocks[0].type, 'text');
  assert.deepEqual(runCommand('  ', context).blocks, []);
});

test('completion handles commands, directories, home and filenames with spaces', () => {
  assert.equal(completeInput('he', HOME, documents).value, 'help ');
  assert.equal(completeInput('cd pro', HOME, documents).value, 'cd projects/');
  assert.equal(completeInput('open ab', HOME, documents).value, 'open about.md ');
  assert.equal(completeInput('cat notes/bu', HOME, documents).value, 'cat "notes/build log.md" ');
  assert.equal(completeInput('cat "notes/build ', HOME, documents).value, 'cat "notes/build log.md" ');
  assert.equal(completeInput('cd ~', '/', documents).value, 'cd ~/');
  assert.equal(completeInput('cat ~/ab', '/', documents).value, 'cat ~/about.md ');
  assert.deepEqual(completeInput('ls |', HOME, documents).candidates, []);
  assert.deepEqual(completeInput('cd ', HOME, documents).candidates, ['notes/', 'projects/']);
});
