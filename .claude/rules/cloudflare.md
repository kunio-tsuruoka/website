# Cloudflare Pages + Astro SSR

## CF Pages の本番ビルドは `npm ci`（package-lock.json が正）

ローカル開発・GitHub Actions の "Astro build" は **bun**（`bun.lock`）だが、**Cloudflare Pages の git 連携ビルドは `npm ci` で `package-lock.json` を使う**（元々 npm 想定で組まれている）。

罠: `bun add <pkg>` で依存を足すと **`bun.lock` しか更新されず `package-lock.json` が古いまま**になり、CF Pages のプレビュー/本番ビルドが `npm error Missing: <pkg> from lock file` で **即 fail（duration 0s）**する。ローカル `bun run build` も GitHub Actions の Biome/Vitest/Astro build も全部 pass するので気づきにくい（PR チェックで Cloudflare Pages だけ赤）。

**ルール**: 依存を追加・更新したら **必ず両方の lockfile を同期**する。
```bash
bun add <pkg>                    # bun.lock 更新
npm install --package-lock-only  # package-lock.json だけ再生成（node_modules は触らない）
git add bun.lock package-lock.json
```
検証は `npm ci --dry-run`（CF と同じコマンド）で "Missing ... from lock file" が出ないこと。

**事例 (2026-05-31)**: PR #38 で `@hookform/resolvers` `react-hook-form` `@standard-schema/utils` を bun で追加 → CF Pages が `Missing from lock file` で fail。`npm install --package-lock-only` で同期して解消。CF Pages の "fail / duration 0s" を見たら真っ先に lockfile 不整合を疑う（ビルドログは `wrangler pages deployment list` → API の `/history/logs` で取得）。

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
