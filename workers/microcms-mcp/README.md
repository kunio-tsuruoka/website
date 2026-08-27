# Beekle CMS / Marketing MCP

MicroCMS の `blogs` / `columns` / `categories` / `qas` / `qa-categories` を直接操作し、GA4 / Google Search Console / Microsoft Clarity のマーケティングデータを読み取る Remote MCP Server。

リード・商談などCRMの正本は `beekle-crm`。CRMデータの確認は別の `beekle-crm` コネクタを使い、このMCPではHubSpot認証やHubSpot API読み取りを扱わない。

ChatGPT の Remote MCP から使えるよう、OAuth 2.1 相当の Authorization Code + PKCE と refresh_token に対応している。認可画面では `OAUTH_PASSWORD` を入力し、発行したアクセストークンで `/mcp` を呼び出す。

アクセストークンは90日、リフレッシュトークンは1年有効。ChatGPT は期限前に `grant_type=refresh_token` で更新できるので、毎回パスワードを入れ直す必要はない。

## Endpoints

- `GET /health`: ヘルスチェック
- `GET /.well-known/oauth-protected-resource`: MCP protected resource metadata
- `GET /.well-known/oauth-authorization-server`: OAuth authorization server metadata
- `POST /register`: Dynamic Client Registration
- `GET|POST /authorize`: OAuth authorization endpoint
- `POST /token`: OAuth token endpoint
- `POST /mcp`: MCP JSON-RPC endpoint

## Tools

### MicroCMS

- `microcms_list_contents`
- `microcms_get_content`
- `microcms_create_content`
- `microcms_update_content`
- `microcms_delete_content`

`create` は既定で `status=draft`。公開作成したい場合だけ `status: "published"` を渡す。
`update` も既定で `status=draft`。公開済み記事を壊さず下書き更新したい場合は既定のままでよい。

### Marketing

- `marketing_daily_summary`: 日次のGA4/GSCサマリ。Clarityは `includeClarity: true` の時だけ取得。
- `marketing_monthly_analysis`: 月次のGA4/GSC分析と前月比較。
- `marketing_get_gsc_queries`: GSC query別データ。CTR改善候補も返す。
- `marketing_get_gsc_pages`: GSC page別データ。
- `marketing_get_ga4_report`: GA4 Data APIの定型レポート。
- `marketing_get_clarity_insights`: Microsoft Clarity Data Export APIのlive insights。

Marketing tools are read-only. MicroCMS tools are the only write-capable tools.

Clarity Data Export API は公式仕様上、直近1〜3日・最大3ディメンション・1日あたり少数リクエストの制限があるため、日次サマリでは既定で呼び出さない。

## Cloudflare Secrets

このリポジトリでは本番MCPは Cloudflare Pages のSSR routeとして `https://beekle.jp/mcp` に載せている。Secrets は Pages project (`website`) 側へ設定する。

```bash
wrangler pages secret put MICROCMS_SERVICE_DOMAIN --project-name website
wrangler pages secret put MICROCMS_API_KEY --project-name website
wrangler pages secret put OAUTH_PASSWORD --project-name website
wrangler pages secret put OAUTH_SIGNING_SECRET --project-name website
wrangler pages secret put GSC_CLIENT_ID --project-name website
wrangler pages secret put GSC_CLIENT_SECRET --project-name website
wrangler pages secret put GSC_REFRESH_TOKEN --project-name website
wrangler pages secret put GA4_SERVICE_ACCOUNT_JSON --project-name website
wrangler pages secret put MICROSOFT_CLARITY_API_KEY --project-name website
```

`MCP_BEARER_TOKEN` はローカル検証や非ChatGPTクライアント向けの任意フォールバック。ChatGPT 連携では OAuth を使う。

通常varsは root の `wrangler.toml` に定義する。

```bash
GSC_SITE_URL = "sc-domain:beekle.jp"
GA4_PROPERTY_ID = "355503040"
```

## Deploy

Pagesとしてデプロイする。

```bash
bun run build
wrangler pages deploy dist --project-name website --branch main
```

## ChatGPT / MCP Client

Remote MCP URL:

```text
https://beekle.jp/mcp
```

ChatGPT 側ではこのURLを登録する。未認証時の `WWW-Authenticate` からOAuthメタデータが解決される。

## Field Examples

Blog draft:

```json
{
  "endpoint": "blogs",
  "status": "draft",
  "fields": {
    "title": "雑記タイトル",
    "content": "<p>本文HTML</p>",
    "description": "概要"
  }
}
```

Column draft:

```json
{
  "endpoint": "columns",
  "status": "draft",
  "contentId": "example-column-slug",
  "fields": {
    "title": "コラムタイトル",
    "content": "<h2>見出し</h2><p>本文HTML</p>",
    "description": "SEO description",
    "category": "genai-adoption"
  }
}
```
