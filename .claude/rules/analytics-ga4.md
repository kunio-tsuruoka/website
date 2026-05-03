# GA4 (gtag) implementation gotchas

## `define:vars` を使う `<script is:inline>` は IIFE 化される

Astro の `<script is:inline define:vars={{ X }}>` は内部的に IIFE で囲まれるため、`function gtag(){}` のような関数宣言は **window に紐づかない**。`window.gtag` が `undefined` になり、任意の `gtag('event', ...)` 呼び出しが **無音で失敗する**（dataLayer の自動計測は動くので一見正常に見えるのが厄介）。

→ 必ず `window.gtag = function(){ ... }` の形で明示的に window に貼り付ける。`src/components/analytics/ga4.astro` 参照。

## GA4 Enhanced Measurement の form_submit は `e.preventDefault()` で発火しない

`fetch` で送信するフォームのように `e.preventDefault()` するパターンでは、Enhanced Measurement の自動 form_submit は `gtm.formCanceled: true` として記録され、GA4 の `form_submit` イベントには変換されない。

→ submit 成功時に **明示的に `gtag('event', 'form_submit', { ... })` と `gtag('event', 'generate_lead', { ... })` を呼ぶ**。CV計測の信頼性のため二重保険として遷移先（thanks ページ）でも `gtag('event', 'contact_complete', ...)` を発火させる。

## `gtag('event', ...)` 直後の `window.location.href = ...` で後続イベントが落ちる

最も罠なのがこれ。複数の `gtag('event', ...)` を連続で呼んでから即 `window.location.href = '/thanks'` すると、**最初の1〜2件は落ちて2件目以降が残る**ような中途半端なドロップが起きる（GA4は内部的に sendBeacon を使うが、複数発火を直後にunload するとキューが間に合わない）。

実例: 2026-02〜04の3ヶ月で `form_submit` は6件記録されているのに `generate_lead` が完全に欠落していた（同じ関数の連続行で呼んでいるのに）。原因はこの race condition。

→ **最後のイベントに `event_callback` を付けて、コールバック内でナビゲーションする**。タイムアウト保険(1.5sec程度)も合わせて入れる。`transport_type: 'beacon'` も明示するとより堅牢:

```ts
const fallback = setTimeout(navigate, 1500);
window.gtag('event', 'generate_lead', { ...params, transport_type: 'beacon' });
window.gtag('event', 'form_submit', {
  ...params,
  transport_type: 'beacon',
  event_callback: () => { clearTimeout(fallback); navigate(); },
});
```

`/thanks` 側の `contact_complete` も同様に、**HTMLパース中の同期fireでは gtag.js 未ロードで落ちる**ことがある。`window.load` イベントで再試行する保険を入れる（`src/pages/thanks.astro` 参照）。

## キーイベント (旧コンバージョン) は GA4 Admin API で作成する

`form_submit` `generate_lead` `contact_complete` をキーイベント化するスクリプト: `scripts/setup-ga4-key-events.mjs`。SAキー (`~/.gcp-keys/ga4-mcp-beekle.json`) で `analytics.edit` scope を取って `properties/355503040/keyEvents` に POST する。詳細は `.claude/rules/gcp-workspace.md`。

## ローカル `.env` の SLACK_WEBHOOK_URL はプレースホルダ

`your_slack_webhook_url_here` のままでローカルでは `/api/contact` が 500 を返す。本番(Cloudflare)には別途設定済み。フォームの計測検証時は Playwright の `context.route()` で `/api/contact` を 200 にスタブして実 webhook を叩かない。

## 検証スクリプト

`scripts/verify-contact-cv.mjs` を `node` で実行。`bun dev` 起動後に走らせると、Playwright が `/contact` → submit → `/thanks` を自動で踏んで dataLayer に積まれた gtag イベントを検証する。

# `form_submit` イベントは2026-02〜04時点でスパム前提

GA4の `form_submit` `generate_lead` `contact_complete` は **`/contact` フォーム経由のスパム送信を多く含む**（実問い合わせはこの期間ほぼゼロ）。CV率の逆算KPI（月X件リード = 月Yセッション）には使えない。

**how to apply**: リード件数を語るときは GA4 のフォームイベントではなく **手元で集計した実問い合わせ件数**（メール / Slack 通知の到着数）を使う。GA4 月次レポートにフォームCV欄を入れる時は「スパム含む」と明記するか、項目自体を外す。

**why**: 2026-05-03 のレポート作成時、ユーザーから「form_submit はスパムなので無視」と明示された。`/contact` には Turnstile を入れているが、bot がトークン取得できる経路があるのか実質的にすり抜けている。CAPTCHA/Honeypot の追加検討余地あり。
