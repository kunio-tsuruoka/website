# AI デモ基盤 (Cloudflare)

`/tools/ai-*` 系の生成AIデモ (OCR / チャットbot 等) を公開するための共通基盤の設定記録と運用方法。

## 構成概要

```
[ブラウザ]
   │ (1) Turnstile widget で人間判定
   ↓
[Astro SSR endpoint /api/ai/*]
   │ (2) Turnstile siteverify
   │ (3) RATE_LIMIT KV でIP/セッション単位カウンタ
   │ (4) ai-kill-switch で月次予算ガード
   ↓
[OpenRouter API]
   ↓
[ブラウザに結果返却]
```

防御層は **Turnstile (bot弾き) + KV rate limit (頻度制限) + kill switch (予算上限)** の3段。Cloudflareエッジの Rate Limiting Rules は使っていない (TSロジック+KVで完結する方針)。

## Cloudflare リソース

| 項目 | 値 |
|---|---|
| Account ID | `163fc8ca531cbe925ad7597ee0196f3a` (Info@beekle.jp's Account) |
| Pages project | `website` |
| KV namespace `RATE_LIMIT` (prod) | `9d7191f03fe84b3f90f14252e5e3d7bd` |
| KV namespace `RATE_LIMIT` (preview) | `1bf38321066c41c1941881836e25ae48` |
| Turnstile widget | `beekle-ai-tools` |
| Turnstile sitekey (public) | `0x4AAAAAADHmRrTyQk-jx5-X` |
| Turnstile許可ドメイン | `beekle.jp`, `www.beekle.jp`, `localhost` |

これらは **2026-05-02** に CLI / API で発行済み。再発行は不要。

## Pages の env vars / bindings

production と preview の両方に同設定:

| 名前 | 種類 | 用途 |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | secret | Turnstile siteverify エンドポイントへのサーバ側検証用 |
| `TURNSTILE_SITE_KEY` | plain (公開) | フロントの widget 埋め込みに使う (HTML 出力可) |
| `RATE_LIMIT` | KV binding | KV namespace への参照 (アプリ側は `env.RATE_LIMIT.get/put`) |

既存の env vars (MICROCMS_*, OPENROUTER_API_KEY, SLACK_WEBHOOK_URL, PUBLIC_GA_MEASUREMENT_ID) は無傷。

## ランタイムからのアクセス

`@astrojs/cloudflare` adapter なので `import.meta.env` ではなく `Astro.locals.runtime.env` 経由。`.claude/rules/cloudflare.md` のパターンに準拠する。

```ts
// src/pages/api/ai/<demo>.ts (例)
import type { APIRoute } from 'astro';

type AiEnv = {
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  RATE_LIMIT: KVNamespace;
  OPENROUTER_API_KEY: string;
};

export const POST: APIRoute = async ({ locals, request }) => {
  const env = (locals as { runtime?: { env?: AiEnv } }).runtime?.env;
  if (!env) return new Response('Runtime unavailable', { status: 500 });
  // ... rate-limit → turnstile verify → kill switch → LLM call
};
```

## API トークン (運用者用)

`./.cloudflare/api-token` に保存 (gitignored, chmod 600)。CLI 操作時は:

```bash
export CLOUDFLARE_API_TOKEN=$(cat .cloudflare/api-token)
export CLOUDFLARE_ACCOUNT_ID=163fc8ca531cbe925ad7597ee0196f3a
bunx wrangler whoami  # 疎通確認
```

トークンの権限スコープ (Custom Token):
- `Account / Workers KV Storage / Edit`
- `Account / Cloudflare Pages / Edit`
- `Account / Turnstile / Edit`
- Account Resources: Specific account → Info@beekle.jp's Account

不要になったら `https://dash.cloudflare.com/profile/api-tokens` で revoke すること。

## 再現コマンド (履歴)

将来別環境で再構築する時用:

```bash
# KV namespace
bunx wrangler kv namespace create RATE_LIMIT
bunx wrangler kv namespace create RATE_LIMIT --preview

# Turnstile widget
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/challenges/widgets" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"beekle-ai-tools","domains":["beekle.jp","www.beekle.jp","localhost"],"mode":"managed"}'

# Pages secret
echo "<turnstile-secret>" | bunx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=website
echo "<turnstile-secret>" | bunx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=website --env=preview

# Pages env var (public sitekey) + KV binding
curl -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/website" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "deployment_configs": {
      "production": {
        "env_vars": {"TURNSTILE_SITE_KEY": {"type":"plain_text","value":"<sitekey>"}},
        "kv_namespaces": {"RATE_LIMIT": {"namespace_id":"<prod-id>"}}
      },
      "preview": {
        "env_vars": {"TURNSTILE_SITE_KEY": {"type":"plain_text","value":"<sitekey>"}},
        "kv_namespaces": {"RATE_LIMIT": {"namespace_id":"<preview-id>"}}
      }
    }
  }'
```

## ローカル開発 (未実装、このあと対応)

`bun dev` で Astro dev サーバ起動時に KV binding と Turnstile secret を注入するために:

- `.dev.vars` (gitignored) に `TURNSTILE_SECRET_KEY` を置く
- `wrangler.toml` に KV binding を書く (preview id を使用)
- `astro.config.mjs` で `cloudflare({ platformProxy: { enabled: true } })` に変更

ローカルでTurnstileをテストする時は **Cloudflareのテスト用キー** を使うのが手軽:
- 常にPASS sitekey: `1x00000000000000000000AA`, secret: `1x0000000000000000000000000000000AA`
- 常にFAIL sitekey: `2x00000000000000000000AB`, secret: `2x0000000000000000000000000000000AA`

## 運用上の注意

- Turnstile secret は **絶対にリポジトリにコミットしない**。Pages secrets に登録済み、ローカルは `.dev.vars` (gitignored)
- KV namespace ID は公開しても直接的な脅威はないが、API token と組み合わせると操作可能。トークン管理を厳守
- 月次予算ガード (`ai-kill-switch.ts`) は OpenRouter の使用量を KV か外部APIで監視して閾値超過時に 503 を返す。閾値は環境変数 `AI_MONTHLY_BUDGET_USD` で管理予定

## レート制限ポリシー

`src/lib/rate-limit.ts` の `limitByIp()` で全 `/api/ai/*` エンドポイントに適用。IPは `cf-connecting-ip` から取得し、分単位 + 日単位の2段チェック。

| エンドポイント | per minute | per day | 想定コスト天井 |
|---|---|---|---|
| `/api/ai/ocr` | 5 | 30 | 100ユーザー × 30回/日 × $0.0017 ≈ $5/日 |
| `/api/ai/chat` | 10 | 50 | 500ユーザー × 50回/日 × $0.0002 ≈ $5/日 |
| (デフォルト) | 10 | 50 | — |

ポリシー変更時はドキュメントも更新する。値は `limitByIp()` の `profile` 引数で指定。

## モデル選定 (OpenRouter経由)

コスト最優先。env vars で上書き可:

| 用途 | デフォルトモデル | 入力 $/Mtok | 出力 $/Mtok | env var |
|---|---|---|---|---|
| Chat | `google/gemini-2.5-flash-lite` | $0.10 | $0.40 | `OPENROUTER_MODEL_CHAT` |
| OCR | `google/gemini-2.5-flash` | $0.30 | $2.50 | `OPENROUTER_MODEL_OCR` |

`OPENROUTER_API_KEY` は既存(description生成と共用)。月次予算ガード `ai-kill-switch.ts` で `AI_MONTHLY_BUDGET_USD` 上限を超えたら 503 を返す。

## 関連ファイル

実装済み:
- `src/lib/rate-limit.ts` + `.test.ts` — KV ベースの IP レート制限 (分/日2段、`limitByIp` で1行呼び出し)
- `src/lib/turnstile.ts` + `.test.ts` — Turnstile siteverify ラッパ + token抽出
- `src/lib/ai-kill-switch.ts` + `.test.ts` — 月次予算ガード (KV `kill:cost:YYYY-MM`)
- `src/lib/ai-guards.ts` + `.test.ts` — 上記3つを束ねるエントリ。各ハンドラ冒頭で1回呼ぶ
- `src/lib/openrouter.ts` + `.test.ts` — OpenRouter chat completions ラッパ (使用token + コスト計算 + KV記録)
- `src/pages/api/ai/chat.ts` — IT発注相談チャットエンドポイント
- `src/pages/api/ai/ocr.ts` — 領収書OCRエンドポイント
- `src/components/ai-it-advisor.tsx` — チャットUIコンポーネント
- `src/components/ai-ocr-demo.tsx` — OCRアップロードUIコンポーネント
- `src/pages/tools/ai-it-advisor.astro` — チャットページ
- `src/pages/tools/ai-ocr-demo.astro` — OCRページ
- `src/components/header.tsx` — toolsItems に2エントリ追加

未実装/今後:
- `.dev.vars` — ローカル開発用 secrets (gitignored)。現状 `bun dev` ではKV/Turnstileが動かない
- `wrangler.toml` — ローカル binding 定義
- `astro.config.mjs` の `cloudflare({ platformProxy: { enabled: true } })`

## ローカル/本番の動作状況

| 環境 | rate-limit | turnstile | OpenRouter | 備考 |
|---|---|---|---|---|
| 本番 (beekle.jp) | ✓ | ✓ | ✓ | 全リソース設定済み、デプロイ後動作 |
| Pages preview | ✓ | ✓ | ✓ | 同上 |
| ローカル (`bun dev`) | × | × | △ | 上記「未実装」の3点を整備すれば動く |

ローカル動作が必要になったら wrangler.toml + .dev.vars + platformProxy を整備する。プレビューブランチデプロイで動作確認するなら不要。

## 参考

- [Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/)
- [Cloudflare KV docs](https://developers.cloudflare.com/kv/)
- [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- 関連プロジェクトルール: `.claude/rules/cloudflare.md`, `.claude/rules/ai-demo-infrastructure.md`
