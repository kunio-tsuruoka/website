import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { resolve } from 'path';

// https://astro.build/config
export default defineConfig({
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
