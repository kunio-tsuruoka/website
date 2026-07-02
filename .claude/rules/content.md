# AIっぽい日本語チェックリスト（note.com yusuke_motoyama 由来、2026-07-01）

コラムの「AIっぽさ」除去は既存ルールに加え、以下も機械的に点検する（参照: https://note.com/yusuke_motoyama/n/n2a1218636f56）。

## ①視覚記号の残留（最優先・grepで一掃できる）
- em dash「——」で言い換え/要約をつなぐ → 句点で分割
- 全角「／」の概念並列 → 読点か言い換え（英語ペアは半角/。既存の全角／和語並列ルールと衝突する場合はこちらを優先し読点化）
- 二重引用符 “ ” での強調 → 「」か <strong> か除去
- 過剰な（）補足・責任回避の括弧 → 最小限に
検出: `grep -oE '——|／|“[^”]*”'`

## ②単調リズム: 同じ語尾反復／接続詞(さらに・また・そのため)多用 → 語尾を散らす・順接接続詞を削る
## ③説明書調: 長い前置き／構造の二重宣言（「以下の3つの観点から」＋見出し）／「ステップ1:」枠 → 前置き短縮・見出しで足りるなら宣言しない
## ④事なかれ主義: 「一概には言えませんが」等の保険・中立装い・弱い否定 → 立場を言い切る（Beekleの断定スタンスと同系）
## ⑤抽象語/万能語（本質・最適化・価値最大化）・根拠なき評価語 → 具体化＋根拠
## ⑥使い古された比喩を避ける: 地図・仕様書・設計書・羅針盤・土台・柱・栄養・筋トレ・DNA・車の両輪・潤滑油・エンジン・スパイス・レシピ
検出: `grep -oE '地図|土台|柱|羅針盤|DNA|両輪|潤滑油|エンジン|レシピ|スパイス|栄養|筋トレ'`

## 注意: 記号でも「意味のある図」は残す
関係チェーンを表す →/⇔ 等、記事の主題を成す記号は装飾ではないので保持してよい（例: ナレッジグラフ記事の「設備 ⇔ 部品 ⇔ 不具合」）。note.comが名指しするのは ——／"（）で矢印は対象外。

事例: knowledge-graph-rag-business を本チェックで是正（—— ×3 / 全角／×2 / " ×6 / 地図×1 を除去、事実・引用・マーカーは無傷でPATCH）。

# AIっぽさ点検は description も必ず含める（meta/og/JSON-LDで4倍露出）

コラムの「——」等のAIっぽさをスキャンするとき、content だけでなく **description フィールドも点検する**。description は本番で `<meta description>` / `og:description` / `twitter:description` / JSON-LD の4箇所に展開されるため、description に「——」が1つあると本番HTMLでは4件grepにヒットする。content を直しても description を見落とすと本番に残る（2026-07-01、dx-failure-patterns で発生。content 0 なのに本番 em dash 4 → 原因は description の「運用設計欠落——どれも」）。

- scan-ai-tells.mjs は `fields: 'id,content,description'` で両方を連結して点検する（修正済み）。
- 是正PATCHも content と description の両方に適用する。
検証は本番HTMLを `curl | grep -o '——' | wc -l` で0を確認（source PATCH後、Cloudflareキャッシュで数分ラグあり得る）。

# コラムのカテゴリ精査基準: 技術語だけで判定せず「想定読者＋実装主題」で分ける

/column（発注者向け）と /knowledge（実装者向け技術）の振り分けは、タイトルの技術語(RAG/GraphRAG/BigQuery/EARS等)だけで機械判定しない。中身で判定する。

## knowledge（実装者/エンジニア向け）に置く条件
- 技術語密度が高い（本文に Neo4j/Cypher/embedding/チャンク/RRF/実装 等が多数）
- 「〜とは/仕組み/実装/落とし穴」が主題
- 発注者向けの判断材料（発注時チェックリスト・費用の見方・体制）が無い
- 例（2026-07現在の knowledge）: ears-requirements-syntax-guide, gherkin-bdd-introduction, ears-gherkin-workflow, bigquery-mcp-integration, graphrag-knowledge-search（2026-07-01移動）, graphrag-data-extraction（2026-07-02ユーザー移動）, **ai-knowledge-chatbot-accuracy（2026-07-02移動。見出しがチャンク分割/リランキング/クエリ拡張/評価データセットと実装主題そのもの、技術語:発注者語=8:2）**

## 買い手カテゴリ(ai-development/cdp-development等)に残す条件
- 「発注検討者/情シス・経営層の視点」「発注前に押さえる」「発注時に確認すべきN点」等のフレーム
- 事例・費用感・判断軸が中心（技術語が出ても発注者教育が主目的）
- 例: knowledge-graph-rag-business(発注者に何の得), ai-rag-accuracy-graphrag(発注時5チェック有), llm-api-system-design(情シス視点), mcp-business-data-integration(発注前に押さえる), bigquery-explained/pricing(発注検討)

## 実務
- カテゴリ変更は `client.update({endpoint:'columns',contentId,content:{category:'knowledge'}})`（単数文字列、microcms.md準拠）。URL(/column/<slug>)は不変、内部リンクも維持。MicroCMS変更なので本番SSRに即反映（デプロイ不要）。
- 移動すると column.astro からは外れ /knowledge に出る（getColumns('knowledge')）。
- 2026-07-01: ユーザー指摘「graphragとか精査いる」でgraphrag-knowledge-searchを移動。ai-rag-accuracy-graphragは発注チェック有で保留（次点候補）。関連: [[project_azone_separation_idea]]。
- 判定に迷ったら「技術語(Neo4j/チャンク/RRF等) vs 発注者語(発注/ベンダー/見積/経営等)」の出現数比＋h2見出しの主題で機械的に判定する（2026-07-02、emotion-commonsense=0:3でstay / enterprise-kg-design-patterns=見出しが平易語・マネージドvsVPS等の判断FAQでstay / ai-knowledge-chatbot-accuracy=8:2でknowledge行き）。

## 新カテゴリ genai-adoption（生成AI導入, 2026-07-02新設, order 3=/column先頭）

- **genai-adoption = 導入を進める側の課題・進め方**（何から始める/ROI/セキュリティ/組織/経営説得/PoC本番化/データ準備/ガイドライン）。ピラーは genai-introduction-complete-guide（PILLAR_SLUGS登録済み）。専用一覧 `/column/genai-adoption`（ヘッダーのコラムドロップダウンから導線）。
- **ai-development に残す = 発注ノウハウ・技術の発注者向け解説**（ベンダー選定/費用相場/契約/AIエージェント/KG・GraphRAG解説/LLM選定/MCP/プロンプトエンジニアリング）。
- 記事末CTA: genai-adoption は consult-genai-adoption（intent=genai-adoption）＋ゼロスタート資料DL（column-cta-mapping.ts）。
- 新規の生成AI系ドラフトは「導入の進め方・社内課題」なら 推奨カテゴリ: `genai-adoption`、「発注・技術解説」なら `ai-development` をメタに書く。
