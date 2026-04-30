# GA4 (gtag) implementation gotchas

## `define:vars` を使う `<script is:inline>` は IIFE 化される

Astro の `<script is:inline define:vars={{ X }}>` は内部的に IIFE で囲まれるため、`function gtag(){}` のような関数宣言は **window に紐づかない**。`window.gtag` が `undefined` になり、任意の `gtag('event', ...)` 呼び出しが **無音で失敗する**（dataLayer の自動計測は動くので一見正常に見えるのが厄介）。

→ 必ず `window.gtag = function(){ ... }` の形で明示的に window に貼り付ける。`src/components/analytics/ga4.astro` 参照。

## GA4 Enhanced Measurement の form_submit は `e.preventDefault()` で発火しない

`fetch` で送信するフォームのように `e.preventDefault()` するパターンでは、Enhanced Measurement の自動 form_submit は `gtm.formCanceled: true` として記録され、GA4 の `form_submit` イベントには変換されない。

→ submit 成功時に **明示的に `gtag('event', 'form_submit', { ... })` と `gtag('event', 'generate_lead', { ... })` を呼ぶ**。CV計測の信頼性のため二重保険として遷移先（thanks ページ）でも `gtag('event', 'contact_complete', ...)` を発火させる。

## ローカル `.env` の SLACK_WEBHOOK_URL はプレースホルダ

`your_slack_webhook_url_here` のままでローカルでは `/api/contact` が 500 を返す。本番(Cloudflare)には別途設定済み。フォームの計測検証時は Playwright の `context.route()` で `/api/contact` を 200 にスタブして実 webhook を叩かない。

## 検証スクリプト

`scripts/verify-contact-cv.mjs` を `node` で実行。`bun dev` 起動後に走らせると、Playwright が `/contact` → submit → `/thanks` を自動で踏んで dataLayer に積まれた gtag イベントを検証する。
