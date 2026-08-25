# HubSpot CRM 廃止 / beekle-crm 連携

> **2026-07-01にHubSpot連携は撤去済み。2026-08-21時点でも再導入しない。**

## 現在の正

- 問い合わせフォームは `/api/contact` から Slack 通知と `beekle-crm` webhook へ送る。
- CRM webhook の環境変数は `CRM_INQUIRY_WEBHOOK_URL` / `CRM_INQUIRY_WEBHOOK_TOKEN` / `CRM_INQUIRY_WEBHOOK_AUTH_HEADER`。
- リード・商談の確認は `beekle-crm` コネクタを使う。
- MicroCMS/Marketing MCP は MicroCMS、GA4、GSC、Clarity を扱う。HubSpot認証やHubSpot API読み取りは扱わない。

## やらないこと

- `HUBSPOT_ACCESS_TOKEN` / `HUBSPOT_DEAL_PIPELINE` / `HUBSPOT_DEAL_STAGE` を復活させない。
- 「HubSpot認証を直す」タスクを作らない。
- HubSpotチャット/トラッキングコードを `layout.astro` に戻さない。
- プライバシーポリシーにHubSpotを追加しない。読み込んでいないためCookie開示対象にしない。

## 補足

- HubSpotチャットの未使用コンポーネントも削除済み。再導入する場合は、先にCRM方針、Cookie開示、Slack返信導線を確認する。
- Cloudflare Pages のHubSpot secretsは production・preview とも削除済み。再設定しない。
