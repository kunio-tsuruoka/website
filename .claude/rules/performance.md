# Frontend performance の実態（2026-07-07 実測）

- 本番HTMLは `cf-cache-status: DYNAMIC`（キャッシュなし）だったため src/middleware.ts でCache API エッジキャッシュを導入（s-maxage=300, /api/*除外, x-edge-cacheヘッダーでHIT/MISS確認可）。**MicroCMS PATCHの本番反映は最大5分遅延**するようになった（従来の「即反映」前提のルールに注意）。
- `src/styles/global.css` は**どこからもimportされていない完全なデッドファイル**。Tailwindは astro.config.mjs の `@astrojs/tailwind` 統合が自前で注入。global.css内のGoogle Fonts @import・独自クラス（gradient-text / decoration-bar-* / btn-* / section-label等）は本番CSSに一切含まれず、Poppins/Noto Sans JPはシステムフォントにフォールバック中。マークアップはこれらのクラスを参照しているが無効。復活させるとフォント全ウェイト読込で性能悪化するので、wireする場合はウェイト削減必須。
- Header は全ページ client:idle、下層セクションは client:visible が基準。新規ページで `<Header client:load />` を書かない。
- **Preview環境に MICROCMS_API_KEY / MICROCMS_SERVICE_DOMAIN が無くコラムが全302→/404だった**（2026-07-07発見・投入済み）。プレビューでコラムが壊れていたら secrets を `wrangler pages secret list --project-name website --env preview` で実機確認する。Preview には OPENROUTER_API_KEY も無い（AIデモはプレビューで動かない、意図的に未投入のまま）。
- 効果実測（2026-07-07, PR #81後）: 本番TTFB hit時 0.07〜0.22s（導入前 0.09〜4.9sのブレ）、Lighthouse desktop perf 0.93→1.00（home）/0.92→0.99（column）、LCP 1511→589ms（home）。
