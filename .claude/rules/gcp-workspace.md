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

## Workspace OAuth の落とし穴
- `gcloud auth login --scopes=...analytics.edit...` のように **restricted/sensitive スコープ** を Google Cloud SDK (Client ID `32555940559`) で要求すると "App is blocked" でブロックされる
- Workspace 管理画面 (admin.google.com) の Allowlist や trusted apps 設定では解除不可 (Google Cloud SDK 自体が Workspace ユーザー向けスコープ allowlist を持っているため)
- **回避策**: GCP プロジェクト内に独自 OAuth クライアント (Audience: Internal, Type: Desktop app) を作って `--client-id-file` で使う
- 既存の OAuth クライアント (Internal, Desktop): `ga4-mcp-beekle` プロジェクト内、JSON は `~/.gcp-keys/oauth-client.json`

## GA4 Admin API のスコープ
- `accessBindings` 系には `analytics.manage.users` 必須 (`analytics.edit` だけでは PERMISSION_DENIED)
- `gcloud auth application-default print-access-token` は独自スコープを返さないため、OAuth リフレッシュエンドポイント (`https://oauth2.googleapis.com/token`) を curl 直叩きしてトークン取得する
