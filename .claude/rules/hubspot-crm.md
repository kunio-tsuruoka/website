# HubSpot CRM 連携（問い合わせ → Contact + Deal 自動登録）

問い合わせ（`/api/contact`）を Slack 通知と並べて HubSpot CRM に自動登録する。営業の段階管理・履歴を HubSpot に寄せ、Slack は通知＋社内オペ（段階更新・タスク）に使う。後々の自作 ERP は HubSpot の CRM API / Webhook から経営数字を読む想定。

## 実装

- `src/lib/hubspot.ts`: `syncLeadToHubSpot(token, lead, env)`。raw fetch（依存ゼロ）、標準プロパティのみで HubSpot 側の事前カスタム設定不要。
  - Contact を email idProperty で upsert（PATCH → 404 なら POST）
  - Deal を作成し Contact に関連付け（`HUBSPOT_DEFINED` `associationTypeId: 3` = deal_to_contact）
  - 流入アトリビューション（source/intent/phase/着地/参照元/UTM/GA cid）と本文・種別を Deal の `description` に格納
- `src/pages/api/contact.ts`: Slack 送信成功後にベストエフォートで同期。`HUBSPOT_ACCESS_TOKEN` 未設定なら丸ごとスキップ。`runtime.ctx.waitUntil` があればバックグラウンド実行、無ければ await。

## 設計上の鉄則（単一障害点を作らない）

- HubSpot が落ちても問い合わせ（= Slack 通知）は**必ず成功させる**。`syncLeadToHubSpot` は throw せず結果オブジェクトを返し、呼び出し側も `.catch` で握る。
- これは `incident-2026-05-06-slack-webhook-missing.md` の「通知を外部依存にしない」教訓と同じ。CRM 同期は通知のクリティカルパスに入れない。
- Contact だけ成功して Deal が失敗（パイプライン/ステージ ID 不一致など）した場合も `ok: true` 扱いで Deal 失敗のみログ。

## env（Cloudflare Pages secret / plain）

- `HUBSPOT_ACCESS_TOKEN`（secret, 必須）— Private App トークン。未設定なら同期スキップ。
- `HUBSPOT_DEAL_PIPELINE`（plain, optional）— 既定 `default`
- `HUBSPOT_DEAL_STAGE`（plain, optional）— 既定 `appointmentscheduled`（無料プランのデフォルト営業パイプライン初期ステージ）

`default` / `appointmentscheduled` は HubSpot 無料プランのデフォルト営業パイプラインの想定値。**実アカウントでパイプライン/ステージ ID が違うと Deal 作成が 400 になる**ので、トークン投入後に最初の1件で Deal が出来ているか確認し、違えば env で上書きする。ID は HubSpot の Settings → Objects → Deals → Pipelines、または `GET /crm/v3/pipelines/deals` で確認できる。

## セットアップ手順

1. HubSpot **無料**アカウント作成（hubspot.com の「Get started free」。`Start free trial` の有料 Hub トライアルではない）
2. Settings → Integrations → Private Apps → Create で Private App 作成。スコープ:
   - `crm.objects.contacts.read` / `crm.objects.contacts.write`
   - `crm.objects.deals.read` / `crm.objects.deals.write`
3. 発行トークンを Cloudflare Pages に投入:
   ```bash
   export CLOUDFLARE_API_TOKEN=$(cat .cloudflare/api-token)
   export CLOUDFLARE_ACCOUNT_ID=163fc8ca531cbe925ad7597ee0196f3a
   echo "<token>" | bunx wrangler pages secret put HUBSPOT_ACCESS_TOKEN --project-name website
   echo "<token>" | bunx wrangler pages secret put HUBSPOT_ACCESS_TOKEN --project-name website --env preview
   ```
4. ローカル検証は `.dev.vars` に `HUBSPOT_ACCESS_TOKEN=...` を置く
5. HubSpot の Slack アプリ（Marketplace）を接続 → 通知チャンネル設定、Slack から段階更新・メモ・タスク化

## 後々の ERP 連携

- Pull: `GET /crm/v3/objects/deals`（amount / dealstage / closedate）を定期取得して経営数字を集計。無料プランで Private App トークン利用可、レート上限 25万 req/日。
- Push: Webhook で deal の段階変化をリアルタイム受信（1アプリ1000サブスクまで）。
- ロックイン回避したいなら `/api/contact` で自前ストアにも二重書き込みする拡張余地あり（現状は未実装、HubSpot を正とする）。

## 検証手順（トークン投入後）

1. `/contact` か `/downloads/zero-start` からテスト送信
2. HubSpot の Contacts に email で登録されているか、Deals に「Web問い合わせ: …」が出来て Contact に紐づいているか
3. Deal が出来ていなければ Cloudflare のログで `[hubspot] deal create failed` を確認 → パイプライン/ステージ ID を env で修正
4. Slack 通知は従来どおり届くこと（HubSpot 有無に関わらず）
