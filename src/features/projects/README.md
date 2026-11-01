# Project views

Each project is an independent Astro document, not a fragment injected into the
desktop. Its CSS and browser scripts remain inside its own iframe on desktop and
the same document is a standalone, responsive route on mobile.

To add a project:

1. Add its identity and short description to `registry.ts`. Only add a public URL
   when the owner explicitly approves exposing it. Omit absent repository links.
2. Create `<id>/Project.astro` using `shared/ProjectLayout.astro`. Keep its styling
   scoped, its DOM queries under its own root and demonstrations deterministic.
3. Add the virtual Markdown link in `src/data/workspace/projects/README.md`. The
   route discovers `<id>/Project.astro` automatically from the registry.
4. Check the standalone route at 320px, a narrow project window and desktop. Check
   keyboard controls, reduced motion, browser Back, and window lifecycle.

The registry also supplies the virtual filesystem: `cd`, `ls`, completion and
`open` discover new directories without editing the terminal engine. Markdown
remains available through `cat`; opening the document shows its designed view.

The parent only accepts a focus message from its exact origin and a known iframe
window. Same-origin frames isolate the CSS/DOM, not untrusted code. Keep their
content owned and static; never execute visitor terminal input. External product
links open a separate browser tab. There are no production APIs or live AI calls.

Shared layout owns metadata, fonts, return navigation and reduced-motion behavior.
`DeviceFrame.astro` is shared only by device previews. Product-specific tokens and
interaction logic stay with each project; don't grow a global brand stylesheet.
