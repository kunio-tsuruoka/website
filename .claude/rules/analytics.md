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
