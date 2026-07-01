# GA4 ↔ Search Console 連携の確認方法

beekle-site (property/355503040) は SC 連携済み。GA4 Data API で以下の SC メトリクスがランディングページ単位で取得可能:

- `organicGoogleSearchClicks`
- `organicGoogleSearchImpressions`
- `organicGoogleSearchClickThroughRate`
- `organicGoogleSearchAveragePosition`

制約: クエリ単体ディメンション (`googleSearchConsoleQuery`) は GA4 Data API には存在しない。クエリは GA4 管理画面の「Search Console」レポートか、Search Console API 直接利用が必要。

組み合わせ可能なディメンション例: `landingPagePlusQueryString`, `landingPage`, `pagePath`。`sessionDefaultChannelGroup` 等のセッション系ディメンションとは混在不可。

# GA4 Data API で Search Console メトリクスを呼ぶときの落とし穴

`organicGoogleSearchImpressions` / `organicGoogleSearchClicks` / `organicGoogleSearchClickThroughRate` / `organicGoogleSearchAveragePosition` は **dimensionless では呼べない** (`The dimensions and metrics are incompatible.` 400 が返る)。`landingPagePlusQueryString` `landingPage` `pagePath` のいずれかを `dimensions` に入れる必要がある。

合計値を取りたい時は dimension 別で取って手で合計する（GA4 Data API の仕様で SC metrics は totals を返さない）。

`sessions` `keyEvents` 等の通常メトリクスとは **混在不可**。SC系と通常系は別リクエストに分ける。

`sessionDefaultChannelGroup` 等のセッション系 dimension とも混在不可（`.claude/rules/analytics.md` の既述と同根）。

**why**: 4月の SC インプレッション/クリック合計を出した時、最初の素朴なクエリが全部 400 で死んだ。SC連携 metrics は背後でJOINされている特殊メトリクスで自由度が低い。

**how to apply**: SC合計を出すクエリは `dimensions: ["landingPagePlusQueryString"]` 固定、`limit: 250` 程度で全件取って合計するスニペットをテンプレ化する。クエリ単位は GA4 Data API では取れない（既述の通り SC API か GA4 UIへ）。

# DataForSEO LLM Mentions / AI Optimization の現状（2026-07-01 実測）

- アカウント verify は通過済み（旧 40104 は解消）。だが **LLM Mentions 系（ai_opt_llm_ment_*）は別サブスク未有効化で `40204` Access denied**。app.dataforseo.com の Plans and Subscriptions で AI Optimization API を有効化しないと使えない。
- 一方 **`ai_optimization_keyword_data_search_volume`（AI検索ボリューム）はサブスク不要で稼働**。同じ AI Optimization ファミリーでもサブAPIごとにゲートが違う。
- **日本語ロングテールはデータがスカスカ**: rfp/見積もり内訳/cdp比較 等の買い手クエリは ai_search_volume が null。head term のみ値あり（要件定義214だが12ヶ月で約33%減、ai 開発 費用は5→10で倍増、ai 開発 会社28）。→ 日本語の意思決定は Clarity AI Citations(実引用)が優位。Mentions 課金は日本語では費用対効果低い見込み。
- 呼び出しは language_code='ja' / location_name='Japan'。

# 生成AI PoC 問い合わせ増の打ち手（GSC+DataForSEO 実測 2026-07-01）

## データの核心
- DataForSEO AI検索量: 直球PoCクエリはゼロ（生成ai poc / 生成ai poc 費用 / poc 本番化 = null）。需要は定義系上流に集中（mvp とは3497、poc とは139、生成ai 導入20、mvp 開発18↑、プロトタイプ 開発13）。
- GSC(自社4-6月)で「生成ai poc 費用」は **/column/ai-development-cost-guide が pos1.36・50imp・CTR0%**。ただし**title は既に「生成AI開発の費用相場｜PoC 50万〜」とPoC費用を明示済み**＝文言ミスマッチではない。CTR0%はAI Overview(ゼロクリックSERP)か小サンプルが原因。**タイトルが既にクエリに合致しているページは title 書換しても無駄**。
- 「ai 受託開発」248imp/pos32（page3）が最大の潜在需要だが順位が弱い（受け皿強化＝中期施策）。
- /prooffirst(ゼロスタートLP)が唯一クリックを取れる受け皿(297imp/pos4.15/CTR2%)。

## 実施した打ち手（コントロール可能・即効）
PoC意図ページの末尾CTAを汎用 {{CONTACT_CTA}} から {{ZERO_START_CONSULT_CTA}}（0円でPoC/MVP→/contact?intent=zero-start、計測タグ付き）に差替。`scripts/patch-poc-zerostart-cta.mjs`。対象: poc-boundary-line / ai-poc-to-production / mvp-development-guide(replace) / ai-era-development-flow(append)。本番レンダリング検証済。intent=zero-start でPoC問い合わせを計測できる。

## 教訓
1. 「pos1なのにCTR0%」を見たら、まず title が既にクエリに合致してないか確認。合致済みなら AI Overview/小N を疑い、title書換は打たない（[[seo]]のCTR診断の例外）。
2. 直球クエリにAI検索量/Google需要が無い領域は、新規記事でなく**既にインプレを得ているページのCTA/動線最適化**が最有効。
