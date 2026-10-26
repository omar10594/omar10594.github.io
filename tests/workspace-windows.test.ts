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
  for (const [width, height] of [[3440, 1283], [2560, 923], [1872, 923], [1392, 743], [1232, 563], [976, 611], [720, 500]]) {
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

test('wide desktop startup remains one centered overlapping composition', () => {
  for (const width of [1392, 1920, 2560, 3440]) {
    const layout = getStartupLayout(width, 923);
    const rects = Object.values(layout);
    const left = Math.min(...rects.map((rect) => rect.x));
    const right = Math.max(...rects.map((rect) => rect.x + rect.width));
    assert.equal(left, width - right, 'the composition has equal outer margins');
    assert.ok(right - left <= 1320, 'ultrawide screens do not spread the windows apart');
    for (const document of [layout.about, layout.contact]) {
      assert.ok(layout.terminal.x + layout.terminal.width - document.x >= 100,
        'each document visibly overlaps the background terminal');
    }
  }
});

test('startup rectangles stay in bounds in narrow or short available areas', () => {
  for (const [width, height] of [[620, 500], [300, 400], [480, 260], [240, 140], [0, 0]]) {
    for (const rect of Object.values(getStartupLayout(width, height))) {
      assert.ok(rect.x >= 0 && rect.y >= 0);
      assert.ok(rect.width >= 0 && rect.height >= 0);
      assert.ok(rect.x + rect.width <= width && rect.y + rect.height <= height);
    }
  }
});
