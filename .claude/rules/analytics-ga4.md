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

# カスタマージャーニー計測（2026-05-30 実装）

ジャーニーを「流入 → 回遊 → ツール利用 → リード/DL → 完了」で追えるよう、以下を実装した。GA4 の探索（Explore）の **経路データ探索 / 目標到達プロセス** で読む前提。

## 計測の構成要素

- **content_group**（`src/components/analytics/ga4.astro`）: `Astro.url.pathname` から `home/column/tool/service/download/contact/thanks/lp/other` を判定し、`gtag('config', ID, { content_group })` に乗せる。GA4 標準ディメンション「コンテンツ グループ」なのでカスタムディメンション登録は不要。ページ種別をまたいだ経路が読みやすくなる。
- **scroll_depth**（`initEngagementTracking()` in `src/lib/analytics.ts`、`layout.astro` の body script から起動）: 長尺ページ（スクロール余地が画面高の0.5倍以上）でのみ 25/50/75/100% 到達で `gtag('event','scroll_depth',{ scroll_depth: '50', ... })` を発火。既存のカスタムディメンション `scroll_depth`（EVENT scope、旧WP由来）を再利用。短いページはノイズ防止で計測しない。100%到達後は scroll リスナを解除。
- **cta_click / tool_***（既存）: `data-cta-source` のグローバルクリック委譲（`layout.astro`）と `trackToolEvent()`。`source/cta/phase/tool` はカスタムディメンション登録済み。

## user_id は **あえて入れていない**（2026-05-30 検討の結論）

一度 user_id（メールの SHA-256 ハッシュ）を `gtag('set')` + localStorage 永続化で実装したが、**撤去した**。理由:

- このサイトは **ログイン機能が無い** → コンバージョン（メール送信）まで「誰か」が分からない。匿名のクロスデバイス・ジャーニーは原理的に追えない。user_id はメールを送信した時点以降しか効かない。
- 「スマホで匿名閲覧 → PC で資料DL」は **繋がらない**（共通の user_id が両端末に現れないため）。端末をまたぐのは「両方の端末で同じメールで送信した」稀なケースだけ。
- 同一ブラウザ内の名寄せは **client_id が既に担当**しているので user_id の純増価値が小さい。
- localStorage に user_id を残すと、**共有ブラウザ**で別人の匿名閲覧が前の送信者の user_id に紐づく **attribution 汚染**リスクが出る。
- 将来ログイン/会員機能を入れるなら、その永続 ID を user_id にするのが筋。メールハッシュ方式は不採用。

## 制約・注意

- ジャーニー定義（ファネル / 経路）は **GA4 探索 UI 側で組む**。コードにファネル定義は持たない。
- 既存の「form_submit はスパム含む」前提は変わらない。ジャーニーの終点 CV は `download_request`（資料DL専用、2026-05-30 キーイベント化）か `generate_lead` を見る。

## キーイベント（2026-05-30 時点）

`form_submit, generate_lead, contact_complete, cta_click, download_request, purchase`。`scripts/setup-ga4-key-events.mjs` の `TARGET_EVENTS` が真実源（`download_request` 追加済み）。

# 問い合わせの「どう来たか」: source は CTA位置、流入は別途アトリビューションで捕捉（2026-06-12）

`/api/contact` の `source`（例: `header-desktop`, `download-zero-start-...`）は**流入チャネルではなく「サイト内のどのCTAを押したか」**。`header-desktop` は `header.tsx` の `/contact?source=header-desktop` ＝ PCヘッダーの問い合わせボタンを押した、という意味でしかない。

## 流入元（参照元/検索/直接）の追い方
- contact API のペイロードには referrer/UTM/チャネルが**昔は一切無かった**ため、問い合わせ単体からは流入元が不明だった。
- 2026-06-12 に `src/lib/attribution.ts`（`captureFirstTouch`/`getGaClientId`/`getAttribution`）を追加。`layout.astro` が全ページで first-touch（着地ページ・外部 referrer・UTM）を sessionStorage に記録し、フォーム送信時に GA client_id（`_ga` クッキー由来）と合わせて `/api/contact` へ同送 → Slack 通知に「流入」ブロックで表示。contact-form / download-zero-start-form 両方が対象。
- **本変更以降の問い合わせ**のみ流入元が分かる。既存は遡及不可。

## GA4 で個人を特定できない理由（再掲・重要）
- 設計上 user_id を持たない（このファイル下部の方針）。だから特定の問い合わせ者のセッションを GA4 で名指しできない。
- 当日の問い合わせは GA4 の処理遅延で着地ページが `(not set)` に固まり、`generate_lead`/`form_submit`/`cta_click` も当日中はほぼ反映されない。journey の裏取りは翌日以降。
- ヘッダーCTAの `cta_click` はアンカー即遷移で beacon が落ちやすく記録漏れが多い（レース条件、本ファイル既述）。
- **今後の照合手段**: Slack に出る GA client_id を GA4 探索（client_id ディメンション無いが、BigQuery export や User Explorer 的手段）で突き合わせる余地。最も確実なのは Slack 通知の「流入」ブロックをそのまま読むこと。

# Microsoft Clarity 導入済み（2026-06-13）

ヒートマップ＋セッション録画は Microsoft Clarity（project ID `x69z1qvv1l`、公開クライアントID）。`src/components/analytics/clarity.astro` を `layout.astro` head で GA4 の直後に全ページ読み込み。

- **本番ドメイン (`beekle.jp` / `www.beekle.jp`) でのみ起動**するホスト名ガード付き（`/(^|\.)beekle\.jp$/.test(location.hostname)`）。dev・preview(`*.pages.dev`) は録画しない＝ダッシュボードを汚さない。
- 目的: CVR改善フェーズのトラックA（動線改善）で「発注者がどこで離脱するか」を実観察する（[[content-strategy-goals]] 参照）。
- env 不要・依存追加なし。ID は GA測定IDと同様ハードコード。
- フォローアップ未対応: プライバシーポリシー(`/privacy`)に Clarity の記載を追記（既定で全テキスト/入力マスクだが計測ツール明示のため）。

# Microsoft Clarity ↔ GA4 連携（2026-06-19 接続）

Clarity(project x69z1qvv1l) と GA4(property 355503040) を連携。データ反映は接続から24時間後。

## 取れるもの / 取れないもの
- 取れる: AI経由トラフィック（GA4 の `AI Assistant` チャネル / `chatgpt.com` 等ソース）の**セッション録画とヒートマップ**を横断視聴。「AIがどのページを引用し、訪問者がどう動いたか（挙動・離脱）」が分かる。
- 取れない: **ChatGPT等に打たれたプロンプト（クエリ）本文は依然不可**。Clarity+GA4 でも出ない。入力もマスク。プロンプト単位は DataForSEO LLM Mentions（[[reference_dataforseo]]、7/1〜・要サブスク有効化）か手動サンプリングのみ。

## 使い方
- Clarity の **Google Analytics タブ → Acquisition** でチャネル(AI Assistant等)をダブルクリック → 着地ページ → 炎(ヒートマップ)/ビデオ(録画)アイコンで視聴。
- GA4 側に **`Clarity Playback URL` カスタムディメンション**が自動追加される。GA4 探索で session source=chatgpt等で絞り、このディメンションを並べると録画リンクへ直接飛べる。
- 制約: 反映24h / Clarity は 2026-06-13 導入で数日分のみ / AI流入は低volume(45日で約26セッション)で録画は0〜数本 / ChatGPTアプリ経由はリファラ落ちで Direct 扱いになり抽出漏れ。

関連: [[content-strategy-goals]]（CVR改善トラックA=動線をClarityで観察）、project_ai_search_baseline。

# 訂正: AIの「引用クエリ」は Clarity AI Citations で取れる（2026-06-19）

過去の自分の断定「ChatGPT等のプロンプト/クエリはどのツールでも取れない」は**誤り**。リファラ経由では不可だが、**Microsoft Clarity の AI Visibility → AI Citations** が「実際の引用＋その背後のクエリ」を複数AIプラットフォーム横断で出す（Microsoftが Bing/Copilot 等の自前データを持つため）。公式: clarity.microsoft.com/blog/understanding-your-influence-ai-citations 「based on real citations and the queries behind them」。

## AI Visibility は3層
- **Bot Activity**: どのAIクローラ(GPTBot/ClaudeBot/PerplexityBot/Bingbot)がどのページをクロールしたか。**CDN連携(Cloudflare)が必要**。
- **AI Citations**: 引用された自社コンテンツ＋背後のクエリ。一般提供済み(有効化で見られる)。
- **AI Platform Channels**: AI経由の流入量（GA4の chatgpt.com 等の上位互換）。

## 注意・線引き
- Clarity Data Export API（`MICROSODT_CLARITY_API_KEY` ※env のキー名はこのtypoのまま）のディメンションは Browser/Device/Country/OS/Source/Medium/Campaign/Channel/URL、メトリクスは Scroll/Engagement/Traffic/Rage・Dead Click 等。**これはトラフィック/挙動の export で、AI Citations(クエリ)とは別系統**。numOfDays=1-3(直近72h)、10req/日、1000行上限。エンドポイント: `GET https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3&dimension1=Source&dimension2=URL`、`Authorization: Bearer <token>`。
- AI Citations をAPI/exportで引けるかは未確認（ダッシュボード機能）。
- Beekle は Cloudflare Pages。Bot Activity は Cloudflare CDN 連携で取得可能。

関連: [[content-strategy-goals]]、[[reference_dataforseo]]（DataForSEO LLM Mentions は別経路・7/1〜要サブスク）。
