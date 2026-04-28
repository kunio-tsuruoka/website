# SEO実データ補正レポート: Search Console連携データ（2026年4月）

GA4 ↔ Search Console連携が有効。`organicGoogleSearch*` メトリクスでランディングページ単位の実データが取得できたため、コンテンツ戦略を実データで補正する。

> 制約: クエリ単体ディメンション(`googleSearchConsoleQuery`)はGA4 Data APIに存在しない。**クエリ実数値を見るには GA4管理画面 → 集客 → Search Console レポート、または Search Console 本体の管理画面が必要**。本ドキュメントはランディングページから検索意図を逆算する。

---

## 1. ランディングページ別 SEO 実績（4月）

CTR降順 / 表示回数の高いものから:

| ランディング | クリック | 表示回数 | CTR | 平均掲載順位 | 状態 |
|---|---:|---:|---:|---:|---|
| `/members` | 12 | 76 | **15.8%** | 3.0 | 高CTR・好調 |
| `/` | 11 | 82 | 13.4% | 3.1 | 上位安定 |
| `/services/no-code-development/` | 1 | 11 | 9.1% | 6.0 | 健全 |
| `/column` | 1 | 11 | 9.1% | 7.0 | 健全 |
| `/company` | 13 | **210** | 6.2% | 2.7 | **指名検索** |
| `/contact` | 1 | 19 | 5.3% | 2.8 | 直リンク |
| `/column/project-management-complete-guide` | 2 | 43 | 4.7% | **14.4** | **2P目に埋もれ** |
| `/column/progress-check-points` | 1 | 21 | 4.8% | 6.6 | 改善余地 |
| `/prooffirst` | 2 | 61 | 3.3% | 3.9 | 上位だが意図不一致? |
| `/services/ai-development/` | 1 | **169** | 0.6% | **37.3** | **大量表示・順位最悪** |
| `/column/project-management-steps` | 0 | **44** | 0% | 6.3 | **CTR 0% 異常** |
| `/services/cdp-development/` | 0 | 38 | 0% | 33.7 | 4P目、ほぼ見られない |
| `/column/7hhc1tib7dft` | 0 | 25 | 0% | 19.6 | 2-3P目 |
| `/case-studies` | 0 | 23 | 0% | 7.7 | 1P後半 |
| `/column/estimate-complete-guide` | 0 | 19 | 0% | 10.3 | 2P目入り口 |
| `/column/avoid-unused-system` | 0 | 10 | 0% | 6.7 | 1P後半 |
| `/column/common-mistakes` | 1 | 7 | 14.3% | 14.1 | 順位低いが刺さる |

---

## 2. 4月の実データから読み取れる事実

### 事実A: `/company` の指名検索が最大流入経路
- 表示210回・順位2.7・CTR 6.2% → 「Beekle」「Beekle 株式会社」系の**指名検索が立っている**。
- 初動として「指名検索を増やす」（広報・SNS・PR）施策がブランド構築に直結。

### 事実B: `/services/ai-development/` が最大の機会損失
- **表示169回 / 平均掲載順位37.3 / CTR 0.6%** → 何かしらのクエリで**大量にヒットしているが3〜4ページ目**。
- 順位を1ページ目に押し上げれば桁違いの流入増の可能性。**最優先テコ入れ対象**。
- 想定クエリ: 「AI開発」「AI 受託開発」「AI システム開発」など競合過密ワード。

### 事実C: PM完全ガイドは「2ページ目の壁」
- 表示43回・順位14.4・CTR 4.7% → クエリには取れているが2ページ目に埋もれている。
- **記事の質ではなく、SEO技術で押し上げられる**典型例（タイトル最適化、内部リンク強化、被リンク）。

### 事実D: `/column/project-management-steps` のCTR 0%は異常
- 表示44回・順位6.3（1ページ後半） / クリック0
- 順位は悪くないのにクリック0 → **タイトル/メタディスクリプションがクリックを取れていない**。
- 改善コストが最も低く効果が高いポイント。

### 事実E: コラムの大半が掲載順位7〜20位帯
- `progress-check-points`(6.6), `avoid-unused-system`(6.7), `estimate-complete-guide`(10.3) など
- **既に書いてある記事を1〜10位に押し上げる方が、新規記事を書くより効率的**。
- 戦略を「新規執筆中心」→「既存リライト＋新規」のハイブリッドに切替。

### 事実F: `/services/*` 配下の順位が軒並み20位以下
- ai-development(37), cdp-development(33), no-code-development(6), ai-b2b-website(4.5)
- AI/CDP系は順位回復困難（巨大競合）、no-code系は1ページ目に既に到達 → 後者を強化が現実的。

---

## 3. コンテンツ戦略 v2（実データ反映）

前回提案を以下の通り補正する。

### 優先度の組み替え

| 優先度 | 旧戦略 | 新戦略（実データ反映） |
|---|---|---|
| **P0(新)** | — | **既存コラム3本のSEOリライト**（`project-management-steps`, `project-management-complete-guide`, `estimate-complete-guide`） |
| **P1(新)** | URL正規化 | **`/services/ai-development/` のテコ入れ**（順位37→10位台へ） |
| P2 | UTM運用 | UTM運用（変更なし） |
| P3 | ツール集客 | ツール集客（変更なし） |
| P4 | `/company`直帰対策 | `/company`直帰対策（変更なし）+ 指名検索の維持・拡大 |

### P0: 既存コラム3本のSEOリライト（最優先・1〜2週で実施可）

#### a. `project-management-steps`（CTR 0% を脱出）
- 問題: 表示44 / 順位6.3 / クリック0 → タイトル・メタが弱い
- 対策:
  - タイトルに数字・年号を追加（例: 「【2026年版】プロジェクト管理の進め方 8ステップ｜PMのテンプレ付き」）
  - メタディスクリプション 120字で「誰の何を解決するか」を明示
  - サムネOGP更新

#### b. `project-management-complete-guide`（2P目→1P目）
- 問題: 表示43 / 順位14.4 → 2ページ目の壁
- 対策:
  - 内部リンクを倍増（既存PM系コラム全てから本記事に向けてリンク）
  - 記事ボリューム増（FAQ追加・H2見出し追加で網羅性を上げる）
  - 構造化データ `Article` + `FAQPage` 実装
  - 末尾CTAをコラム全体に統一

#### c. `estimate-complete-guide`（10位→5位以内）
- 問題: 表示19 / 順位10.3 → クエリは取れているが順位が中途半端
- 対策:
  - 「費用相場の表」「規模別レンジ」を本文に追加（情報量で勝負）
  - `system-development-cost-market` `system-development-budget-control` から相互リンク
  - クエリ「システム開発 見積もり 相場」「システム開発 費用 内訳」をH2に明示

### P1: `/services/ai-development/` テコ入れ

- 表示169回は本サイト2位の規模。順位37→15位に上げるだけで体感が大きく変わる。
- 対策:
  - ページ構造を再設計（FAQ・事例・料金感・他社比較）
  - 「AI開発 受託」「AIエージェント 開発」「Claude API 開発支援」などサブクエリを意識した H2/H3 構成
  - 内部リンク: 関連コラム（AI関連）から本ページへ集中させる
  - 競合分析: 上位10サイトの構成を逆算して必要要素を埋める

### P2-P5: 前回提案を維持

URL正規化、UTM運用、ツール送客、モバイルUX。

---

## 4. ディメンションは必要か？（GA4クエリ仕様の整理）

短い結論: **必須ではない。「何ごとの内訳が見たいか」次第**。

### 4-1. ディメンションなしでも動く
- ディメンション空配列で `run_report` を呼ぶと、指定期間の**合計値だけ**が返る（1行）。
- 例: 「4月のセッション総数」「4月の Organic クリック総数」だけ知りたい場合はディメンション不要。

### 4-2. ディメンションが必要なケース
内訳が欲しいときに使う「軸」がディメンション:

| やりたいこと | 必要なディメンション例 |
|---|---|
| 日別推移 | `date` |
| ページ別 | `pagePath` / `landingPage` / `landingPagePlusQueryString` |
| チャネル別 | `sessionDefaultChannelGroup` |
| 流入元 | `sessionSource`, `sessionMedium` |
| デバイス別 | `deviceCategory` |
| 検索ページ別パフォーマンス | `landingPage` + Search Console系メトリクス |

**メトリクス**（数値: クリック・セッション・PV）と **ディメンション**（軸: ページ・日付・チャネル）の組合せでレポートが定義される。

### 4-3. SC関連の制約（重要）
- **クエリ単体ディメンション (`googleSearchConsoleQuery`) は GA4 Data API には存在しない**。
- そのため「どのキーワードで何クリック」というクエリ別レポートは API では作れない。
- ランディングページ単位 (`landingPage`) なら `organicGoogleSearch*` メトリクスと組み合わせ可能（本レポート §1 がこれ）。
- ページ単位までしか粒度が出ないので、**実クエリを見たいなら GA4管理画面 or Search Console本体 or Search Console MCP** が必要。

### 4-4. ディメンション同士の組み合わせ制約
- セッション系（`sessionSource`）とイベント系（`pagePath`）は混在不可なケースがある（Data APIが400を返す）。
- SC系メトリクスはセッション系ディメンションと組合せ不可（ページ系のみ可）。
- 詰まったら一つずつ外して切り分け。

---

## 5. クエリ実数値を取りに行く方法（おすすめ）

GA4 Data API ではクエリ単体は取れない。**Search Console MCP server を導入すれば、検索クエリ × ページ × クリック × インプレッションが直接取れる**ようになる。

### Option A: 公式 API + 既存MCP
- Search Console API を叩くMCPサーバーを `claude mcp add` で登録
- 認証は GA4 と同じ Google OAuth
- 取れる情報: 実検索クエリ、クエリ別CTR、ページ×クエリのマトリクス

### Option B: 暫定（手動）
- Search Console管理画面 → 検索パフォーマンス → CSVエクスポート
- 月1で `claudedocs/sc-queries-YYYY-MM.csv` に置けば、戦略立案のたびに参照可能

導入希望ならMCPセットアップ手順を提示する。

---

## 6. 来月（2026-05）の実行サマリー

1. **既存リライト3本**: `project-management-steps` / `project-management-complete-guide` / `estimate-complete-guide`
2. **`/services/ai-development/` 大幅改修**
3. **URL正規化** (`_redirects` 整備)
4. **構造化データ実装**（全コラム共通）
5. **Search Console MCP 導入検討**（クエリ取得自動化）

新規執筆は P0/P1 完了後に再開する方が ROI が高い。

---

*生成: 2026-04-28 / GA4 + SC連携データ*
