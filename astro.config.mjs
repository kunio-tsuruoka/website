import { resolve } from 'path';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Cloudflare Pagesで動作
  trailingSlash: 'never', // /column/ -> /column 等の正規化（_redirects ではなく config 側で）
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  // applyBaseStyles: false — Tailwind の @tailwind 指令は src/styles/global.css 側で
  // 管理する（二重注入防止）。global.css は layout.astro で import される。
  integrations: [react(), tailwind({ applyBaseStyles: false })],
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
