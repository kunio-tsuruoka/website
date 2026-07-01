# HubSpot CRM 連携（問い合わせ → Contact + Deal 自動登録）

> **【2026-07-01 撤去】HubSpot 連携はコードから外した（ユーザー判断「使っていない」）。**
> - `src/lib/hubspot.ts`（`syncLeadToHubSpot`）を削除。`/api/contact` からも同期呼び出し・env 参照を除去。
> - `layout.astro` から `hubspot-chat.astro`（トラッキング/チャットローダー）の読み込みを外した（本番で全訪問者に HubSpot Cookie を落としていたため）。**コンポーネントファイル自体は将来の再導入用に残置**。
> - Cloudflare Pages の secret（`HUBSPOT_ACCESS_TOKEN` / `HUBSPOT_DEAL_*`）はコードが読まなくなったため無害だが、不要なら手動削除可。
> - **プライバシーポリシー（`/privacy`）に HubSpot は記載しない**（読み込まない＝Cookie を落とさないため開示不要）。再導入するなら委託先テーブル＋Cookie 節への追記が必須。
> 以下は再導入時の参照用に残す。

問い合わせ（`/api/contact`）を Slack 通知と並べて HubSpot CRM に自動登録する。営業の段階管理・履歴を HubSpot に寄せ、Slack は通知＋社内オペ（段階更新・タスク）に使う。後々の自作 ERP は HubSpot の CRM API / Webhook から経営数字を読む想定。

## Slack 連携の重要な制約（2026-06-24 検証）

- **「Slack から顧客に返信」はメール/フォームチャネルでは HubSpot 非対応**。Slack 返信が効くのは **ライブチャット / WhatsApp / Facebook Messenger** のみ（[HubSpot公式](https://knowledge.hubspot.com/integrations/how-do-i-use-the-slack-integration)）。Web フォーム経由のリードを Inbox に入れても Slack からは返信できない。
- 今 Slack に届いている通知は **`/api/contact` の直 incoming webhook**（HubSpot 経由ではない）。HubSpot は CRM 登録のみで、Inbox 会話は作らないので HubSpot→Slack は流れない。
- **決定: Slack双方向は「ライブチャット」で実現する**（ユーザー選択 2026-06-24）。サイトに HubSpot トラッキングコードを入れてチャットウィジェットを表示 → 会話が Inbox に入る → Inbox⇄Slack 連携 → Slack から返信が顧客に届く。フォーム + CRM 同期は並存。
  - 実装: `src/components/analytics/hubspot-chat.astro`（Clarity と同じく本番ホスト `beekle.jp` のみ起動）。ローダーは **na2 リージョン**なので `https://js-na2.hs-scripts.com/246584394.js`（`js.hs-scripts.com` だと 307 で na2 へリダイレクト）。`layout.astro` head に組み込み済み。
  - **コード設置だけではチャットは出ない**。HubSpot 側で chatflow を作成・公開し、対象URLにターゲティング＋Inbox接続が必要。さらに Inbox⇄Slack 連携（ユーザーマッピング、対象チャンネルに HubSpot アプリを招待）。
  - 注: HubSpot トラッキングコードは Cookie を置く。`/privacy` に追記が必要（未対応）。

## アカウント情報（2026-06-24 確認）

- HubSpot ポータル **portalId 246584394**、リージョン **na2**（UI は `app-na2.hubspot.com`、トークンは `pat-na2-...`）。複数アカウントに所属していると `app.hubspot.com`(na1) を見て「レコードが無い」と誤認するので注意。Contact/Deal 直リンクは `https://app-na2.hubspot.com/contacts/246584394/record/0-1/<id>`（deal は `0-3`）。

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

- `HUBSPOT_ACCESS_TOKEN`（secret, 必須）— Service Key（または legacy Private App）トークン。未設定なら同期スキップ。
- `HUBSPOT_DEAL_PIPELINE`（optional）— 既定 `default`
- `HUBSPOT_DEAL_STAGE`（**実質必須**）— コード既定は `appointmentscheduled` だが、これは下記の本番ポータルには存在しない。

### 本番ポータルの実測値（2026-06-24 検証済み, portalId=246584394）

このアカウントの `default`（"Sales Pipeline"）はカスタム済みで、ステージが**数値ID**。`appointmentscheduled` というラベルIDは存在せず Deal 作成が 400（`INVALID_OPTION`）になる。実際のステージ:

| order | stage ID | label |
|---|---|---|
| 0 | **3890223806** | Initial Consultation（= 新規問い合わせの入口。これを使う） |
| 1 | 3890223807 | Prototype Creation |
| 2 | 3890223808 | Prototype Review |
| 3 | 3890223809 | Proposal & Negotiation |
| 4 | closedwon | Closed Won |
| 5 | closedlost | Closed Lost |

→ `HUBSPOT_DEAL_PIPELINE=default` / `HUBSPOT_DEAL_STAGE=3890223806` を Cloudflare Pages（production + preview）と `.env` に設定済み。**コード既定のままだと Contact だけ作られ Deal は静かに 400 で落ちる**（`ok:true` なので気づきにくい）。

ステージIDは `GET /crm/v3/pipelines/deals`（要 `crm.objects.deals.read` 等のスコープ。`bun run --env-file=.env` でトークンをロードして叩くのが手早い）か HubSpot の Settings → Objects → Deals → Pipelines で確認できる。パイプラインを編集すると ID が変わり得るので、400 が出たら再取得して env を更新する。

## セットアップ手順

1. HubSpot **無料**アカウント作成（hubspot.com の「Get started free」。`Start free trial` の有料 Hub トライアルではない）
2. **Service Key を発行する**（2026〜 推奨。旧「Private App」は legacy app 化し新規用途では非推奨）。
   左サイドバー **Development → Keys → Service keys**（または Settings → Integrations → Service Keys）→ **Create service key** → 名前を付けて以下スコープを追加:
   - `crm.objects.contacts.read` / `crm.objects.contacts.write`
   - `crm.objects.deals.read` / `crm.objects.deals.write`

   発行キーは `pat-na1-...` 形式で、Bearer トークンとしてそのまま `HUBSPOT_ACCESS_TOKEN` に入る（`src/lib/hubspot.ts` は `Authorization: Bearer ${token}` で叩くだけなのでコード変更不要）。Service Key の利点: 無停止ローテーション / 監査ログ / アカウントレベル（個人退職に影響されない）。
   - **制約**: Service Key は **Webhook 非対応**。現状の push（Contact + Deal 作成）には影響しないが、下記「後々の ERP 連携」の Webhook 受信をやる時は project-based app（HubSpot CLI）か legacy private app が別途必要。
   - 公式: https://developers.hubspot.com/blog/hubspot-service-keys-the-right-api-credential-for-data-integrations / https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/account-service-keys （2026-06 時点 public beta）
   - 旧 Private App でも当面は動く（Settings → Integrations → Private Apps、legacy 表示）。既存トークンがあるならそのまま流用可。
3. 発行トークン（Service Key）を Cloudflare Pages に投入:
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
