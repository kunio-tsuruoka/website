# GA4 MCP セットアップ記録 (2026-04-28)

Claude Code から GA4 データを取得できるよう、google-analytics-mcp を導入した記録。

## 構成

| 項目 | 値 |
|---|---|
| GCP Project | `ga4-mcp-beekle` (Org: beekle.jp) |
| Service Account | `ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com` |
| SA キー JSON | `/Users/kunio/.gcp-keys/ga4-mcp-beekle.json` (chmod 600, .gitignore対象外なのでコミット禁止) |
| GA4 Property ID | `355503040` |
| MCP サーバー | `google-analytics-mcp` (uv tool で導入) |
| Claude Code 登録 | user scope `ga4`、`/Users/kunio/.local/bin/google-analytics-mcp` |
| 有効化 API | `analyticsadmin.googleapis.com`, `analyticsdata.googleapis.com` |

## セットアップで詰まった点と回避策

### 問題1: GA4 UI でサービスアカウント追加が必ず失敗
"This email doesn't match a Google Account" というエラーで弾かれる。GA4 の「ユーザー追加」UI は People API でアカウント検索するため、サービスアカウントを認識できない。

→ **GA4 Admin API 経由でしか追加できない**

### 問題2: `gcloud auth login --scopes=...analytics.edit...` が "App is blocked" でブロック
beekle.jp Workspace のセキュリティポリシーで Google Cloud SDK (Client ID: `32555940559.apps.googleusercontent.com`) は analytics.edit スコープを取得できない。
Workspace 管理画面で「3rd party apps」「Google services」「Internal apps」すべて寛容設定にしてもこの制限は変わらない (Google Cloud SDK 自体に Workspace ユーザー向けのスコープ allowlist が組み込まれているため、管理者でも変更不可)。

→ **独自 OAuth クライアントを GCP プロジェクト内に作って迂回する**

### 解決手順 (再現用)

1. `https://console.cloud.google.com/auth/branding?project=ga4-mcp-beekle` で OAuth 同意画面を作成 (Audience: **Internal**)
2. `https://console.cloud.google.com/auth/clients?project=ga4-mcp-beekle` で OAuth 2.0 Client ID 作成 (Application type: **Desktop app**)
3. JSON ダウンロード → `/Users/kunio/.gcp-keys/oauth-client.json`
4. ADC 認証:
   ```sh
   gcloud auth application-default login \
     --client-id-file=/Users/kunio/.gcp-keys/oauth-client.json \
     --scopes='https://www.googleapis.com/auth/analytics.manage.users,https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/cloud-platform'
   ```
   ※ `analytics.manage.users` スコープが必須 (`analytics.edit` だけでは accessBindings API が PERMISSION_DENIED になる)
5. `gcloud auth application-default print-access-token` は独自スコープを返さないため、**OAuth リフレッシュエンドポイントを直叩き**してトークン取得:
   ```sh
   REFRESH=$(python3 -c "import json; print(json.load(open('/Users/kunio/.config/gcloud/application_default_credentials.json'))['refresh_token'])")
   TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
     -d "client_id=<OAuth client id>" \
     -d "client_secret=<OAuth client secret>" \
     -d "refresh_token=$REFRESH" \
     -d "grant_type=refresh_token" | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")
   ```
6. SA を GA4 プロパティに「閲覧者」で追加:
   ```sh
   curl -X POST \
     "https://analyticsadmin.googleapis.com/v1alpha/properties/355503040/accessBindings" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"user": "ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com", "roles": ["predefinedRoles/viewer"]}'
   ```

## 動作確認

Claude Code 再起動後、`claude mcp list` で `ga4: ✓ Connected` を確認。「先月のセッション数を教えて」などで GA4 データが返る。

## 別 GA4 プロパティを追加する場合

同じ SA を別プロパティに追加するだけ。手順 6 の `properties/<ID>` を変更して再実行。
