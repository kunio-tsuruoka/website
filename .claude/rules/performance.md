# Frontend performance の実態（2026-07-07 実測）

- 本番HTMLは `cf-cache-status: DYNAMIC`（キャッシュなし）だったため src/middleware.ts でCache API エッジキャッシュを導入（s-maxage=300, /api/*除外, x-edge-cacheヘッダーでHIT/MISS確認可）。**MicroCMS PATCHの本番反映は最大5分遅延**するようになった（従来の「即反映」前提のルールに注意）。
- ~~`src/styles/global.css` はデッドファイル~~ → **PR #82（2026-07-07）で復活済み**。layout.astro が import、`@astrojs/tailwind` は `applyBaseStyles: false`。デザインシステムのクラス（gradient-text / decoration-bar-* / btn-* / number-label 等）は本番で有効。基底 h1-h6 の text-gray-900 は意図的に外してある（紺背景見出しの黒化防止）— 再追加しないこと。
- **フォントは Poppins のみ（400-800, 約43KB）を head 直リンクで読込**。Noto Sans JP を追加してはいけない: JPグリフのサブセット群で約800KB増、実測でLCP 589→1941ms / perf 1.00→0.87 に悪化し、PR #84 で除去した。日本語はシステムフォントが正（design.md §3.1 の「本文=Noto Sans JP」は本番非適用の設計意図として読む）。フォント追加は必ずLighthouse実測とセットで。
- Header は全ページ client:idle、下層セクションは client:visible が基準。新規ページで `<Header client:load />` を書かない。
- **Preview環境に MICROCMS_API_KEY / MICROCMS_SERVICE_DOMAIN が無くコラムが全302→/404だった**（2026-07-07発見・投入済み）。プレビューでコラムが壊れていたら secrets を `wrangler pages secret list --project-name website --env preview` で実機確認する。Preview には OPENROUTER_API_KEY も無い（AIデモはプレビューで動かない、意図的に未投入のまま）。
- 効果実測（2026-07-07, PR #81後）: 本番TTFB hit時 0.07〜0.22s（導入前 0.09〜4.9sのブレ）、Lighthouse desktop perf 0.93→1.00（home）/0.92→0.99（column）、LCP 1511→589ms（home）。デザインシステム復活+Poppins追加後（#82-#84）はperf 0.94（home, ウォーム時）で安定。
- デプロイ直後のLighthouseはTTFB外れ値（コールドisolate+キャッシュmiss、5秒台）を踏むことがある。1回の低スコアで判断せず再計測する。エッジキャッシュのHIT検証は `?v=xxx` クエリでキャッシュキーを分ければバイパス確認もできる。
