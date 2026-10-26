import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
  site: 'https://maison.pe',
  output: 'static',
  integrations: [react()],
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
