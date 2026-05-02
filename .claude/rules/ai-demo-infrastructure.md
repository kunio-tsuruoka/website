---
globs: ["src/lib/rate-limit.ts","src/lib/turnstile.ts","src/pages/api/ai/**/*.ts"]
---

# AI demo infrastructure (Cloudflare)

Cloudflare Account ID: `163fc8ca531cbe925ad7597ee0196f3a` (Info@beekle.jp's Account)
Pages project: `website`

## Resources (created 2026-05-02)
- KV namespace `RATE_LIMIT` production id: `9d7191f03fe84b3f90f14252e5e3d7bd`
- KV namespace `RATE_LIMIT` preview id: `1bf38321066c41c1941881836e25ae48`
- Turnstile widget `beekle-ai-tools` sitekey (public): `0x4AAAAAADHmRrTyQk-jx5-X`
- Turnstile domains allowed: beekle.jp, www.beekle.jp, localhost

## Env vars on Pages (production + preview)
- `TURNSTILE_SECRET_KEY` (secret) — Turnstile siverify endpoint
- `TURNSTILE_SITE_KEY` (plain) — public sitekey to embed in HTML
- `OPENROUTER_API_KEY` (secret) — チャット/OCR用LLM
- `OPENROUTER_MODEL_CHAT` / `OPENROUTER_MODEL_OCR` (plain, optional override)
- `AI_MONTHLY_BUDGET_USD` (plain, デフォルト10) — 月次予算上限
- `SLACK_WEBHOOK_URL` (secret) — `/api/contact` と共用。**予算超過時に AI kill-switch がここへ通知** (1日1回まで KV `kill:alert:YYYY-MM` で重複防止)
- KV binding name: `RATE_LIMIT`
- AI binding name: `AI` (Workers AI、`@cf/baai/bge-m3` で埋め込み)

## Workers AI binding (column-rag 用)
- Pages ダッシュボードで Settings → Functions → AI bindings に `AI` を追加すること
- **`wrangler.toml` には `[ai]` を書かない**。書くと `astro dev` 起動時に `@astrojs/cloudflare` の `getPlatformProxy()` が remote mode で wrangler login を要求して落ちる（AI には local emulation がない）
- 開発ローカルでは `env.AI` が undefined になり、`src/lib/column-rag.ts#findRelevantColumns` は空配列を返してフォールバック → コラム参照なしで通常応答
- 埋め込みインデックス再生成: `bun run embed:columns` (=`scripts/build-column-embeddings.mjs`)。MicroCMS 全件取得 → Workers AI REST で BGE-M3 埋め込み → `src/data/column-embeddings.json` に書き出し → git commit
- 必要 env: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `CLOUDFLARE_API_TOKEN` (Workers AI Read 権限), `CLOUDFLARE_ACCOUNT_ID`
- 記事追加・大幅な改稿のたびに再生成して commit する運用

## Runtime access
- All AI demo endpoints `/api/ai/*` must read via `(locals as any).runtime.env.RATE_LIMIT` (KV) and `.TURNSTILE_SECRET_KEY` (string). See `.claude/rules/cloudflare.md`.
- `env.AI` は Workers AI バインディング。`ai.run('@cf/baai/bge-m3', { text: [query] })` で埋め込み生成
- Sitekey is public — can be exposed via `import.meta.env.TURNSTILE_SITE_KEY` at build OR via `runtime.env`.

### Turnstile container は常時可視で描画する (translate デモ開発時の learnings、削除済みだが将来の音声系で再発防止)
- `useTurnstile` の `useEffect` は mount 時に `containerRef.current` を見て widget を `render()` する。
- 罠1: `{cond && <div ref={turnstileContainerRef}/>}` のように条件付きで mount すると初回 effect で ref が null → widget が一度も描画されず token が取れない（ボタンが押せない）。
- 罠2: `<div ref={turnstileContainerRef} className="hidden" />` のように `display: none` の親に置いても **Turnstile の iframe が 0×0 で生まれて死ぬ**。あとで `hidden` を外しても復帰しない。
- 正解: **常時 visible の `<div ref={turnstileContainerRef} />` を最初から DOM に置く**。OCR / IT-advisor もこの pattern。ボタン側の `disabled` で UX を制御する。

## 過去の試み: 音声デモ (2026-05-02 諦め)
- `whisper-large-v3-turbo` を使った日英翻訳デモを試したが、ローカル開発で `env.AI` も REST フォールバックも安定せず断念。Cloudflare Workers AI の audio エンドポイントは binding/REST 両方とも検証コストが見合わなかった。
- 音声系を再挑戦するなら、まず `wrangler pages dev` でリモート binding 経由の確認手順を確立してから取り組むこと。

## Local credentials path
- API token at `./.cloudflare/api-token` (gitignored, chmod 600)
- For wrangler CLI: `export CLOUDFLARE_API_TOKEN=$(cat .cloudflare/api-token); export CLOUDFLARE_ACCOUNT_ID=163fc8ca531cbe925ad7597ee0196f3a`
