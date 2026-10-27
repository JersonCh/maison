import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
  site: 'https://maison.pe',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/catalogo') &&
        !page.includes('/preguntas-frecuentes'),
      serialize(item) {
        if (item.url === 'https://maison.pe/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/perfumes/')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.endsWith('/perfumes/')) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        } else {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8443,
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 8443,
    },
  },
});
