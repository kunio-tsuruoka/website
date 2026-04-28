# GA4 ↔ Search Console 連携の確認方法

beekle-site (property/355503040) は SC 連携済み。GA4 Data API で以下の SC メトリクスがランディングページ単位で取得可能:

- `organicGoogleSearchClicks`
- `organicGoogleSearchImpressions`
- `organicGoogleSearchClickThroughRate`
- `organicGoogleSearchAveragePosition`

制約: クエリ単体ディメンション (`googleSearchConsoleQuery`) は GA4 Data API には存在しない。クエリは GA4 管理画面の「Search Console」レポートか、Search Console API 直接利用が必要。

組み合わせ可能なディメンション例: `landingPagePlusQueryString`, `landingPage`, `pagePath`。`sessionDefaultChannelGroup` 等のセッション系ディメンションとは混在不可。
