## マーケデータは docs/marketing/data/ の統合ハブを起点にする（2026-07-01 新設）

散らばった計測データ（GSC / GA4 / Clarity AI Citations / DataForSEO・rakko）を単一ハブに正規化スナップショットで集約した。**データドリブンで SEO/LLMO/CVR を分析する時は、まずハブの latest を読む → 古ければ refresh → 読み直す**の順で動く。ad-hoc に one-off スクリプトを書き直さない。

- 入口スキル: `.claude/skills/marketing-data/SKILL.md`（ハブの読み方 + MCP系レシピ）。
- ハブ: `docs/marketing/data/`（**gitignore済・ローカル専用**。`index.json` を最初に読む、`README.md` は自動生成）。取得ツール `scripts/data/*` と skill だけ commit される。
- refresh: `bun run data:refresh`（GSC+GA4+Clarity一括） / 個別 `data:gsc` `data:ga4` `data:clarity`。
- スクリプト化済ソース: **GSC**（OAuth token, query/page別 + 派生 `ctr-opportunities.json`＝pos5-20/imp>=30/低CTRを取りこぼしスコア順）、**GA4**（SAトークンで Data API 直叩き, content-group/channels/top-pages/key-events/sc-landing の5レポート）、**Clarity AI Citations**（~/Downloads の CSV を自動取込、生CSVは raw/ に保存）。
- MCP系（DataForSEO/rakko/Clarity API）は LLM が MCP で取得 → `node scripts/data/save-mcp.mjs <source> <name> --file result.json` で同じハブ規約に正規化保存。
- GA4のSC連携メトリクスは `landingPagePlusQueryString` 必須（`landingPage` は400・非互換）。既存 gsc-query.mjs はそのまま残置（このハブ版はそれを内包・拡張）。
- 一次ソースは analytics.md / analytics-ga4.md / gcp-workspace.md / content-strategy-goals.md / seo.md。矛盾したらルール側が正。

## Clarity の CSV export は2種類ある（混同するとデータを潰す）

Clarity_*.csv は同じ接頭辞で2種類存在し、構造が全く違う:
- **AI Citations** (AI Visibility → AI Citations → Export): `FullyCitedQueries` セクション + `"Query","SoA","Citations"` 表。→ `bun run data:clarity`（import-clarity-citations.mjs）。
- **メインダッシュボード** (Dashboard → Export): `"Metric","<name>"` のキーバリュー連結（Sessions/bot, Scroll, Insights=Dead/Rage click, Top pages, Referrer, Smart events, Bot traffic, Performance）。→ `bun run data:clarity-dash`（import-clarity-dashboard.mjs, 2026-07-01追加）。

両importerは**誤ファイルを検出して拒否**する（citations側は0件パースで中止＝既存 ai-citations.json を空上書きしない、dashboard側は FullyCitedQueries 検出で中止）。2026-07-01にダッシュCSVをcitationsに食わせて6/19のAI引用データを空クロバーした事故から追加。`--file` 自動選択は「最新のClarity_*.csv」なので、必ず対応コマンドに渡すこと。

data-date≠import-date: ハブの日付dirはインポート日で切る。同日に別期間CSVを2回入れると上書きされるので、時系列比較時は import 前に latest を退避 or raw から再生成。

## Clarity AI Citations は Queries と Pages の2ビュー（+ メインダッシュボードで計3形態）

AI Citations export には2つのサブテーブルがあり、CSVに含まれる方が違う:
- **Queries ビュー**: `"Query","SoA","Citations"` → クエリ別引用 → `clarity/latest/ai-citations.json`
- **Pages ビュー**: `"Page URL","Citations"` → ページ別引用（AIがどのページに送客するか）→ `clarity/latest/ai-citation-pages.json`

import-clarity-citations.mjs は両テーブルを検出して該当ファイルに書き分ける（片方だけのCSVでも他方のファイルは潰さない）。両方欲しければ Clarity で各ビューを別々に export して2回流す。メインダッシュボード(トラフィック/挙動)を足すと計3形態で、全部ファイル名が `Clarity_*.csv` なので中身判定が必須（各importerが誤形式を検出して拒否）。

Pages ビューは LLMO の転換ターゲット特定に直結（AIが実際に引用・送客しているページに CTA/RTB を厚くする）。2026-07-01時点: complete-guide 295 / requirements-vs-requests 165 / template 147 / ears 146 / how-to-write-rfp 96(6/19の49から倍増) 等。
