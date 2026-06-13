import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { buildLastmodMap } from './scripts/build-lastmod-map.mjs';

const lastmodMap = await buildLastmodMap();
const BUILD_DATE = new Date().toISOString();

function resolveLastmod(url) {
  const path = new URL(url).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/';
  return lastmodMap.get(path) ?? BUILD_DATE;
}

export default defineConfig({
  site: 'https://www.ccme.ma',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/api/'),
      serialize(item) {
        const url = item.url;
        const lastmod = resolveLastmod(url);
        // Home
        if (url === 'https://www.ccme.ma/' || url === 'https://www.ccme.ma') {
          return { ...item, lastmod, priority: 1.0, changefreq: 'daily' };
        }
        // Hubs
        if (/\/(services|secteurs|zones|quartiers|outils|blog|comparatifs)\/?$/.test(url)) {
          return { ...item, lastmod, priority: 0.9, changefreq: 'weekly' };
        }
        // Blog posts
        if (url.includes('/blog/')) {
          return { ...item, lastmod, priority: 0.7, changefreq: 'monthly' };
        }
        // Services / secteurs / zones / quartiers detail
        if (/\/(services|secteurs|zones|quartiers)\//.test(url)) {
          return { ...item, lastmod, priority: 0.85, changefreq: 'monthly' };
        }
        // Tools / simulators
        if (url.includes('/outils/') || url.includes('/comparatifs/')) {
          return { ...item, lastmod, priority: 0.8, changefreq: 'monthly' };
        }
        // Glossaire / avis-clients / cabinet
        if (/\/(glossaire|avis-clients|cabinet|tarifs|expat|contact)$/.test(url)) {
          return { ...item, lastmod, priority: 0.7, changefreq: 'monthly' };
        }
        // Legal
        if (/\/(mentions-legales|confidentialite)$/.test(url)) {
          return { ...item, lastmod, priority: 0.3, changefreq: 'yearly' };
        }
        return { ...item, lastmod, priority: 0.6, changefreq: 'monthly' };
      },
    }),
  ],
  image: {
    domains: ['www.ccme.ma'],
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
