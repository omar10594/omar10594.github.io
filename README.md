# Guillermo Omar López López - Portfolio

Single-page portfolio website built with Astro and Tailwind CSS.
Designed for high performance, accessibility, and SEO.

- **Production URL**: [lopezlopez.com.mx](https://lopezlopez.com.mx)
- **Repository**: [omar10594.github.io](https://github.com/omar10594/omar10594.github.io)

## Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (Utility-first)
- **Deployment**: Cloudflare Workers Static Assets (via GitHub Actions)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
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

## Production deployment

Pushes to `master` run `.github/workflows/deploy.yml`: `npm ci`, `npm run build`,
then Wrangler deploys `dist/` to the `lopezlopez-portfolio` Worker. Pull requests
build the site without publishing. A manual run is available in GitHub Actions.

The repository secret `CLOUDFLARE_API_TOKEN` authorizes deployment to this Worker.
Keep its value only in GitHub Actions secrets; replace it before its configured
expiry or if revoked. Cloudflare account and domain settings are declared in
`wrangler.jsonc`. `lopezlopez.com.mx` is the Worker's custom domain. A Cloudflare
zone redirect sends `www.lopezlopez.com.mx` to the canonical apex domain.
Workers development and preview URLs are disabled. No Worker application code,
server rendering, database, or Astro Cloudflare adapter is required.

The existing site build uses Node.js 20. Deployment then uses Node.js 24 and
Wrangler 4.149.0 installed in the runner's temporary directory, keeping the
project's dependency manifest and lockfile unchanged. The deployment token is
limited to editing `lopezlopez-portfolio` and expires on October 24, 2027.

The migration preserves `package.json`, `package-lock.json`, and the existing
site content. Dependency and design updates are intentionally deferred.

For a manual deployment with an authorized Cloudflare session:

```bash
npm ci
npm run build
npx wrangler@4.149.0 deploy
```

To roll back a content release, revert its commit on `master` and let the same
workflow publish it. GitHub Pages is disabled; re-enabling the previous provider
would also require restoring its workflow, custom domain and DNS configuration.
