# 次の主目標: 転換率(CVR)改善フェーズ（2026-06-13 確定）

問い合わせが来始めた（田中さん/シフト 2026-06-12 等）ことを受け、四半期の主目標を「集客」から「転換」へ移す。ユーザーが4択（CVR改善/件数/計測ループ/LLMO）から **CVR改善** を選択。

## 根拠データ（直近28日）
- 集客は自走: GA4セッション 2月209→3月321→4月311→5月271→**6月13日で587**（2倍ペース）。集客はもうボトルネックではない。
- GSC: 339クリック/17,246インプレ/CTR 1.97%。クリックの**約53%が Gherkin/EARS 系のA-zone（エンジニア向け）記事**で、発注者CVに繋がらない（project_content_targeting_pivot 既述と一致）。
- 律速は「流入→発注者リードの転換」。実際の問い合わせは高流入記事ではなく header/直接から来ている（流入と転換の経路ズレ）。

## 打ち手の優先順位（データ順）
1. **高インプレ低CTR記事の title/desc 書き換え**（MicroCMS PATCH、即SERP反映）。最大機会は `requirements-vs-requests`（3407imp/CTR0.3%/pos8.2）。発注者意図のコスト系（`ai-development-cost-guide` 880imp/0.1%、`web-system-cost-by-scale` 730imp/0.5%）も優先。
2. **CTA動線の最適化**（記事ゾーン別）。ノウハウ系→ツール誘導、サービス比較系→資料DL（cro-strategy 既述）。A-zone記事から発注者意図への橋渡し導線。
3. **B-zone受け皿の強化**（コスト/見積もり/サービスページが流入を問い合わせに変える作りか）。
4. **アトリビューションを使った勝ち筋の特定**（2026-06-13 実装の流入計測を数週間後に読み、CVを生む記事/チャネルに投資集中）。

## 北極星指標
- 主: 質の高い実問い合わせ件数（Slack到着ベース、スパム除外。GA4 form_submit は使わない）。
- 先行指標: 高インプレ記事のCTR、cta_click、B-zone LP到達、資料DL(download_request)。

注: ADR 0001 のコラム100本目標と矛盾しない（新規はB-zone集中、A-zone量産はしない＝targeting_pivot 方針）。

# お問い合わせの3セグメント（2026-06-13 ユーザー指摘で修正）

CVR(=お問い合わせ)を考えるとき、観客を「発注者(エンド)」だけに絞るのは誤り。ユーザー指摘で3セグメントに修正:

- **A. 発注者(エンドクライアント)**: 事業会社の情シス/経営。コスト系・要件定義・サービス・事例を読む。CTA=資料DL/お問い合わせ。
- **B. 下請け/協業探し(同業)**: Web制作会社・SIer・コンサルのテック側(CTO/テックリード/PM)。**AI開発・RAG・技術深掘り記事を「実装力の見極め」のために読む**。CTA=「開発パートナー/開発リソースをお探しの開発会社・SIer様へ」→ お問い合わせ。**田中さん(シフト, 2026-06-12)がこの型**。marketing.md の実績の多く(NTT系火消し/伊藤忠/シフト等)も元請けの下請け・協業＝実証済み収益チャネル。
- **C. 純エンジニア(学習者)**: Gherkin/EARS構文を学ぶ個人。何を出しても基本CV0。

## 効くポイント
- 「技術ページ=CV0で無駄」は誤り。技術ページは**Bには効く**。ただし出すCTAが発注準備ツール(エンド向け)だとBには無意味。**Bには協業相談の導線**が要る。
- ツール誘導はお問い合わせを直接増やさない（ユーザー指摘）。最大目的はお問い合わせなので、買い手が来るページでは lead-capture(資料DL/お問い合わせ)を主CTAに。
- 純エンジニア面(Gherkin/EARS構文)のCTA最適化に投資しない。

## 打ち手の方向
1. 技術系カテゴリ(ai-development/cdp-development/knowledge技術系)に「開発パートナーをお探しの開発会社・SIer様」向け相談CTAを追加（B取りこぼし防止）。
2. エンド向けページ(コスト/サービス/事例)はA向けに資料DL/お問い合わせ動線を強化。
3. 2026-06-13実装の流入アトリビューション＋Clarityで、どのページ/セグメントが実際にお問い合わせを生むか測ってから投資配分。
4. 下請けクエリ(「AI開発 外注」「RAG 開発会社」「{技術} 受託」)のカバレッジも中期で。

関連: [[content-strategy-goals]] の上段(CVR改善フェーズ)、project_content_targeting_pivot（A-zone CV0 は「Cセグメントでは」の意味に限定して解釈すべき）。

# AI Citations baseline（Clarity, 2026-03-02〜06-19 / CSVエクスポート 2026-06-19）

Microsoft Clarity AI Visibility → AI Citations の実データ（約3.5ヶ月、133クエリ、ページ引用合計1335）。「どんな問いで AI が beekle.jp を引用するか」が判明。CSV: `~/Downloads/Clarity_beekle_website_Dashboard_06-19-2026...csv`。

## テーマ別引用ボリューム
- 要件定義/要求・要件の違い: 436（最大）/ Gherkin・EARS・記法: 248 → 合計67%が仕様系。**AIは Beekle を「要件定義・仕様の権威」として引用**（GSCオーガニックと一致）。
- 見積/費用: 83 / AI運用・モデル選定: 66 / CDP・データ基盤: 44 / RFP: 31 / BPO・DX: 13。

## CVRの核心: 買い手クエリで SoA(引用シェア)が高い＝AI検索で実質1位
- 「ソフトウェア開発 見積もり 内訳 項目」SoA68.75%(11) /「開発検証 費用内訳 項目 解説」76.9%(10) /「rfp 失敗しない ポイント」72.7%(8) /「nw 要件定義書 見積 項目」75%(6) /「企業 生成ai モデル開発 費用」71%(5) /「複数のai契約 メリット デメリット 2026」100%(8) /「treasure data salesforce cdp 比較」66.7%(8, B評価)。
- 仕様系(C)は量は出るが非CV。**買い手(A)クエリでは既に引用権威を取れている** → ここを転換に繋げるのが最優先。

## AIが買い手を送り込む引用上位ページ = 転換最優先
requirements-definition-complete-guide(270, 仕様) / requirements-definition-template(136) / requirements-vs-requests(123) / ears(113) / gherkin(90) / **cdp-product-comparison(68)** / requirements-definition-process(54) / **how-to-write-rfp(49)** / **system-development-cost-breakdown(42)** / ai-development-cost-guide(18)。
→ 買い手意図ページ（template / cdp比較 / how-to-write-rfp / cost-breakdown / ai-development-cost-guide）に お問い合わせ・資料DL 動線＋RTBを厚くするのが、データ裏付けのある最有効CVR施策。

## 拡張余地
「cdpツール 比較」SoA19%(9) 等、引用はされるが競合にSoAを取られている買い手クエリ → cdp-product-comparison 強化でSoA奪取。

関連: [[content-strategy-goals]]（CVR改善/3セグメント）、[[reference_dataforseo]]、analytics-ga4 の Clarity AI Visibility 項。クエリは Clarity AI Citations で取得可能（過去の「クエリ不可」断定は訂正済み）。

# 発注者セグメントAを購買委員会3ペルソナに分解（2026-07-01）

content-strategy-goalsの「セグメントA(発注者=情シス/経営)」は粗い。B2B発注は購買委員会で、3ペルソナの誰か1人の反対で止まる。コンテンツは3人を分けて書く（今は混在が穴）。プロンプト実データ(rakko PAA)で裏取り済み。

## ペルソナ1: 事業部の推進担当者（起案・チャンピオン、決裁権も技術判断権も無い）
- 怖れ: PoC頓挫で社内で恥/使えない物を掴む。用事: 動くものを見て上司と情シスにイケると言わせたい。
- AI実プロンプト: 「生成AIは何の業務に使える?」「導入は何から?PoC進め方」「社内文書を検索するAIの作り方」(PAA最頻=活用例/できる業務/進め方)。
- 刺さる: 業種別ユースケース/短期事例(伊藤忠1週間・デモ即日)/0円デモ。CTA=相談・デモ。
- ギャップ: PoC進め方は有るが「社内で上を説得する武器」が無い。

## ペルソナ2: 情シス/技術部門（ゲートキーパー・拒否権者。最大の空白）
- 怖れ: 情報漏洩/プロンプトインジェクション/野良AI/既存連携/運用破綻。用事: 任せて事故らないベンダーか見極め。
- AI実プロンプト: 「生成AIのセキュリティリスクと対策」「プロンプトインジェクション対策」「社内文書AIの情報漏洩」「RAGをオンプレ/VPSで閉じる」「LLM選定基準」(PAA=リスク/対策/注意/診断が大量)。
- 刺さる: データを外に出さない(VPS/自社運用)/Evidence Verification/アクセス制御/仕様駆動。Beekleのフルスタック+インフラ自前運用が唯一RTB(rag-demo)。CTA=技術相談・構成レビュー。
- ギャップ: **セキュリティ/ガバナンス/情報漏洩を正面から扱う記事がほぼ無い=最優先の新規**。genai-system-infrastructure(VPS)/llm-api-system-designが周辺で触る程度。

## ペルソナ3: 経営層/決裁者（予算を出す/止める）
- 怖れ: 金を溶かす/乗り遅れる。用事: いくらでいくら得か・他社は・リスク回収可能か。
- AI実プロンプト: 「生成AIの費用対効果」「導入効果/業務削減効果」「導入の補助金」「同業のDX事例」(PAA=費用対効果/業務削減効果/企業への効果が最頻、補助金需要実在)。
- 刺さる: ROI/削減時間の目安(検証可能な範囲のみ、丸い%禁止)/費用相場と内訳/補助金/同規模事例。CTA=資料DL(cro-strategyのゲート方針に合致)。
- ギャップ: 費用相場は強いが費用対効果/ROIの示し方・補助金が薄い。

## この分解から出る打ち手
- A: 「社内説得キット」(DLゲート資料: ROI試算+セキュリティFAQ+稟議ポイント)。3ペルソナを1導線で束ね濃いリード取得。担当者が上を説得する材料になり指名に傾く。
- B: 情シス向けセキュリティ/運用記事(情報漏洩/VPS自社運用で閉じる/プロンプトインジェクション対策)=最大空白。拒否権者を落とせないと全案件死ぬ。
- C: 経営者向けROI/補助金(数値は捏造せず事例の検証可能範囲)。
- D: 記事のペルソナ別にCTA出し分け(担当者→デモ/相談、情シス→技術相談・構成レビュー、経営者→資料DL)。
- LLMO直結: 情シスの「セキュリティリスク」・経営者の「費用対効果」PAAはAIに打たれる自然文そのもの。この見出し/FAQでAI引用を取る。

B(同業/協業)は別チャネル=/partner LP担当。C(純エンジニア)は対象外のまま。関連: [[content-strategy-goals]], [[project_content_targeting_pivot]], [[project_zero_start_branding]], marketing.md(捏造防止/匿名化)。

# 推進担当者ペルソナのCEP（Category Entry Points）解像度（2026-07-01, ラッコ＋DataForSEO実測）

[[発注者セグメントAを購買委員会3ペルソナに分解]]のペルソナ1(推進担当者)をCEP=「担当者がその用事を意識してカテゴリに入る引き金」で高解像度化。

## 決定的発見: DataForSEO search_intent が担当者CEPを2層に割る
- 情報層(発注遠い): 生成ai 議事録=informational0.93、生成ai 業務効率化=情報。母集団拡大用。
- 発注に近い層(transactional/navigational): 問い合わせ自動化=transactional0.96 / 資料作成=0.94 / 社内文書検索ai=navigational0.71 / 生成ai導入支援=0.99 / コールセンター=0.58。ai受託開発=commercial0.86。
→ 発注リードは「生成AIとは/業務効率化」でなく**特定業務を今すぐ楽にしたいCEP**から来る。search_intent APIはCEPを発注距離で仕分ける物差しとして有効。

## 担当者CEPマップ(4層)
- A.トリガー: 上司/経営の「生成AIで何かやれ」指示 / DX予算がついた / 同業が導入=乗り遅れ不安(「生成ai活用事例」head1600/月、事例ビジネス260・業種別=製造/不動産/マーケ) / 人手不足で業務パンク。
- B.業務CEP(発注に近い・co-occurrence実証): 作成(資料作成)/対応(問い合わせ対応)/文書(文書検索・整理)/自動化/画像(画像生成)/データ整理。「生成AI 業務効率化」共起上位がこれ。
- C.感情: 乗り遅れ不安 / PoC頓挫で恥をかきたくない(=動くデモで安心したい) / 成功事例で評価されたい(=上に見せるネタが欲しい)。
- D.機会: 期初の目標設定・予算編成期 / 新年度DX計画。

## 打ち手: 業務別ユースケース記事群(task-CEP×Beekle解×0円デモCTA)
CEP理論=ブランドを多CEPに紐付け mental availability を広げる。担当者の各業務CEPに1本受け皿を当て既存サービスへ橋渡し(新規サービスは不要、入口記事が欠けている):
- 問い合わせ/コールセンター自動化 → ai-chatbot-development
- 社内文書検索 → internal-document-ai-search / rag(情シス記事と対)
- 資料作成 → ai-development
- 業種別ユースケース(製造/不動産/マーケ) → 事例横断
各記事はBefore/After＋短期事例RTB＋0円デモ(ゼロスタート)で「担当者が上を説得できる」構成に。感情CEP(失敗が怖い)に効くのがゼロスタート0円デモ。
推奨着手順: 最高intentの「問い合わせ/コールセンター自動化」記事(transactional0.96、chatbotサービス直結)から。

関連: [[project_zero_start_branding]], [[project_genai_engagement_flow]], marketing.md(RTB匿名化)。

# 購買委員会3ペルソナのCEP記事を公開（2026-07-01）＋効果測定TODO

[[発注者セグメントAを購買委員会3ペルソナに分解]]と[[推進担当者ペルソナのCEP解像度]]に基づき、各ペルソナのCEPに直答する記事を新規公開（すべてMicroCMS columns / category=ai-development / FAQPage schema付き / RTB匿名化 / 数値捏造なし）:
- 情シスCEP(セキュリティ/情報漏洩): `/column/genai-security-governance`
- 担当者CEP(問い合わせ/コールセンター自動化, transactional0.96): `/column/genai-inquiry-automation`
- 経営者CEP(費用対効果/ROI, 補助金なし, TDB調査出典付き): `/column/genai-roi-investment`
併せて既存4記事(knowledge-graph-rag-business/genai-system-infrastructure/graphrag-knowledge-search/ai-contract-development-failures)に情シス・担当者観点のペルソナFAQを各2問追記(FAQPage Q数増)。

## 同時に本番反映した発注リード施策(2026-07-01)
- `ai-development-vendor-selection`: title/descに「AI受託開発会社」語を補強(順位27.8→改善狙い)。
- `web-system-cost-by-scale`: descの捏造金額を本文値(300〜800/1,000〜3,000/4,000万+)に是正。
- `/partner`協業LP(Bセグメント): **マージ・本番公開済み**(#67, 2026-07-01)。技術記事のPARTNER_CONSULT CTAは2026-07-02のPR #73で /contact 直行 → /partner 経由に変更（LP内CTAがintent=partnerを持つため計測維持）。

## 効果測定TODO(数週間後)
- Clarity AI Citations: 上記3ペルソナ記事が「セキュリティ/費用対効果/問い合わせ自動化」プロンプトで引用され始めるか(LLMO)。**7/2にQueriesビュー再取得済み（5/7〜7/2窓, 100クエリ, SoA20.31%）= genai-3記事の引用0の確定ベースライン**。次回測定は7月中旬。
- 7/2測定の副次所見: 「rfp形式」40引用/SoA50%が新出しRFP権威が拡大。cdpツール比較のSoAは19.15%で不変（7/1強化の効果はまだ）。細分化cdpクエリ（主要ベンダー機能価格 SoA25%、リアルタイム/セキュリティ SoA32%）は7/1追加セクションと語彙が一致するが、窓が5/7開始のため因果は未確定。買い手ページ引用は how-to-write-rfp 112 / cdp-product-comparison 75 と増勢。
- GSC: vendor-selection の「ai受託開発会社 比較」順位が27.8から上がるか、cost系ページのCTR。
- 実問い合わせ(Slack, スパム除外)の intent 別内訳 → **`bun run data:leads` の台帳（docs/marketing/data/leads/）を正とする**（2026-07-02新設、leads.mjs）。
関連: [[reference_dataforseo]], analytics-ga4(Clarity AI Visibility)。

# 測定ウィンドウ宣言（2026-07-02〜7月中旬）: 新規記事の公開を一時停止

2026-07-01に9本公開＋FAQ追記＋CTA差し替えを同日投入したため、変数が多すぎて効果の分離ができない。**7月中旬の測定（Clarity AI Citations Queriesビュー再取得、GSCでvendor-selection順位、リード台帳のintent別）まで新規記事は公開しない**。測定→学習→次バッチのリズムを作る。

- 例外: 既存記事の是正（事実誤り・リンク切れ・計測バグ）は随時OK。新規「公開」だけを止める。
- 例外2（ユーザー承認 2026-07-02）: LLMOピラー `genai-introduction-complete-guide`（生成AI導入の完全ガイド）は測定ウィンドウ中に公開した。complete-guide型（AI引用325件の勝ちパターン）を生成AIクラスタに複製したハブ記事で、genai系ペルソナ記事への内部リンク送客装置を兼ねる。ヘッダーは「コラム」ドロップダウン化で導線分離（PR #74）。効果測定では7/1公開分と変数が交ざる点に留意。
- ADR 0001 の「コラム100本まで戦略変更しない」制約は**達成済み**（2026-07-01時点で104本）。以後の戦略変更は本レビューサイクル（測定ウィンドウ）ベースで判断する。
- 根拠: 2026-07-02戦略レビュー。column 1,069セッション→キーイベント1件（28日）で、律速は記事数でなく転換。

# AI Citations をペルソナ分解（2026-06-19 CSV再分析, 2026-07-01実施）

[[AI Citations baseline]]を購買委員会3ペルソナで再集計。CSV `~/Downloads/Clarity_beekle_website_Dashboard_06-19-2026 14 41.csv`(03/02-06/19, 133クエリ/1335引用, 全体SoA20.55%)。

## ペルソナ別引用ボリューム(引用数)
- 仕様/要件定義(横断・発注者寄り) 456 / C純エンジニア(Gherkin/EARS) 263 / 経営者・費用 86 / CDP・RFP調達 57 / 情シス 41(但し真正セキュリティは実質0) / 担当者 21(問い合わせ自動化は実質0) / B協業 10。
- **核心**: 引用の70%が「仕様＋構文」に集中、うち263は非CVのC層。買い手3ペルソナ(担当者21+情シス41+経営者86)=148で全体の約14%。**AI検索の存在感は「仕様権威」に極端偏重、意思決定者(情シス・担当者)はほぼ空白**。データが[[発注者セグメントAを購買委員会3ペルソナに分解]]の読みを裏付け。空白の深さ順=情シス>担当者>経営者。

## 買い手クエリのSoA(勝ち負け)
- 勝ち(高SoA): 複数ai契約メリデメ2026=100%, 費用内訳項目=77%, 見積内訳=69%, rfp失敗しないポイント=73%, ai導入ROI=71%, treasure data cdp比較=67%。→費用内訳/RFP/ROIは既に権威、転換動線を厚くする段階。
- **負け(奪取余地): cdpツール比較 SoA19%(引用68)=最大の伸びしろ**。cdp-product-comparison強化でSoA奪取(既述だが未着手)。要件定義head語(要件定義書とは3.5%/書き方10.6%)もボリューム大・シェア低。

## 引用上位ページと転換優先度
買い手を送り込むのは template(136) / cdp-product-comparison(68,SoA19%) / how-to-write-rfp(49,SoA73%) / system-development-cost-breakdown(42,SoA69-77%)。EARS/Gherkin(256引用)はC非CV=転換投資しない。

## 新3記事のベースライン=引用0(2026-07-01時点)
genai-security-governance / genai-inquiry-automation / genai-roi-investment はこのCSVに0件出現=公開前ベースライン。効果判定は数週間後の次回エクスポートで、各記事が「セキュリティ/情報漏洩/PInjection」「問い合わせ自動化/コールセンター」「費用対効果/導入効果」クエリで引用開始するか＋既存ROIクエリのSoA維持で見る。**今日公開分の効果は原理的にこのデータに出ない(捏造禁止)**。
注意: SoAは引用内シェアでクエリ打鍵回数を含まない(低頻度100%は実インパクト小)。ボリュームと併読。
関連: [[reference_dataforseo]], analytics-ga4(Clarity AI Visibility)。

## cdp-product-comparison を強化(AI引用シェア奪取) / 経営者ROIは既充足で新規作成しない（2026-07-01）

- **cdp-product-comparison 強化済み**: Clarity AI Citations で「cdpツール比較」SoA19%（他社に引用シェアを取られていた）を奪うため、(1)「主要CDPベンダーの全体像：3世代とタイプ別マップ」section、(2) FAQ「リアルタイム処理・データセキュリティ」Q を追加（4025→5392字、FAQ 5→6問）。WebSearch(2026-07)で確認した事実のみ: 3世代=Packaged/Composable(DWHネイティブ)/Agentic、Treasure Data/Salesforce Data Cloud/Adobe Real-Time CDP/Tealium/Twilio Segment のポジショニング、CDP Institute 150社超。**ベンダーの価格・機能スペックは捏造せず定性ポジショニングに留めた**。Beekleの「自社開発」=Composable に接続。patch: scripts/patch-cdp-vendor-landscape.mjs（dry-run→apply→本番検証済み）。
- **経営者向けROI/費用対効果は既に手厚くカバー済み → 新規記事を作らない**（重複回避）。既存: genai-roi-investment(生成AI導入の費用対効果とROIの考え方, 7/1公開), ai-roi-measurement-difficulty(効果測定), it-investment-one-pager(決裁者1枚サマリー), ai-executive-understanding, ai-organization-constraints 等。今後この領域の依頼が来たら、新規でなく既存の相互リンク/CTA最適化を先に検討する。
関連: [[content-strategy-goals]], [[reference_dataforseo]], analytics-ga4(Clarity AI Visibility)。
