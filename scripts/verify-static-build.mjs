import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';

const root = resolve('dist');
let pages = 0;
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (entry.name.endsWith('.html')) {
      pages += 1;
      const html = await readFile(path, 'utf8');
      for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/\btype=["']application\/(?:ld\+)?json["']/i.test(attributes)) continue;
        assert.equal(body.trim(), '', `${path}: inline JavaScript is blocked by our CSP`);
        const source = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
        assert.ok(source?.startsWith('/_astro/'), `${path}: scripts must use a local build asset`);
        const file = resolve(root, '.' + source.split('?')[0]);
        assert.ok(file.startsWith(root + sep));
        assert.ok((await stat(file)).isFile(), `${path}: missing script ${source}`);
      }
      assert.ok(!/<style\b/i.test(html), `${path}: inline styles are blocked by our CSP`);
    }
  }
}
await inspect(root);
assert.ok(pages >= 6, 'Expected workspace and five project routes');
console.log(`Verified ${pages} built pages: external local scripts and styles comply with CSP.`);
