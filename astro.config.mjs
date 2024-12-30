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
        "@components": path.resolve(path.dirname(''), './src/components'),
        "@assets": path.resolve(path.dirname(''), './src/assets'),
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
