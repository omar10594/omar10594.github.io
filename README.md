# Guillermo Omar López López - Portfolio

A personal workspace built with Astro, TypeScript and CSS. The phase-1 desktop
replaces the CV layout with an interactive terminal and Markdown document windows.

- **Production URL**: [lopezlopez.com.mx](https://lopezlopez.com.mx)
- **Repository**: [omar10594.github.io](https://github.com/omar10594/omar10594.github.io)

## Tech Stack

- **Framework**: [Astro](https://astro.build) 7.4.2 (static site generation)
- **Language**: TypeScript 7.0.2
- **Styling**: custom desktop CSS
- **Build runtime**: Node.js 24.22.1 LTS with npm 11.19.1
- **Deployment**: Cloudflare Workers Static Assets (via GitHub Actions)
- **Deployment CLI**: Wrangler 4.152.0, included in the dependency lockfile

## Local Development

Use the Node.js version in `.node-version` / `.nvmrc`. Dependencies use exact
versions and a committed lockfile; `.npmrc` enforces the supported Node version.

1. **Install locked dependencies**:
   ```bash
   npm ci
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321` to see the site.

3. **Build for production**:
   ```bash
   npm run build
   ```
   Output will be in `dist/`.

4. **Inspect the compiled site**:
   ```bash
   npm run preview -- --host 127.0.0.1 --port 4321
   ```

## Phase-1 workspace

Start with `help`, `ls`, `ll`, `cd cv`, `cat experience.md`, `..` or
`open contact.md`. Files in a listing are clickable. Tab completes commands
and paths; the up/down arrows browse command history. `info` prints the
welcome again and `reset` restores the initial desktop.

The prompt follows the previous response in one scrolling transcript. Results
appear in a rapid sequence lasting at most 750 ms, with immediate output for
reduced-motion preferences. Clear, Reset or another command cancels an older
sequence. A faint local command/path suggestion can be accepted with Tab or
the tappable Tab action, then run with Enter; an empty prompt suggests `help`.

Windows support dragging, resizing, minimize, maximize, close and restoration
from the taskbar. Focus a title bar to move with arrow keys, resize with
Shift+arrows, maximize/restore with Enter, or center with Home. About and Contact
start open in front of the terminal, with About active. The startup composition
is centered and capped at 1320 px so wide screens keep the windows together.

Mobile starts with About above a persistent terminal using roughly 34% of the
available work area. Drag the separator to resize the split or expand the
terminal fully. Its expand button also toggles the split; opening a document
from a full terminal brings that document back above it. The separator supports
Up/Down, Home/Escape for the default split, End for full height and Enter/Space
to toggle. Terminal close/minimize controls are hidden in this mode.

The mobile input uses 16 px text, and visual-viewport resizing adapts the work
area to available keyboard space. Short work areas prioritize a usable prompt;
below 150 px of available height, the terminal temporarily takes the full area.
The on-screen keyboard still needs a check on a physical phone.

Edit the public copy in `src/data/workspace/`. These are real Markdown files;
the `cv/` subfolder holds experience, education and skills from the prior site.
`src/lib/workspace/content.ts` maps them into the read-only virtual filesystem.
`src/lib/terminal/engine.ts` is a pure command interpreter. The document renderer
creates text/DOM nodes and does not insert Markdown as raw HTML. Commands do
not execute code, mutate files or access the machine's shell.

The bespoke project landings and mobile demonstrations are phase 2. Projects
currently has a Markdown index only. The optional final-phase AI fallback has
a typed interface in `src/lib/terminal/fallback.ts` and is disconnected: no
model, credentials, backend or paid requests are configured. A later adapter
can receive virtual context and character dimensions and return bounded text
lines without changing the local command interpreter.

Local checks use Node.js 24's native TypeScript test execution:

```bash
npm run check
npm run audit
```

`check` validates TypeScript modules, runs the command/window tests and builds
the site. TypeScript's checker does not check `.astro` templates; Astro validates
their compilation during the build. The audit covers development and deployment
dependencies as well as the site framework, and fails on reported vulnerabilities
of any severity. Fonts are served locally from `public/fonts/` with OFL licenses.
The social preview in `public/social-card.png` has a matching editable SVG.

Wrangler currently pins an older Undici through Miniflare. A scoped override
uses the patched Undici 7.30.1 until that upstream pin is updated. Recheck the
override when upgrading Wrangler. Installation scripts are allowed only for
the reviewed, pinned esbuild and workerd versions in `package.json`.

## Production deployment

Pushes to `master` run `.github/workflows/deploy.yml`: `npm ci`, `npm run check`
and `npm run audit`. Wrangler then uploads `dist/` as a version tagged with the
commit SHA and deploys that exact version to 100% of traffic on
`lopezlopez-portfolio`. Pull requests run the same checks without publishing.
A manual run in GitHub Actions can publish only when run from `master`.

The repository secret `CLOUDFLARE_API_TOKEN` authorizes deployment to this Worker.
Keep its value only in GitHub Actions secrets; replace it before its configured
expiry or if revoked. Cloudflare account and domain settings are declared in
`wrangler.jsonc`. `lopezlopez.com.mx` is the Worker's custom domain. A Cloudflare
zone redirect sends `www.lopezlopez.com.mx` to the canonical apex domain.
Workers development and preview URLs are disabled. No Worker application code,
server rendering, database, or Astro Cloudflare adapter is required.

The workflow uses Ubuntu 26.04 and Node.js 24.22.1 for validation and deployment.
GitHub Actions are pinned to full commit hashes. The deployment token is limited
to editing `lopezlopez-portfolio` and expires on October 24, 2027. The workflow
uses version upload/deploy commands so it does not change custom domains or
need zone permissions. Initial domain setup remains in `wrangler.jsonc`.

To roll back a content release, revert its commit on `master` and let the same
workflow validate and publish the revert. GitHub Pages is disabled; re-enabling
the previous provider would also require restoring its workflow, custom domain
and DNS configuration.
