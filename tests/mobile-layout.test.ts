import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMobileLayout } from '../src/lib/workspace/mobile-layout.ts';

test('a normal phone keeps the document above a terminal smaller than half the work area', () => {
  const height = 701;
  const layout = getMobileLayout(370, height, .34, true);
  assert.equal(layout.full, false);
  assert.ok(layout.terminal.height >= 136 && layout.terminal.height < height / 2);
  assert.ok(layout.document.height >= 100);
  assert.equal(layout.document.y, 0);
  assert.equal(layout.terminal.y + layout.terminal.height, height);
  assert.equal(layout.terminal.y - layout.document.height, 8);
  assert.equal(layout.fraction, layout.terminal.height / height);
});

test('keyboard and landscape work areas preserve both views within their available height', () => {
  for (const [width, height] of [[824, 220], [370, 260], [370, 207], [370, 150]]) {
    const layout = getMobileLayout(width, height, .34, true);
    assert.equal(layout.full, false);
    assert.ok(layout.terminal.height >= Math.min(150, height * .7));
    assert.ok(layout.document.height > 0);
    assert.ok(layout.document.height <= layout.terminal.y);
    assert.ok(layout.terminal.y - layout.document.height <= 8);
    for (const rect of [layout.document, layout.terminal]) {
      assert.equal(rect.width, width);
      assert.ok(rect.y >= 0 && rect.y + rect.height <= height);
    }
  }
});

test('dragging close to the top or choosing the terminal alone fills the work area', () => {
  for (const fraction of [.96, 1, 2, Infinity]) {
    const layout = getMobileLayout(390, 680, fraction, true);
    assert.equal(layout.full, true);
    assert.deepEqual(layout.terminal, { x: 0, y: 0, width: 390, height: 680 });
    assert.equal(layout.document.height, 0);
    assert.equal(layout.fraction, 1);
  }
  assert.equal(getMobileLayout(390, 680, .34, false).full, true);
  assert.equal(getMobileLayout(390, 680, .34, false).terminal.height, 680);
});

test('split resizing leaves minimum readable height for both surfaces', () => {
  const minimum = getMobileLayout(390, 680, -1, true);
  const maximum = getMobileLayout(390, 680, .95, true);
  assert.equal(minimum.terminal.height, 150);
  assert.equal(maximum.document.height, 100);
  assert.equal(maximum.full, false);
  assert.ok(maximum.terminal.y >= 108);
  assert.deepEqual(getMobileLayout(390, 680, NaN, true), getMobileLayout(390, 680, .34, true));
});

test('extremely short keyboard areas keep a usable terminal instead of splitting its chrome', () => {
  for (const height of [136, 100, 30]) {
    const layout = getMobileLayout(370, height, .34, true);
    assert.equal(layout.full, true);
    assert.equal(layout.terminal.height, height);
    assert.equal(layout.document.height, 0);
  }
});

test('tiny and unavailable areas never create overlapping or out-of-bounds rectangles', () => {
  for (const width of [0, 240, 390]) {
    for (const height of [0, 1, 8, 30, 136]) {
      for (const fraction of [-Infinity, 0, .34, .95, 1, NaN]) {
        const layout = getMobileLayout(width, height, fraction, true);
        for (const rect of [layout.document, layout.terminal]) {
          assert.ok(rect.x >= 0 && rect.y >= 0 && rect.width >= 0 && rect.height >= 0);
          assert.ok(rect.x + rect.width <= width && rect.y + rect.height <= height);
        }
        assert.ok(layout.document.y + layout.document.height <= layout.terminal.y);
        assert.ok(layout.fraction >= 0 && layout.fraction <= 1);
      }
    }
  }
  assert.equal(getMobileLayout(390, 0, .34, true).fraction, 1);
  assert.equal(getMobileLayout(-1, -1, .34, true).terminal.height, 0);
});
