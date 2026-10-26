import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME, type WorkspaceDocument } from '../src/lib/terminal/engine.ts';
import { getInlineSuggestion } from '../src/lib/terminal/suggestion.ts';

const documents: readonly WorkspaceDocument[] = [
  { path: HOME + '/README.md', title: 'Welcome', content: '# Welcome' },
  { path: HOME + '/about.md', title: 'About', content: '# About' },
  { path: HOME + '/contact.md', title: 'Contact', content: '# Contact' },
  { path: HOME + '/cv/README.md', title: 'CV', content: '# CV' },
  { path: HOME + '/cv/experience.md', title: 'Experience', content: '# Experience' },
  { path: HOME + '/notes/build log.md', title: 'Build log', content: '# Build log' },
];

test('suggests help for an empty prompt and a unique command prefix', () => {
  assert.equal(getInlineSuggestion('', HOME, documents), 'help');
  assert.equal(getInlineSuggestion('hel', HOME, documents), 'help ');
  assert.equal(getInlineSuggestion('p', HOME, documents), 'pwd ');
});

test('does not choose between commands or paths, or guess unknown input', () => {
  assert.equal(getInlineSuggestion('c', HOME, documents), '');
  assert.equal(getInlineSuggestion('open c', HOME, documents), '');
  assert.equal(getInlineSuggestion('open cv/', HOME, documents), '');
  assert.equal(getInlineSuggestion('open missing', HOME, documents), '');
  assert.equal(getInlineSuggestion('sudo', HOME, documents), '');
});

test('extends only real unique directory and file paths in the current directory', () => {
  assert.equal(getInlineSuggestion('cd c', HOME, documents), 'cd cv/');
  assert.equal(getInlineSuggestion('cd cv', HOME, documents), 'cd cv/');
  assert.equal(getInlineSuggestion('cd cv/', HOME, documents), '');
  assert.equal(getInlineSuggestion('open e', HOME + '/cv', documents), 'open experience.md ');
  assert.equal(getInlineSuggestion('cd ab', HOME, documents), '');
});

test('suppresses completed words and suffixes consisting only of whitespace', () => {
  assert.equal(getInlineSuggestion('help', HOME, documents), '');
  assert.equal(getInlineSuggestion('help ', HOME, documents), '');
  assert.equal(getInlineSuggestion('open about.md', HOME, documents), '');
  assert.equal(getInlineSuggestion(' ', HOME, documents), '');
});

test('preserves compatible quoted paths and rejects normalized non-prefix completions', () => {
  assert.equal(getInlineSuggestion('open "notes/build l', HOME, documents), 'open "notes/build log.md" ');
  assert.equal(getInlineSuggestion("open 'notes/build l", HOME, documents), '');
  assert.equal(getInlineSuggestion('open notes/build\\ l', HOME, documents), '');
  assert.equal(getInlineSuggestion('  hel', HOME, documents), '');
  assert.equal(getInlineSuggestion('open "notes/build log.md"', HOME, documents), '');
});
