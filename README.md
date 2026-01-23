# Guillermo Omar López López - Portfolio

Single-page portfolio website built with Astro and Tailwind CSS.
Designed for high performance, accessibility, and SEO.

- **Production URL**: [lopezlopez.com.mx](https://lopezlopez.com.mx)
- **Repository**: [omar10594.github.io](https://github.com/omar10594/omar10594.github.io)

## Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (Utility-first)
- **Deployment**: GitHub Pages (via GitHub Actions)

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

## Deployment

This repository uses **GitHub Pages** with a **Custom Domain**.

### Configuration
- **CNAME**: The file `public/CNAME` contains the custom domain `lopezlopez.com.mx`. This ensures GitHub Pages preserves the domain across deployments.
- **Astro Config**: `astro.config.mjs` has `site` set to `https://lopezlopez.com.mx` to generate correct canonical URLs and sitemaps.

### Deployment Method
The site is configured to deploy via **GitHub Actions**. Ensure your repository Settings > Pages has "Build and deployment source" set to **GitHub Actions**.

## Maintenance & Performance

This site is optimized for:
- **Lighthouse Performance**: 95+ (Minimal JS, static HTML).
- **Core Web Vitals**: Low CLS, fast LCP.
- **SEO**: Semantic HTML, Open Graph tags, Sitemap, JSON-LD (if added).

To maintain high scores:
- Avoid adding heavy JavaScript libraries.
- Optimize images before adding them (though Astro attempts to optimize assets, pre-optimized WebP/AVIF is better).
- Keep the design clean and minimal.

## Updates
Edit the content in `src/components/*.astro` files.
- `src/components/Hero.astro`: Header info.
- `src/components/Experience.astro`: Job history.
- `src/components/Projects.astro`: Project cards.
