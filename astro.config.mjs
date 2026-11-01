// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    devToolbar: { enabled: false },
    compressHTML: true,
    build: { inlineStylesheets: 'never' },
    // Small scripts must remain external: the deployed CSP only permits self.
    vite: { build: { assetsInlineLimit: 0 } },
    site: 'https://lopezlopez.com.mx',
    integrations: [sitemap()],
});
