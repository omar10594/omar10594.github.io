import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStartupLayout, windowIdForDocumentPath } from '../src/lib/workspace/window-model.ts';

test('documents with the same basename have independent window identities', () => {
  const paths = [
    '/home/omar/README.md', '/home/omar/cv/README.md', '/home/omar/projects/README.md',
    '/home/omar/cv/experience.md', '/home/omar/experience.md', '/home/omar/projects/experience.md',
    '/home/omar/notes/"example".md', '/home/omar/notes/%22example%22.md',
  ];
  const ids = paths.map(windowIdForDocumentPath);
  assert.equal(new Set(ids).size, paths.length);
  assert.equal(windowIdForDocumentPath('/home/omar/about.md'), 'about');
  assert.equal(windowIdForDocumentPath('/home/omar/contact.md'), 'contact');
  assert.ok(ids.every((id) => !id.includes('"')));
});

test('startup windows fit desktop work areas and documents overlap the background terminal', () => {
  for (const [width, height] of [[1392, 743], [1232, 563], [976, 611], [720, 500]]) {
    const layout = getStartupLayout(width, height);
    for (const rect of Object.values(layout)) {
      assert.ok(rect.x >= 0 && rect.y >= 0);
      assert.ok(rect.x + rect.width <= width && rect.y + rect.height <= height);
      assert.ok(rect.width >= 300 && rect.height >= 180);
    }
    assert.ok(layout.about.x < layout.terminal.x + layout.terminal.width);
    assert.ok(layout.contact.x < layout.terminal.x + layout.terminal.width);
    assert.ok(layout.about.y + layout.about.height < layout.contact.y);
  }
});
