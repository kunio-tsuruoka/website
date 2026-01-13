import { resolve } from 'path';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Cloudflare Pagesで動作
  adapter: cloudflare(),
  integrations: [react(), tailwind()],
  vite: {
    resolve: {
      alias: {
        '@': resolve('./src'), // Resolve '@' as an alias to the 'src' directory
      },
    },
    server: {
      fs: {
        // File system strictness disabled
        strict: false,
      },
    },
  },
});
