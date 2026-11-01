import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects, projectDocumentPath, projectForDocument, projectRoute } from '../src/features/projects/registry.ts';
import { HOME, completeInput, getDirectoryEntries, runCommand } from '../src/lib/terminal/engine.ts';

const documents = projects.map((project) => ({ path: projectDocumentPath(project.id), title: project.title, content: project.summary }));
const context = { cwd: HOME, columns: 80, documents };

test('all project directories are discoverable, openable and completable through the virtual shell', () => {
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length);
  assert.deepEqual(getDirectoryEntries(HOME + '/projects', documents).map((entry) => entry.name).sort(), projects.map((project) => project.id).sort());
  for (const project of projects) {
    const path = projectDocumentPath(project.id);
    assert.equal(projectForDocument(path)?.id, project.id);
    assert.equal(projectForDocument(path + '/invalid'), undefined);
    assert.equal(projectRoute(project.id), `/projects/${project.id}/`);
    assert.deepEqual(runCommand(`open projects/${project.id}`, context).actions, [{ type: 'open', path }]);
    assert.equal(runCommand(`cd projects/${project.id}`, context).cwd, `${HOME}/projects/${project.id}`);
    assert.ok(completeInput(`open projects/${project.id.slice(0, 4)}`, HOME, documents).value?.includes(project.id));
  }
});

test('only the three authorized product sites are exposed by the registry', () => {
  assert.deepEqual(projects.filter((project) => 'externalUrl' in project).map((project) => project.id), ['playbusiness', 'sosimple', 'miss-luciana']);
  assert.ok(projects.every((project) => !('sourceUrl' in project)));
});
