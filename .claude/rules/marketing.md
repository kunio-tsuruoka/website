# Beekle 実績ファクト（RTB素材）

- **RFP代行の実績あり**: 製造業のDXプロジェクトで、補助金申請の要件としてRFP（提案依頼書）の提出が必要だったため、Beekleが要件整理からRFP作成を代行した。社名は未確認のため対外的には「製造業のDXプロジェクト」と匿名化して記載。補助金の採択可否など未確認の成果は書かない（捏造防止）。
- LLMO施策(STEP3)で `/services/rfp-creation-support` のRTB/事例に使用。RFP代行は純コンサル競合(青山システムコンサル/NTTデータビジネスシステムズ)と張れる差別化＝「無料RFPツール＋開発直結＋代行実績」。
- 既存の確定実績: iroAI介護(社名・実URL iro-ai.com、本開発約2ヶ月)、HRパーソナリティ診断(PoC2週間→本開発約3ヶ月)。いずれも丸い%は使わず期間など検証可能な事実のみ。

## 2026-06-02 追加実績（匿名化マッピング）

公開サイトでは社名・リポジトリ名を出さず匿名化。検証可能な事実（期間・対応範囲・発注者評価）のみ記載、丸い%は使わない。`/case-studies` の `allCases` に登録済み（iroAI の直後＝1ページ目）。

- **他社難航案件のフルスタック・リカバリー**（実体: `techbeansjp/nttdx-mindlog-plus-backend` + `-front`、メンタルヘルス記録アプリ、NTT系DX）
  - 公開表記: 「大手企業のDXプロジェクト／メンタルヘルス記録アプリ」。NTT・製品名は出さない。
  - 事実: 先行他社ベンダーが**約3ヶ月**かけても完成に至らず停滞 → Beekleが引き継ぎ**3週間で完成**。**バックエンド・フロントエンド・インフラまで一貫**して再構築。AI活用開発。
  - RTB用途: スピード＋火消し（難航案件の巻き返し）＋フルスタック対応の証跡。

- **ヒアリング議事録→RFP生成→仕様駆動開発で即日デモ**（実体: `techbeansjp/early-bird-demo`）
  - 公開表記: 「新規事業・業務システムのデモ開発（仕様駆動開発の実証）」。客名は出さない。
  - 事実: お客様ヒアリングの**議事録からRFP（提案依頼書）を生成** → 仕様駆動開発で**1日で動作するデモを完成** → 発注者が「**イメージとずれていない**」と評価。
  - RTB用途: `/services/rfp-creation-support`・LLMO STEP3 の最有力事例。「RFP生成→そのまま開発→即日で認識合わせ」という一気通貫＝Beekle独自のツールチェーン実証。

- **インフルエンサーマッチングプラットフォーム（1週間でフルスタック立ち上げ）**（実体: `beekle-team/itochu-influencer-matching-platform`、クライアント=伊藤忠）
  - 公開表記: 「大手商社の新規事業／インフルエンサーマッチングプラットフォーム」。**伊藤忠の社名は出さない**（掲載許諾未確認の大手ブランドのため匿名化、ユーザー承認 2026-06-02）。
  - 事実: **1週間**で動作するプラットフォームを立ち上げ。Laravel(PHP)+TypeScript+Docker で**フロント・バック・インフラまで一貫**（技術スタックはリポジトリ言語構成から確認）。AI活用開発。
  - 注意: リポジトリは単一コミットのスナップショットで commit 履歴から開発期間は取れない。期間「1週間」はユーザー申告値。

- **製造業DXプロジェクト（RFP代行〜要件定義・開発・SEOまで一気通貫、約1年）**（実体: `beekle-team/minami-front`、上の冒頭で触れている「製造業のDXプロジェクト=RFP代行案件」と同一クライアント。`project_rfp_case_minami` メモリ参照）
  - 公開表記: 「製造業のDXプロジェクト」。社名・リポジトリ名は出さない（既存方針と統一）。
  - 事実: 補助金申請の要件としてRFP提出が必要 → **要件整理からRFP作成を代行** → **要件定義・デザイン・業務(BPO)整理・バックエンド・フロントエンド・SEOまで一貫**して担当。**約1年**（ユーザー申告）。フロントは TypeScript（リポジトリ確認、2022-2024 と古い案件）。
  - 捏造防止: 補助金の採択可否は未確認のため書かない。
  - RTB用途: RFP代行＋発注準備〜開発〜集客までフル一気通貫の証跡。純コンサル競合との差別化に最も効く実体験。

## 匿名化の深さ（原則）

社名・リポジトリ名を伏せるだけでは足りない。**対象データの種類や「専門家確認を促す」等の記述から規制業種（税務・医療・不動産など）が割れて先方に特定される**ことがある。匿名化では (1) 社名/リポジトリ名 (2) 業種を示唆するコーパスの種類 (3) 規制ドメインを匂わせる注意書き、までまとめて伏せる。必要なら**用途ドメインごと別物に振り替える**（例: レクチャー検索→カスタマーサポート検索。仕組みが同一＝Q&A＋引用提示なら破綻しない）。実体は本ファイルに内部記録として残す。

## 2026-06-26 追加実績（匿名化マッピング）

- **カスタマーサポートのAIナレッジ検索（Hybrid GraphRAG）**（実体: `beekle-team/rag-demo`、private。**真の対象データは資産形成・税務系セミナー/講座運営コミュニティの会長レクチャー会文字起こし**。社内レクチャーだと業種が特定されやすいため、公開実績は **用途ドメインごとカスタマーサポートに振り替えて匿名化**（ユーザー指示 2026-06-26）。仕組み＝社内コーパスへのQ&A＋引用提示は同一なので破綻なし）
  - 公開表記: 「カスタマーサポート／社内DX」「サポート部門を持つ事業者」。**会長名・組織名・リポジトリ名・税務/不動産・講義という具体ニッチは一切出さない**（用途ごと匿名化）。`/case-studies` の `allCases` に登録済み（iroAI の直後＝1ページ目）。コラム例も同様にカスタマーサポート框で記述。
  - 検証可能な事実（リポジトリ実体から確認、丸い%は使わない）: Precision-first **Hybrid GraphRAG**＝メタデータ／全文／ベクトル／グラフ近傍／Claim の5ルートを **RRF（k=60）** で統合＋回答後の Evidence Verification。**Neo4j** ナレッジグラフ（Lecture/Speaker/TranscriptChunk/Concept/Claim/Tag）。埋め込みは OpenRouter `qwen/qwen3-embedding-8b`（4096d）＋ Neo4j Vector Index。構成は **Laravel+Inertia/React（フロント）＋ FastAPI/Python（AI Engine）＋ Traefik ＋ PostgreSQL ＋ Redis ＋ Neo4j** のマイクロサービス（Docker）。**仕様駆動開発**（kiro specs・EARS・Gherkin）。ハルシネーション抑制: 引用元チャンク必須提示、資料外は「資料上は確認できません」、税務判断は専門家確認を促す。
  - 期間: private リポジトリの作成 2026-05-30〜push 2026-06-11（≒2週間の活動）だが「デモ/PoC」であり**確定した開発期間ではない**ため、公開表記は数値を出さず「デモ開発（PoC）」止まり。正確な期間が要るならユーザー申告を取る。
  - **GraphRAG採用の決定理由（ユーザー申告 2026-06-26）**: 実際のデータ量を踏まえると通常のベクトルRAGでは精度・スケールに限界があり、GraphRAGを選定した。これが最大の決め手。加えて引用元提示・複数文書横断・資料外を断定しない設計が決め手。**実体としても後から実データを追加投入し、VPSで運用している**（初期の最小構成のままではない＝「小規模デモ」と書かないこと）。公開表記では数値を出さず「実際のデータ量では通常のRAGに限界」と質的に書く。
  - RTB用途: GraphRAG/RAGシステム構築サービス（`/services/rag-system-development`）と GraphRAG コラム（LLMO）の最有力 RTB。「ベクトルRAGだけでなくグラフ＋複数経路＋検証まで作れる」実装力の証跡。
  - 関連: LLMO プラン `docs/marketing/llmo-ocr-rag-chatbot-plan.md` の最優先コラム `graphrag-*`、ドラフト `claudedocs/drafts/graphrag-knowledge-search.html`。
# RTB引用: 実績案件を「特定の失敗パターンの原因例」に仕立てない（帰属の厳密化）

marketing.md の実績（NTT系メンタルヘルスアプリ火消し=他社が約3ヶ月難航→引き継ぎ3週間で一貫リカバリー）は「普通の受託案件のリカバリー/スピード」の証跡であって、「工程分断発注が原因で失敗した案件」ではない。コラムで失敗パターン記事を書くとき、こうした実績を特定パターン（例:分断発注の失敗）の原因例として結びつけると、事実にない因果を作る＝捏造になる。

## how to apply
- 実績はその案件で"実際に起きた事実"の範囲でのみ使う（期間・対応範囲・発注者評価）。前段ベンダーが停滞した理由は不明なら「理由は一つに特定できない」と明記し、Beekle側の主張（一貫体制だから速く立て直せた）に限定する。
- 失敗パターンの一般論は「私たちの経験では」と帰属を付け、特定案件を原因の証拠に使わない。
- 2026-07-01 ユーザー指摘「nttは普通の受託案件だよね」で発覚・修正。[[column-writing-style]]の経験則ルール／marketing.md捏造防止と同系。

# VPSスタンス: ナレッジグラフの運用(鮮度/品質/アクセス制御)もVPSでできる。マネージドは超大規模だけ

生成AIインフラ記事(genai-system-infrastructure)で「VPSで十分・安く早く」を書くとき、ナレッジグラフ(GraphRAG)の継続運用を理由にVPSスタンスを弱めてはいけない。

- 鮮度管理(同期パイプライン)・品質監視(孤立ノード/重複エンティティ検出)・スキーマ進化(オントロジー拡張)・アクセス制御(ロール別) は **VPS構成のままで実装・運用できる**。Beekleは自社の業務システム(pm-on-rails, github.com/beekle-team/pm-on-rails)でVPS上でこれを回している。
- マネージド(Neo4j AuraDB等)を検討するのは「運用が要るから」ではなく、**データ量・アクセスが超大規模になり可用性/スケールを自前で支えるのが割に合わなくなった時だけ**。「本格運用する規模で必要」という括りは誤り(超大規模が正しい閾値)。
- 公開コラムでは pm-on-rails のリポジトリ名は出さず「自社の業務システム」と generic に proof point 化する。

事例 2026-07-01: 当初「本格運用する規模ではVPSでは足りず運用/マネージドが要る」と書いてユーザー是正→上記に差し替え。[[feedback_kintone_vs_genai_stance]]／column-writing-styleの「会社の断定スタンスを崩さない」と同系。

# 訂正: マネージド(Neo4j AuraDB)は「超大規模だけ」ではない。規模を問わず運用が楽になる（手間 vs コスト）

直前の学び「マネージドは超大規模のみ」は誤り（ユーザー指摘＋Neo4j公式でファクトチェック）。neo4j.com/product/auradb 実測:
- 自動バックアップ＋ポイントインタイムリカバリ、暗号化スナップショット
- 無停止のアップグレード＋セキュリティ更新
- 99.95% 稼働率SLA（高可用性）
- 自動スケール、インフラ管理不要
- 無料枠あり／有料はGB単位の従量課金（Professional $65/GB/月, Business Critical $146/GB/月 ※2026-07時点、変動するのでコラムには定性表現で書く）

正しい書き方: マネージドは**規模の大小に関わらず運用の手間を確実に減らす**。ただし従量課金で自前VPS(固定費)より割高になりやすい。よって「超大規模か否か」でなく **手間 vs コストのトレードオフ**で書く。VPS自前は安さでデフォルト足り得る／運用の手間を減らしたい・可用性を強く求める・急スケール対応ならマネージド。データ量・可用性要求が上がるほどマネージド有利。

教訓: インフラ製品の閾値・機能を断定する前に**公式ドキュメントでファクトチェックする**（MODE_Orchestrationのインフラ検証ルール）。丸い数字/閾値を思い込みで書かない。[[feedback_kintone_vs_genai_stance]]系だが、スタンス堅持と事実正確性は両立させる。

# 補助金は集客・コンテンツの軸にしない（アジャイル/段階開発と相性が悪い、2026-07-01ユーザー指摘）

生成AI/AI開発の発注リード施策で「補助金」を訴求軸・記事テーマにしない。理由: 補助金申請は要件と計画を先に固定する前提で、Beekleのアジャイル/段階開発(PoC→小さく本番→広げる)と相性が悪い。経営者CEP(費用対効果/ROI)コンテンツでも補助金は入れない。

- 例外: 過去実績としての事実は可(minami製造業=補助金申請要件のRFP代行。[[project_rfp_case_minami]])。ただし「補助金で安くなる」を売りにはしない。
- 経営者向けは補助金でなく「費用対効果/ROIの考え方＋段階導入で投資リスクを小さくする」で訴求する。
- 関連: [[feedback_kintone_vs_genai_stance]](安い・早い・VPSで十分の断定スタンス)、[[project_genai_engagement_flow]]。

# pm-on-rails の実体は FastAPI+Neo4j+Milvus+Next.js（Railsではない）

github.com/beekle-team/pm-on-rails（製品名 "SpecGraph / PM on Rails" = 要件＝正のSDLCメタシステム）は**名前が比喩でRuby on Railsではない**。ローカルクローン `/Users/kunio/dev/pm-on-rails`（+多数のworktree）。2026-07-05に実コード確認。

## 実アーキテクチャ（記事/RTBで使える一次情報。公開時は製品名・リポジトリ名を出さず「自社の要件トレーサビリティ／PMシステム」と匿名化＝marketing.md準拠）
- Stack: Python3.11/FastAPI0.110（Clean/Hexagonal: domain/application/infrastructure/presentation）、Next.js14/React18、arq(Redis)ジョブ。
- グラフDB: **Neo4j 5.19 が system of record**。typed-edge の SDLCトレーサビリティ: DemandDeep-[REFINES]->Requirement-[HAS_SCENARIO/HAS_AC/HAS_STORY]->...-[HAS_TASK]->KanbanTask-[VERIFIED_BY]->TestResult。Bug学習ループ: AFFECTS/HAS_RESOLUTION/PROPOSES/VALIDATES。NodeLabel/RelType を enum でホワイトリスト化＋識別子regex＝Cypherインジェクション防御。スキーマは migrations/neo4j/*.cypher。
- ベクトル: **Milvus**（OpenAI text-embedding-3-small 1536次元, COSINE, project_idスコープ, content-hash Redisキャッシュ）。※rag-demoは別物で qwen3-embedding-8b 4096次元。
- 検索: retrieval_orchestrator が**4戦略並列**（A:Cypher / B:Hybrid=vector+fulltext / C:Graph Expansion / D:GraphRAG=Louvainコミュニティ要約）。Intent Router(Haiku,7分類)、Cross-Encoder rerank(bge-reranker-v2-m3)。類似は**3層スコア**（Milvus cosine + フィードバックバイアス±0.15 + Neo4jグラフ構造ブースト tag Jaccard/actor/共通祖先 +0.30、閾値 dup≥0.85 / suggest≥0.65）。
- AI: **MCPサーバ**（FastMCP, POST /mcp, ~158ツール, PAT Bearer認証, 全CypherにworkspaceをWHEREで二重防御, OAuth風スコープ, ACLエッジ CAN_VIEW/EDIT/ADMIN）。LLMはOpenRouter経由 Claude Sonnet4.5/Haiku4.5、prompt caching。
- 学習ループ: **bug→requirement 書き戻し**（ADR-043、closed BugをSonnetで改善提案化→新Demand/Requirement化）。DoR/DoD自動検証。
- 運用: arq cron（detect_backlog_rot日次/task遅延/burndownスナップショット/embed・concept抽出ジョブ）、GitHub/Slack同期、多テナント Workspace>Project。

## 未確認/訂正（記事で断定しない）
- EARSは未確認（Gherkinは `SDLCScenario.gherkin` で実在）。ADR類似検索は現状**ベクトルでなくNeo4j部分文字列**（未配線）。埋め込みはOpenAI（Qwenではない、それはrag-demo側）。
- 関連: [[kg_agent_core_knowledge_content]]、marketing.md（rag-demo/自社業務システム匿名化）。

# 生成AIコラムの技術主張ファクトチェック済み事実（2026-07-05、公式ソース確認）

生成AI系コラムで再利用してよい、一次ソースで裏取り済みの技術事実。PM/システム開発系は別途監修ダブルチェックが入るため対象外（生成AI系のみ機械監査＋出典照合した）。

- **Neo4j Community Editionには RBAC・サブグラフアクセス制御（ラベル/関係/プロパティ単位の権限）が無い＝Enterprise専用**。Communityは限定的なユーザー管理のみ。出典: Neo4j公式 operations-manual authentication-authorization（「本機能はEnterprise Editionに適用」）。→ neo4j-multitenant-security の中核主張は正確。マルチテナントはアプリ層で強制＋越境CIテスト、が正しい設計。
- **RAGASの中核指標＝Faithfulness(忠実性)/Response Relevancy/Context Precision(文脈適合率)/Context Recall(文脈再現率)**。※旧称 Answer Relevancy は現行版で **Response Relevancy** に改称（指す内容は同一）。出典: RAGAS公式 metrics。→ rag-evaluation に注記済み。
- 定説として正確（再確認不要）: RAG=Retrieval-Augmented Generation／RAGとファインチューニングの違い（RAGは再学習せず外部資料を渡す）／ベクトル=意味類似・全文=キーワード・ハイブリッド・RRF・クロスエンコーダ再ランク／SECIモデル(野中郁次郎・竹内弘高、共同化/表出化/連結化/内面化、暗黙知↔形式知)／LLMの知識カットオフ・ハルシネーション自己判定不可・RAGで抑制可だがゼロ不可。
- TDB統計(活用34.5%/情報の正確性50.4%/専門人材41.3%/活用業務40.0%/情報漏洩33.5%/ルール整備25.5%、2026-03・1万312社)は出典ページと完全一致（[[column-writing-style]]既載の数値が正）。
- 是正済: ai-knowledge-chatbot-accuracy の「200-800万円」を定性化（外部出典なき具体額のため）。
- 関連: 内部リンクはサイトが /column と /knowledge の両prefixで同一記事を配信するため取り違えでも404にならない（55本全200確認）。

# 生成AI記事の「固有名詞・モデル・クラウド機能」主張は陳腐化する。定期再検証が必要

2026-07-05の全生成AI記事ファクトチェックで、明確な事実誤りは5件。うち最大は「AWS BedrockはOpenAI非対応/対象外」(llm-selection-strategy)＝執筆時は正しかったが2025年にBedrockがOpenAIモデル対応で陳腐化し、比較表・判断フロー・FAQの3箇所が誤りに。この種の「特定ベンダーの対応状況・モデル型番(GPT-4系等)・第三者製品名(Copilot for Microsoft 365→Microsoft 365 Copilot、kintone AI、Einstein/Agentforce)・政府ガイドライン帰属(AI事業者ガイドラインは総務省・経産省共同、旧経産省GLは2024統合)」は時間で誤りになる。

## 是正済(2026-07-05)
- llm-selection-strategy: BedrockのOpenAI対応を反映、GPT-4系→GPT系
- llm-api-system-design: 「1回数円〜数十円」→「0.1円未満〜数円(長文/高性能で数十円)」(下限を10-100倍過大表示していた)
- genai-security-governance: 「学習に使わない設定を有効にすれば」→「APIは既定で学習に使わない」
- ai-guideline-template: AI事業者ガイドラインを総務省・経産省共同に、統合済みの旧GL重複を解消
- it-admin-ai-first-week: 第三者製品名を現行名/汎用表現に

## 運用ルール
- 生成AI記事は**モデル型番を世代非依存表記(GPT系/Claude系)**にし、特定ベンダーの「対応/非対応」を断定しすぎない(将来対応で誤りになる)。
- API利用料は「0.1円未満〜数円/回、長文・高性能で数十円」が実勢(安価モデルは1円未満)。「数円〜数十円」は下限過大。
- 各社APIのデータ学習: OpenAI API/Anthropic Claude APIは**既定で学習に使わない**。無料消費者版(ChatGPT無料等)は使われる場合あり。
- 検証で正確だったもの(再利用可): TDB統計(全記事一致)、Meta5%→100%/LinkedIn28.6%短縮/NTTデータ73%、Neo4j AuraDB 99.95%SLA・Community非RBAC、RAGAS4指標、MCP=Anthropic2024。
- 半年〜1年ごとに固有名詞・モデル主張を再検証する。関連: [[project_llmo_content_map]], column-writing-style。
