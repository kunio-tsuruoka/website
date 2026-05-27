# GCP / Google Workspace 連携 (beekle.jp)

## GA4 MCP は導入済み (2026-04-28)
- 詳細: `docs/ga4-mcp-setup.md`
- SA: `ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com`, キー: `~/.gcp-keys/ga4-mcp-beekle.json`
- GA4 Property: 355503040
- **SA は GA4 プロパティで「編集者」ロール付与済み (2026-04-30)** → Admin API で keyEvents 等の作成・更新・削除が可能

## GA4 Admin API は SA でやる（OAuth不要）
GA4 MCP は read-only。Admin系操作 (キーイベント作成等) は SA + `google-auth-library` で `analytics.edit` scope のトークンを発行して直接 Admin API を叩くのが最短。OAuth ADC は scope 制約があり面倒。

```js
const { GoogleAuth } = require('./node_modules/google-auth-library');
const auth = new GoogleAuth({
  keyFile: '~/.gcp-keys/ga4-mcp-beekle.json',
  scopes: ['https://www.googleapis.com/auth/analytics.edit'],
});
const token = (await (await auth.getClient()).getAccessToken()).token;
```

`POST https://analyticsadmin.googleapis.com/v1beta/properties/355503040/keyEvents` で `{eventName, countingMethod: "ONCE_PER_EVENT"}` を投げれば作成。`accessBindings` 系だけは `analytics.manage.users` も必要なので注意。

## GSC (Search Console) は OAuth 必須 — SA では使えない (2026-05-28)

- SA (`ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com`) は GSC プロパティに追加**できない**。Google 側のバグで「このメールアドレスは Google アカウントと一致しません」と拒否される（https://support.google.com/analytics/thread/428546868 参照）
- `.mcp.json` の `gsc` MCP は `GOOGLE_APPLICATION_CREDENTIALS` に SA キーを指定しているが、`siteUnverifiedUser` になりデータ取得不可
- **回避策**: `scripts/gsc-oauth-setup.mjs` で OAuth 認証を完了し、トークンを `~/.gcp-keys/gsc-token.json` に保存済み
- GSC API 経由で `searchAnalytics.query` (readonly scope) は取得可能
- サイトマップ送信 (`webmasters.readonly` scope では権限不足) は管理画面から手動送信が必要

### GSC データ取得スクリプト

```bash
node scripts/gsc-query.mjs                       # JSON (全件, query+page)
node scripts/gsc-query.mjs --query-only --top 100 # クエリ上位100件
node scripts/gsc-query.mjs --page-only --csv      # ページ別 CSV
node scripts/gsc-query.mjs --start 2026-05-01 --end 2026-05-28
```

トークンは自動リフレッシュされる（期限切れ時に `refresh_token` でアクセストークンを再取得し `gsc-token.json` に上書き保存）。`refresh_token` 自体が失効した場合は `node scripts/gsc-oauth-setup.mjs` を再実行してブラウザ認証をやり直す。

### MCP 側の制約

`mcp-server-gsc` (npm) は `GoogleAuth({ keyFile })` で SA 認証のみ対応。OAuth トークンは読めない。将来 OAuth 対応の GSC MCP が出るか、`mcp-server-gsc` を fork するまではスクリプト経由で取得する運用。

## Workspace OAuth の落とし穴
- `gcloud auth login --scopes=...analytics.edit...` のように **restricted/sensitive スコープ** を Google Cloud SDK (Client ID `32555940559`) で要求すると "App is blocked" でブロックされる
- Workspace 管理画面 (admin.google.com) の Allowlist や trusted apps 設定では解除不可 (Google Cloud SDK 自体が Workspace ユーザー向けスコープ allowlist を持っているため)
- **回避策**: GCP プロジェクト内に独自 OAuth クライアント (Audience: Internal, Type: Desktop app) を作って `--client-id-file` で使う
- 既存の OAuth クライアント (Internal, Desktop): `ga4-mcp-beekle` プロジェクト内、JSON は `~/.gcp-keys/oauth-client.json`

## GA4 Admin API のスコープ
- `accessBindings` 系には `analytics.manage.users` 必須 (`analytics.edit` だけでは PERMISSION_DENIED)
- `gcloud auth application-default print-access-token` は独自スコープを返さないため、OAuth リフレッシュエンドポイント (`https://oauth2.googleapis.com/token`) を curl 直叩きしてトークン取得する
