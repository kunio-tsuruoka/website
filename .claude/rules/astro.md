# Astro Rules

## File Extensions
- Pages: `.astro` (src/pages/)
- Layouts: `.astro` (src/layouts/)
- React components: `.tsx` (src/components/)

## Page Structure

```astro
---
// フロントマター: サーバーサイドのTypeScript
import Layout from '@/layouts/layout.astro';
import { SomeComponent } from '@/components/some-component';

const data = await fetchData();
---

<Layout title="Page Title">
  <SomeComponent client:load data={data} />
</Layout>
```

## Client Directives

- `client:load` - ページ読み込み時にhydrate（インタラクティブなコンポーネント）
- `client:visible` - 表示時にhydrate（パフォーマンス優先）
- `client:idle` - アイドル時にhydrate
- なし - 静的HTML出力（インタラクション不要）

## SSR Mode

- `output: 'server'` - Cloudflare Pages対応
- 動的ルート: `[id].astro`, `[...slug].astro`
- `getStaticPaths()` は使用しない（SSRモードのため）

# SSR for Dynamic Routes

- 動的ルート (`[id].astro`, `[...slug].astro`) でSSRするには `export const prerender = false;` が必須
- `prerender = true` + `getStaticPaths()` → 静的生成
- `prerender = false` (getStaticPathsなし) → SSR
- 静的ページ (動的パラメータなし) はデフォルトでSSR（`output: 'server'` 設定時）
