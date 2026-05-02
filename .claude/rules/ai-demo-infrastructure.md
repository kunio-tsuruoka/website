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
- AI binding は **wrangler.toml の `[ai] binding = "AI"` ブロックで宣言する**（dashboard UI は Wrangler 管理モードのため編集不可。詳細は下の「Workers AI binding は wrangler.toml 管理」参照）
- 古い記述「`wrangler.toml` には `[ai]` を書かない」は誤り。当時 dashboard 経由で binding 追加できると思っていたが、実際は wrangler.toml が単一の真実源
- 開発ローカルでも `bun dev` 一発で動く（`package.json` の dev script が `.cloudflare/api-token` を auto-export するため）。token が無い CI 等では `env.AI` が落ちて `src/lib/column-rag.ts` の REST フォールバックに流れ、それも無ければ `[]` を返す
- 埋め込みインデックス再生成: `bun run embed:columns` (=`scripts/build-column-embeddings.mjs`)。MicroCMS 全件＋ `scripts/beekle-glossary.mjs` の用語集を Workers AI REST で BGE-M3 埋め込み → `src/data/column-embeddings.json` に書き出し → git commit
- 必要 env: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`, `CLOUDFLARE_API_TOKEN` (Workers AI Read 権限), `CLOUDFLARE_ACCOUNT_ID`
- 記事追加・大幅な改稿、または用語集更新のたびに再生成して commit する運用

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

## Workers AI binding は wrangler.toml 管理（2026-05-02 更新）

過去の comment「`[ai]` を wrangler.toml に書くと astro dev が落ちる」の **ワークアラウンド確立**:

- Pages は Wrangler 管理モードに切り替わったため、AI binding は **wrangler.toml の `[ai]` ブロックでしか宣言できない**（dashboard の Bindings タブは「wrangler.toml で管理されています」表示で編集不可）
- `[ai] binding = "AI"` `remote = true` を書くと `astro dev` の `getPlatformProxy()` がリモート proxy 経由で接続を試みるが、これは **`CLOUDFLARE_API_TOKEN` が env にあれば通る**
- `package.json` の `dev` script で `.cloudflare/api-token` を auto-export しているので `bun dev` 一発で動く（`"dev": "CLOUDFLARE_API_TOKEN=\"${CLOUDFLARE_API_TOKEN:-$(cat .cloudflare/api-token 2>/dev/null)}\" CLOUDFLARE_ACCOUNT_ID=\"...\" astro dev"`）
- 起動時に `workers/subdomain/edge-preview` への API call が 1 つ失敗するエラーログが出るが、これは preview 機能用の権限不足で本体動作には無関係。dev サーバは `astro ready` まで進んで listen する
- Workers AI はローカルエミュレーション無し（GPU 必要）。リモート proxy 必須なのは構造的制約

## Cloudflare Pages のハルシネーション要因（2026-05-02 incident）

本番の `/api/ai/chat` (IT-advisor) が「FM = Future Mode」「FM = Functional Specification」と捏造、さらに `beekle.co.jp` という存在しないドメインの URL まで作っていた事故。

**根本原因 3 点**:
1. Pages 本番に AI binding も `CLOUDFLARE_API_TOKEN` も無く、`findRelevantColumns()` が常に `[]` → RAG context ゼロで system prompt のみで回答
2. `column-rag.ts` の embeddings は MicroCMS コラム本文だけで、Beekle 固有の用語集（FM、AsIs/ToBe 等）が無く、コラム本文に明示的な定義文も少ない
3. system prompt が「FM 等のキーワードをそのまま使え」とだけ言い、「略語の正式名称を推測するな」というネガ制約が無かった

**入れた多層防御**:
- `wrangler.toml` に `[ai]` 復活（本番に AI binding 配備）
- `scripts/beekle-glossary.mjs` に用語集を作り `build-column-embeddings.mjs` で同じ embeddings JSON に混ぜる（FM 等は glossary エントリがトップヒットする）
- `chat.ts` system prompt に「【ハルシネーション防止 — 最重要】略語の正式名称・英訳・由来は参考コラム抜粋に明示されている場合のみ書く」を明文化
- `column-rag.ts` の formatColumnContext にも同様のルール追記
- `chat.ts` で応答後処理 `sanitizeReplyUrls()` を追加。回答内の URL は beekle.jp 配下かつ参考コラム URL に含まれるものだけ通し、それ以外は `[リンク省略]` に置換（プロンプトが破られても URL 捏造は物理的に止まる）

## 用語集の追加方法

`scripts/beekle-glossary.mjs` の `BEEKLE_GLOSSARY` 配列にエントリを足して `bun run embed:columns` で再生成 → `src/data/column-embeddings.json` を commit。新しい固有用語・略語が出てきたら、ここに「正式名称」「**間違いやすい誤訳の例**」「Beekle 内での使い方」を含む 200〜400 字の excerpt を書く。
