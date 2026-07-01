# Incident: 本番 SLACK_WEBHOOK_URL 未設定で /api/contact が全件500 (2026-05-06)

## 症状
本番 https://beekle.jp で /contact フォームと /downloads/zero-start フォームが「サーバー設定エラーが発生しました」(HTTP 500) を返していた。期間不明（少なくとも 2026-05-06 ユーザー発見時点で発生）。

## 直接原因
Cloudflare Pages production の secrets に `SLACK_WEBHOOK_URL` が無かった。`/api/contact` (src/pages/api/contact.ts:47-50) は SLACK_WEBHOOK_URL が必須で、無ければ即500を返す設計。

## 根本原因（推定、確証なし）
- `.claude/rules/ai-demo-infrastructure.md` には「設定済み」と書かれていたが実機未設定
- 設定された時期 / 消えた時期 / 誰が消したか は不明（secret操作は git に残らない）
- Cloudflare Pages の secret 削除は誰でも CLI/dashboard から実行可能、監査ログを能動的に見ない限り検知できない

## システム的問題（より深刻）
1. **通知の単一障害点**: Slackが死んだら通知経路ゼロ → リードが silent failure で消失
2. **監視ゼロ**: 5xx エラーを誰も見ない、deploy 後の smoke test なし
3. **GA4 計測も来ない**: フォーム失敗時は gtag イベント発火しないため数値からも気づけない
4. **docs が現実と乖離**: `.claude/rules/` の secret 設定状況を信じてはいけない（実機 `wrangler pages secret list` で確認するルールを cloudflare.md に追加済み）

## 復旧手順
1. Slack incoming webhook 新規作成 (https://api.slack.com/apps → Incoming Webhooks → Add New Webhook)
2. `echo "<URL>" | bunx wrangler pages secret put SLACK_WEBHOOK_URL --project-name website` で production に投入
3. 同じく `--env preview` でも投入

## 再発防止 TODO（優先度順）
- [ ] **通知冗長化**: `/api/contact` に email fallback を追加（MailChannels or Resend）。Slack送信失敗時 or 並行送信。単一障害点解消が最優先。
- [ ] **`/api/health` 追加**: 必須 env 変数の存在チェック（値は返さない）。Cloudflare Workers cron で 1時間毎にpingし、502以上なら別経路で通知。
- [ ] **Deploy pre-flight check**: GitHub Actions の deploy job で `wrangler pages secret list` を叩いて必須 secrets 存在を検証、不足なら deploy fail。
- [ ] **必須env一覧の単一情報源**: `src/lib/required-env.ts` 等にリストし、各ファイルでimport。docsを真実の源にしない。

## why this matters
お問い合わせと資料DLの両方が同時に死ぬ。検討段階の濃いリードが消えるので、機会損失が直接売上に響く。
