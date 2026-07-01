---
name: marketing-data
description: >-
  Beekle のマーケ計測データ (GSC 検索順位/CTR, GA4 セッション/CV/ジャーニー,
  Microsoft Clarity AI Citations, DataForSEO/rakko キーワード) を単一ハブに正規化して
  読み書きする。データドリブンで SEO/LLMO/CVR を分析・改善するとき、
  「最新データを取得」「順位やCTRを調べる」「AI引用を分析」「CVを見る」
  「どのページが伸びてるか」等を頼まれたら必ずこれを使う。まず latest を読み、
  古ければ refresh する。散らばった one-off スクリプトの代わりにこれを入口にする。
---

# Marketing Data Hub

Beekle の計測データは4系統に散らばっている (GSC / GA4 / Clarity / DataForSEO・rakko)。
このスキルはそれを **`docs/marketing/data/` の単一ハブ** に正規化スナップショットとして集約する。
分析は必ず「まずハブの `latest/` を読む → 古ければ refresh → 読み直す」の順で行う。

`docs/marketing/data/` は **gitignore 済 (ローカル専用)**。取得スクリプト (`scripts/data/*`) と
このスキルだけが commit される。データ本体は commit しない (CLAUDE.md のマーケ資料ローカル方針)。

## 1. まずハブを読む (分析の起点)

```
docs/marketing/data/README.md                       # 自動生成の目次 + 各ソースの最終更新日
docs/marketing/data/index.json                       # 機械可読のサマリ (LLM はこれを最初に読む)
docs/marketing/data/gsc/latest/queries.json          # 検索クエリ別 clicks/imp/ctr/position
docs/marketing/data/gsc/latest/pages.json            # ページ別
docs/marketing/data/gsc/latest/ctr-opportunities.json# 派生: title/desc書換候補 (pos5-20/imp>=30/低CTR, scoreソート済)
docs/marketing/data/ga4/latest/content-group.json    # column/lp/tool/contact... 別 sessions/keyEvents
docs/marketing/data/ga4/latest/channels.json         # 流入チャネル別
docs/marketing/data/ga4/latest/top-pages.json        # PV/セッション上位
docs/marketing/data/ga4/latest/key-events.json       # form_submit/generate_lead/cta_click/download_request 等
docs/marketing/data/ga4/latest/sc-landing.json       # GA4のSC連携メトリクス (landingPagePlusQueryString別)
docs/marketing/data/clarity/latest/ai-citations.json      # AI検索の引用クエリ別 + SoA (Queries view)
docs/marketing/data/clarity/latest/ai-citation-pages.json # AI検索の引用ページ別 (Pages view = AIがどのページに送客するか)
docs/marketing/data/clarity/latest/dashboard.json         # トラフィック/挙動 (bot%, Dead click, Referrer, Web Vitals)
docs/marketing/data/dataforseo/latest/*.json         # MCP capture (search-intent, ai-search-volume 等)
docs/marketing/data/rakko/latest/*.json              # MCP capture (co-occurrence, paa 等)
```

`index.json` の各ソース `lastDate` を見て、目的の期間に対して古ければ refresh する。

## 2. スクリプトで取れるソースを refresh する

GSC・GA4・Clarity(CSV) はスクリプト化済み。1コマンドで全部:

```bash
bun run data:refresh          # = node scripts/data/snapshot-all.mjs (GSC + GA4 + Clarity CSV)
```

個別:

```bash
bun run data:gsc              # 直近28日。期間指定: node scripts/data/snapshot-gsc.mjs --start 2026-04-01 --end 2026-06-30
bun run data:ga4              # 直近28日 (GA4は 28daysAgo/yesterday 形式)
bun run data:clarity          # AI Citations CSV を取込 → clarity/latest/ai-citations.json
bun run data:clarity-dash     # メインダッシュボード CSV を取込 → clarity/latest/dashboard.json
```

- **GSC**: OAuth トークン (`~/.gcp-keys/gsc-token.json`) 自動リフレッシュ。`sc-domain:beekle.jp`。
- **GA4**: SA キー (`~/.gcp-keys/ga4-mcp-beekle.json`) で `analytics.readonly` トークンを発行し Data API を直叩き (property 355503040)。各レポート独立 try/catch。
- **Clarity は export が2種類あり、別コマンド**。どちらも `~/Downloads` の最新 `Clarity_*.csv` を自動選択 (`--file` で明示可)。ファイル名が同じ接頭辞なので、**必ず対応コマンドに渡す** (誤ファイルは各importerが検出して拒否、既存を上書きしない)。生CSVは `raw/` に保存。
  - **AI Citations** (AI Visibility → AI Citations → Export): `bun run data:clarity`。API非対応、CSV export のみ。**Queries ビューと Pages ビューの2種**があり、CSVに含まれる方を自動判別して書き分ける → Queries=`ai-citations.json` / Pages=`ai-citation-pages.json`(AIがどのページに送客するか)。両方欲しければ各ビューを別々に export して2回流す。
  - **メインダッシュボード** (Dashboard → Export): トラフィック/挙動 (Sessions, bot%, Scroll, Dead/Rage click, Top pages, Referrer=AI流入含む, Smart events, Web Vitals)。`bun run data:clarity-dash`。
- **注意**: ハブの日付ディレクトリは *インポート日* で切る (データ期間ではない)。同じ日に別期間のCSVを2回入れると日付dirが上書きされる。時系列比較が要るデータは import 前に `latest/` を退避するか、raw CSV から再生成する。

## 3. MCP でしか取れないソース → 取得して同じハブに保存する

DataForSEO / rakko / Clarity Data Export API は MCP 経由 (= LLM が自分で叩く)。
結果を一時 JSON に落として `save-mcp.mjs` でハブに正規化保存する:

```bash
node scripts/data/save-mcp.mjs <source> <name> --file /tmp/result.json --note "説明"
# 例:
node scripts/data/save-mcp.mjs dataforseo search-intent --file /tmp/intent.json --note "発注クエリのintent (ja/Japan)"
node scripts/data/save-mcp.mjs rakko paa-genai --file /tmp/paa.json
```

### DataForSEO (MCP) レシピ
- `mcp__dataforseo__dataforseo_labs_search_intent` — クエリの intent (informational/commercial/transactional/navigational)。発注距離の仕分けに使う。`language_code:'ja'`, `location_name:'Japan'`。
- `mcp__dataforseo__dataforseo_labs_google_keyword_ideas` / `google_keyword_suggestions` — ボリューム/CPC/難易度。
- `mcp__dataforseo__ai_optimization_keyword_data_search_volume` — AI検索ボリューム (サブスク不要で稼働)。日本語ロングテールは null 多め (head term のみ)。
- LLM Mentions 系 (`ai_opt_llm_ment_*`) は別サブスク未有効化で 40204。日本語では費用対効果低 (Clarity AI Citations で代替)。

### rakko (MCP) レシピ
- `mcp__rakko-keyword__co-occurrence` — 共起語。業務CEP (作成/対応/文書/自動化) の抽出に。
- `mcp__rakko-keyword__question-search` — PAA (People Also Ask)。ペルソナの自然文クエリ = LLMO の見出し/FAQ 素材。
- `mcp__rakko-keyword__related-keywords` / `suggest-keywords` — 関連語・サジェスト。

### Clarity Data Export API (MCP/REST)
- トラフィック/挙動の export (Scroll/Engagement/Rage・Dead Click 等)。**AI Citations は含まない** (CSV export のみ)。
- env: `MICROSODT_CLARITY_API_KEY` (キー名の typo はそのまま)。`GET https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3&dimension1=Source&dimension2=URL`。numOfDays=1-3, 10req/日, 1000行上限。

## 4. 典型的な分析ループ (どのファイルを読むか)

- **CTR改善 (SEO)**: `gsc/latest/ctr-opportunities.json` の上位 → title/desc 見直し候補。ただし seo.md の鉄則「title が既にクエリ一致なら書き換えない (AI Overview/小N が主因)」を必ず適用。
- **CVR/ジャーニー**: `ga4/latest/content-group.json` (どのゾーンがセッションを集めCVに繋がるか) + `key-events.json` + `channels.json`。column が大量セッションでkeyEvents僅少 = A/C-zoneのCV問題 (content-strategy-goals)。
- **LLMO (AI引用)**: `clarity/latest/ai-citations.json`。SoA が高い買い手クエリ = AI検索で実質上位。新規ペルソナ記事が引用され始めたか時系列で追う。
- **需要検証 (新規記事の前)**: DataForSEO search_intent + ai-search-volume, rakko PAA/共起 を MCP で取り `save-mcp.mjs` でハブへ。

## 5. 注意・既知の制約

- **実問い合わせ件数は GA4 の form_submit を使わない** — スパム込み (analytics-ga4.md)。リード数は Slack 到着ベース。
- **GA4 の SC連携メトリクスは通常メトリクスと混在不可**、`landingPagePlusQueryString` 等の dimension 必須 (analytics.md)。`sc-landing.json` は単独レポートで取得済み。
- **当日のGA4は反映遅延** — 着地ページが (not set)、cta_click は beacon 落ちで記録漏れ。ジャーニーの裏取りは翌日以降。
- Clarity AI Citations の SoA は引用内シェアで打鍵回数を含まない (低頻度100%は実インパクト小)。ボリューム(citations)と併読。
- 知識の一次ソースは `.claude/rules/` の analytics.md / analytics-ga4.md / gcp-workspace.md / content-strategy-goals.md / seo.md。矛盾したらルール側が正。
