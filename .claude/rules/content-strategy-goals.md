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
