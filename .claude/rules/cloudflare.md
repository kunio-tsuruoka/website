# Cloudflare Pages + Astro SSR

## Environment Variables at Runtime

- `import.meta.env` only works at **build time**
- For SSR runtime, use `Astro.locals.runtime.env`

```typescript
// In .astro pages
const runtime = (Astro.locals as { runtime?: { env?: EnvType } }).runtime;
const env = runtime?.env;

// In API routes (APIRoute)
export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as { runtime?: { env?: EnvType } }).runtime;
  const env = runtime?.env;
};
```

## MicroCMS Functions Pattern

Pass env as optional parameter to support both local dev and Cloudflare:

```typescript
export async function getData(env?: MicroCMSEnv) {
  const client = getClient(env); // falls back to import.meta.env
  // ...
}
```

# Cloudflare Pages の `_redirects` の重大な落とし穴

`_redirects` で末尾スラッシュ正規化（`/foo/  /foo  301` 形式）を**書いてはいけない**。Cloudflare Pages は URL の末尾スラッシュを暗黙正規化するため、これを書くと自己ループ判定でルーティング全体が破綻し、SSR を含むほぼ全ページが 404 を返すようになる（2026-04-28 にこの問題で本番が壊れた）。

trailing-slash の制御は以下を使う:
- `astro.config.mjs` の `trailingSlash: 'never'` または `'always'`
- HTML の `<link rel="canonical">` で正規 URL を指定（既に実装済み）

GA4 で `/contact/` `/contact` のような重複計測が見える場合も、`_redirects` ではなく canonical タグで対処する。

復旧手順: `_redirects` を最小限（旧スラッグ正規化など必要最小限のみ）に戻して再デプロイ。
