# SEO Gap Analysis Report -- 2026-05-28

対象期間: 2026-04-28 ~ 2026-05-28 (30日間)
データソース: GA4 Search Console連携 / Rakko Keyword / Rakko Content Search

---

## 1. Executive Summary

- 30日間で合計 imp 約11,800、clicks 約240、サイト全体CTR 約2.0%。imp上位10記事で全impの55%を占めるが、そのうちGherkin/EARS系(エンジニア向け)が imp 2,580 / clicks 120で全clicksの50%を占める。CV実績ゼロのA-zoneコンテンツに依存した構造。
- requirements-vs-requests は imp 1位(1,536)だがCTR 0.39%。平均順位9.4でtitle/desc最適化だけでクリック数を3-5倍にできるポテンシャルがある。即日対応可能なQuick Win。
- 「要件定義書サンプル」(SV 1,900)、「AI開発」(SV 2,400)、「要件定義 進め方」(SV 720)の高SVクラスタで競合に大差をつけられている。既存記事の強化と新規記事の両面で対応が必要。
- B-zone(発注者向け)コンテンツはimp・clicksともにA-zone(エンジニア向け)の半分以下。コンテンツ投下の優先度をB-zoneに寄せる方針は正しいが、既存B-zone記事のtitle/desc改善で短期的な底上げも並行すべき。
- GSC query単位データはGA4 Data APIでは取得不可。Search Console APIのSA権限付与が未完了で、クエリレベルの深掘り分析ができていない。

---

## 2. Current Performance Overview

### 2.1 全体数値 (30日間)

| 指標 | 値 |
|------|-----|
| 総インプレッション | 約11,800 |
| 総クリック | 約240 |
| 全体CTR | 約2.0% |
| 公開記事数 | 103本 |
| imp 50以上のページ | 43ページ |

### 2.2 Impressions Top 10

| # | ページ | Imp | Clicks | CTR | Avg Pos | ゾーン |
|---|--------|-----|--------|-----|---------|--------|
| 1 | requirements-vs-requests | 1,536 | 6 | 0.39% | 9.4 | B-zone |
| 2 | gherkin-bdd-introduction | 1,354 | 78 | 5.76% | 6.3 | A-zone |
| 3 | ears-requirements-syntax-guide | 1,146 | 29 | 2.53% | 6.2 | A-zone |
| 4 | ai-development-cost-guide | 757 | 3 | 0.40% | 14.5 | B-zone |
| 5 | requirements-definition-complete-guide | 666 | 12 | 1.80% | 20.0 | B-zone |
| 6 | how-to-write-rfp | 589 | 2 | 0.34% | 27.1 | B-zone |
| 7 | web-system-cost-by-scale | 485 | 3 | 0.62% | 9.1 | B-zone |
| 8 | ai-era-development-flow | 447 | 3 | 0.67% | 17.0 | B-zone |
| 9 | cdp-product-comparison | 395 | 1 | 0.25% | 22.2 | B-zone |
| 10 | cdp-cost-and-period | 333 | 0 | 0% | 12.9 | B-zone |

### 2.3 Clicks Top 10

| # | ページ | Clicks | Imp | CTR | Avg Pos |
|---|--------|--------|-----|-----|---------|
| 1 | gherkin-bdd-introduction | 78 | 1,354 | 5.76% | 6.3 |
| 2 | ears-requirements-syntax-guide | 29 | 1,146 | 2.53% | 6.2 |
| 3 | / (ホーム) | 14 | 99 | 14.1% | 4.6 |
| 4 | ears-gherkin-workflow | 13 | 80 | 16.25% | 7.2 |
| 5 | requirements-definition-complete-guide | 12 | 666 | 1.80% | 20.0 |
| 6 | requirements-vs-requests | 6 | 1,536 | 0.39% | 9.4 |
| 7 | /company | 6 | 99 | 6.06% | 2.5 |
| 8 | ai-agent-build-guide | 5 | 163 | 3.07% | 13.3 |
| 9 | running-cost-signal | 4 | 53 | 7.55% | 7.4 |
| 10 | ai-driven-development | 4 | 159 | 2.52% | 36.3 |

### 2.4 A-zone vs B-zone トラフィック分割

A-zone (エンジニア向け技術ナレッジ): Gherkin, EARS, BDD系
B-zone (発注者・意思決定者向け): 要件定義, 費用, RFP, AI開発, CDP等

| ゾーン | Imp | Clicks | CTR | Click占有率 |
|--------|-----|--------|-----|-------------|
| A-zone (Gherkin/EARS/BDD 4記事) | 2,580 | 120 | 4.65% | 約50% |
| B-zone (残り全て) | 約9,200 | 約120 | 約1.3% | 約50% |

A-zone 4記事だけで全clicksの半分を稼いでいる。しかしCV実績はゼロ。B-zoneはimp規模は大きいがCTRが極端に低い。

---

## 3. Quick Wins (Title/Desc最適化)

### 判定基準
- 平均順位 4-10位(1ページ目表示圏内)
- imp 100以上
- CTR 3%未満(順位帯の期待CTRを大きく下回る)

titleとdescriptionのMicroCMS PATCHで即日反映可能。SERP表示は数日内に更新される。See Appendix B for full query-level breakdown per page.

### 3.1 requirements-vs-requests -- 最大のQuick Win

| 指標 | 値 |
|------|-----|
| Imp | 1,536 (サイト1位) |
| Clicks | 6 |
| CTR | 0.39% |
| Avg Pos | 9.4 |
| Rakko SV | 「要求とは」1,600 / 「要件定義 要求定義 違い」480 / 「用件と要件の違い」390 |

問題: imp 1位なのにCTR 0.39%は致命的に低い。順位9.4で1ページ目に入っているのにクリックされていない。title/descが検索意図と合っていないか、SERP上で競合に負けている。

推奨アクション:
- titleに「違い」「わかりやすく」等の結論示唆ワードを入れる。現titleが「整理」「解説」系の受動的表現なら結論型に書き換え
- descに「要求=WHY、要件=HOW」のような1行結論を入れてSERP上で答えが見える状態にする
- 表記揺れクエリ(「用件と要件」「要求 要件 違い」)をh2/h3で個別に拾う

期待効果: CTRを2%に改善するだけでクリック数 6 → 30 (5倍)。順位改善なしで達成可能。

### 3.2 web-system-cost-by-scale

| 指標 | 値 |
|------|-----|
| Imp | 485 |
| Clicks | 3 |
| CTR | 0.62% |
| Avg Pos | 9.1 |

問題: 順位9.1で1ページ目にいるのにCTR 0.62%。費用系クエリはSERP上で具体的な金額が見えるかどうかでCTRが決まる。

推奨アクション:
- descに具体的な金額レンジを入れる(例: 「小規模100-300万円、中規模500-1500万円、大規模2000万円以上の目安」)
- titleに「相場」「早見表」等のクリック誘発ワードを追加

### 3.3 data-quality-trap

| 指標 | 値 |
|------|-----|
| Imp | 51 |
| Clicks | 0 |
| CTR | 0% |
| Avg Pos | 8.1 |

問題: 順位8.1で表示されているのにクリックゼロ。impは少ないが順位が良いのでtitle改善のROIは高い。

### 3.4 budget-gap-ringi

| 指標 | 値 |
|------|-----|
| Imp | 35 |
| Clicks | 0 |
| CTR | 0% |
| Avg Pos | 5.4 |

問題: 順位5.4の好位置でクリックゼロ。B-zone記事で発注者に刺さるtitleに書き換える余地あり。

### 3.5 prevent-mismatch

| 指標 | 値 |
|------|-----|
| Imp | 26 |
| Clicks | 0 |
| CTR | 0% |
| Avg Pos | 5.2 |

問題: 順位5.2でクリックゼロ。impが小さいので優先度は低いが、title改善コストも低い。

### Quick Win 優先順位まとめ

| 優先度 | ページ | 推定クリック増 | 工数 |
|--------|--------|---------------|------|
| 1 | requirements-vs-requests | +24 clicks/月 (CTR 0.39% → 2%) | MicroCMS PATCH 10分 |
| 2 | web-system-cost-by-scale | +7 clicks/月 (CTR 0.62% → 2%) | MicroCMS PATCH 10分 |
| 3 | data-quality-trap | +1-2 clicks/月 | MicroCMS PATCH 10分 |
| 4 | budget-gap-ringi | +1 click/月 | MicroCMS PATCH 10分 |
| 5 | prevent-mismatch | +1 click/月 | MicroCMS PATCH 10分 |

合計推定: +30-35 clicks/月の増加。全て即日対応可能。

---

## 4. Position Improvement Opportunities (順位改善)

### 判定基準
- 平均順位 10-25位 (2-3ページ目、1ページ目に押し上げ可能圏)
- imp 100以上 or 高SVキーワードでランキング中
- 既存記事の強化で対応可能

### 4.1 ai-development-cost-guide

| 指標 | 値 |
|------|-----|
| Imp | 757 |
| Clicks | 3 |
| CTR | 0.40% |
| Avg Pos | 14.5 |

分析: imp 757は4位だが順位14.5(2ページ目)。「AI開発 費用」「AI開発 コスト」系のクエリで検索母数が大きい。順位を10位以内に上げればimp → clicks変換が大幅に改善する。

推奨:
- 記事内の費用データを最新化(2026年相場)
- 具体的な見積もり事例を追加(規模別: PoC 50-200万、MVP 200-500万、本格開発 500-2000万等)
- FAQ追加でFAQPage構造化データを出力
- title/descも同時に最適化

### 4.2 requirements-definition-complete-guide

| 指標 | 値 |
|------|-----|
| Imp | 666 |
| Clicks | 12 |
| CTR | 1.80% |
| Avg Pos | 20.0 |
| Rakko SV | 「要件定義例」480 (pos 19) |

分析: 要件定義系の主力記事だが順位20。Qiitaが「要件定義書サンプル」(SV 1,900)でpos 1を取っているクラスタの周辺KW。

推奨:
- 「要件定義書 サンプル」「要件定義書 テンプレート」で検索されるコンテンツセクションを強化
- ダウンロード可能なテンプレート(公開、ゲートなし -- CRO方針準拠)を記事内に追加
- scope-managerやstory-builderへの内部リンクを追加してツール誘導

### 4.3 how-to-write-rfp

| 指標 | 値 |
|------|-----|
| Imp | 589 |
| Clicks | 2 |
| CTR | 0.34% |
| Avg Pos | 27.1 |

分析: RFPの書き方は発注者の検討フェーズ直結のB-zoneコンテンツ。順位27(3ページ目)だがimpは589と多い。検索母数が大きいクラスタ。

推奨:
- 記事の網羅性を大幅に強化(RFP構成要素、記載例、失敗パターン)
- story-builderツールとの連携を強調(公開ツールなのでCTA導線に最適)
- 業界別RFPテンプレートの具体例を追加

### 4.4 ai-era-development-flow

| 指標 | 値 |
|------|-----|
| Imp | 447 |
| Clicks | 3 |
| CTR | 0.67% |
| Avg Pos | 17.0 |

分析: AI時代の開発フローはB-zone記事としてポテンシャルが高いが順位17。

推奨:
- 従来型ウォーターフォール vs AI活用開発の比較構造を明確化
- 具体的なフェーズ別の工数削減率データを追加
- ai-development-cost-guideとの内部リンク連携

### 4.5 cdp-product-comparison / cdp-cost-and-period

| ページ | Imp | Clicks | CTR | Avg Pos |
|--------|-----|--------|-----|---------|
| cdp-product-comparison | 395 | 1 | 0.25% | 22.2 |
| cdp-cost-and-period | 333 | 0 | 0% | 12.9 |

分析: CDP系2記事で合計imp 728。cdp-cost-and-periodは順位12.9で10位圏内に近い。

推奨:
- cdp-cost-and-periodの順位改善を優先(12.9 → 8-10位で1ページ目)
- 2026年最新の製品名・価格帯を更新
- bigquery-cdp-guide等の関連記事との内部リンク網を強化

### 4.6 quote-comparison-checklist

| 指標 | 値 |
|------|-----|
| Imp | 253 |
| Clicks | 2 |
| CTR | 0.79% |
| Avg Pos | 11.2 |
| Rakko SV | 「比較見積」210 (pos 11) / 「見積り比較」210 (pos 22) |

分析: 見積もり比較は発注者の直接的な検討行動。順位11.2はほぼ1ページ目の境界。

推奨:
- title/descに「チェックリスト」「無料」等のクリック誘発ワードを追加
- 記事内にscope-managerへの導線を追加
- 「見積もり比較のポイント」セクションを強化

---

## 5. Content Gaps (コンテンツ不足)

### 5.1 「要件定義書 サンプル/テンプレート」クラスタ -- SV 1,900

現状: beekle.jpはこのクラスタで圏外(pos 19-20以下)。Qiitaがpos 1でest traffic 1,050を取っている。

| 競合 | Position | Est Traffic | Ranking KWs |
|------|----------|-------------|-------------|
| qiita.com | 1 | 1,050 | 42 |
| eureka-box.com | 5 | 287 | - |
| notepm.jp | 6 | 245 | - |
| beekle.jp | 19-20 | 12 | - |

ギャップ: Qiitaの42 ranking keywordsが示すように、このクラスタはロングテールが非常に多い。beekle.jpの既存記事(requirements-definition-complete-guide)はテンプレート・サンプルの実物提供が弱い。

推奨:
- requirements-definition-complete-guideをこのクラスタの受け皿として大幅強化
- 実際のテンプレート(記入例付き)を記事内に公開(CRO方針: テンプレは公開)
- h2/h3で「要件定義書 サンプル」「要件定義書 テンプレート」「要件定義書 書き方」を個別に拾う
- story-builder / scope-managerへのツール誘導を組み込む

B-zone適合度: 高い。発注者が要件定義書を書こうとしている段階=発注検討フェーズ。

### 5.2 「AI開発」「AI受託開発」クラスタ -- SV 2,400 / 260

現状: /services/ai-developmentがpos 28.6(3ページ目以降)。imp 298だがクリック2。

| 競合 | Position (AI受託開発) | Est Traffic | Ranking KWs |
|------|----------------------|-------------|-------------|
| cone-c-slide.com | 1 | 234 | 18 |
| beekle.jp | 圏外 | 2 | - |

| 競合 | Position (AI開発) | Est Traffic | Ranking KWs |
|------|-------------------|-------------|-------------|
| cone-c-slide.com | 7 | 220 | 26 |
| beekle.jp | 28.6 | 2 | - |

ギャップ: cone-c-slide.comが両クエリでbeekle.jpを圧倒。「AI受託開発」は直接的な発注キーワードで、ここで上位を取れないのは機会損失が大きい。

推奨 (既存ページ改善):
- /services/ai-development のSEO強化(現在サービスページなのでコラム的なコンテンツ量が不足している可能性)
- 「AI受託開発」「AI開発 費用」「AI開発 会社」のクエリをh2で拾うコンテンツセクションを追加

推奨 (新規記事):
- 「AI受託開発の選び方 -- 発注者が確認すべき5つのポイント」(B-zone直球)
- ai-development-cost-guideとの内部リンク連携

B-zone適合度: 最高。「AI開発 委託」(SV 20、pos 24)は直接的な発注クエリ。

### 5.3 「要件定義 進め方」 -- SV 720

現状: requirements-definition-processがpos 12.5(2ページ目)、imp 62。Rakkoではpos 33。

ギャップ: SV 720に対してimp 62は表示機会を大幅に逃している。順位33(Rakko)ということは3ページ目以降で、GA4のimp 62は一部クエリバリエーションでのみ表示されている状態。

推奨:
- 既存記事の大幅リライト(現状のコンテンツ量・構成で競合に負けている)
- フェーズ別の具体的な進め方(ヒアリング → 要求整理 → 要件定義書 → レビュー)を詳細に
- ツール(scope-manager, story-builder)を使った実践例を組み込む

B-zone適合度: 高い。

### 5.4 「人月単価」クラスタ -- SV 320

現状: beekle.jpはこのクエリでランキングなし。

| 競合 | Position | Est Traffic |
|------|----------|-------------|
| techtus-eg.mynavi.jp | 4 | 120 |

ギャップ: 「人月単価」は発注者がベンダー見積もりを評価する際に検索するB-zoneクエリ。system-development-cost-breakdownやsystem-development-cost-market等の既存記事に人月単価の相場セクションを追加するか、新規記事として作成。

推奨:
- system-development-cost-breakdown内に「人月単価の相場(2026年版)」セクションを追加
- SE/PG/PM等の職種別単価、オフショア比較を含む
- または独立記事「システム開発の人月単価 相場ガイド」を新規作成

B-zone適合度: 高い。

### 5.5 新規記事候補 (B-zone優先)

| 優先度 | テーマ | 対象クエリ例 | 推定SV | 根拠 |
|--------|--------|-------------|--------|------|
| 1 | AI受託開発の選び方 | AI受託開発, AI開発 委託 | 260+ | 競合(cone-c-slide)がpos 1で独占中 |
| 2 | 人月単価の相場ガイド | 人月単価, エンジニア単価 | 320+ | 既存記事なし、発注者直球 |
| 3 | 要件定義書テンプレート実例集 | 要件定義書 サンプル | 1,900 | 既存記事の強化で対応可能だが新規も検討 |
| 4 | システム開発の外注先選定ガイド | システム開発 外注 | 140+ | system-development-outsourcing-guide公開済み、効果測定待ち |
| 5 | IT投資の稟議書の書き方 | IT投資 稟議, システム開発 稟議 | 未測定 | budget-gap-ringiの横展開、B-zone直球 |

---

## 6. A-zone Traffic Dependency Risk

### 現状のリスク構造

Gherkin/EARS/BDD系4記事のパフォーマンス:

| 記事 | Imp | Clicks | CTR | CV |
|------|-----|--------|-----|-----|
| gherkin-bdd-introduction | 1,354 | 78 | 5.76% | 0 |
| ears-requirements-syntax-guide | 1,146 | 29 | 2.53% | 0 |
| ears-gherkin-workflow | 80 | 13 | 16.25% | 0 |
| (BDD関連その他) | - | - | - | 0 |

合計: clicks 120 / 全体clicks 240 = 50%のクリックがCV 0のA-zoneコンテンツに集中。

### リスク評価

1. 収益貢献ゼロ: これらのコンテンツの読者(エンジニア)はBeekleのサービス(IT開発発注支援)のターゲットではない。CVに繋がる構造的な理由がない。

2. リソース配分の歪み: A-zone記事の維持・更新にリソースを割くと、B-zone記事の強化が遅れる。

3. ドメイン権威への間接貢献: A-zoneコンテンツがドメイン全体の被リンクやtopical authorityに貢献している可能性はある。ただし、これはB-zoneコンテンツでも達成可能。

### 推奨戦略

短期 (即日-1週間):
- A-zone記事は現状維持(削除・縮小しない)
- A-zone記事内のCTAをB-zone記事やツールへの導線に変更(エンジニア読者を発注者向けコンテンツに誘導する試み -- 効果は限定的だが低コスト)

中期 (1-3ヶ月):
- 新規記事はB-zone 100%にする(エンジニア向けナレッジは書かない -- コンテンツターゲティング転換方針に準拠)
- B-zone記事のtitle/desc最適化を全件実施してCTRを底上げ
- B-zone記事へのFAQ追加を継続し、AI検索からの引用率を上げる

長期 (3-6ヶ月):
- B-zone記事群のimp/clicksがA-zoneを超える状態を目指す
- A-zone依存率を clicks占有率50% → 30%以下に下げる
- 目標: B-zoneだけで月間clicks 200以上

---

## 7. Priority Action Plan

### Priority 1: Quick Wins -- Title/Desc最適化 (工数: 1時間以内)

対応方法: MicroCMS PATCH (scripts/generate-descriptions.mjs or 手動PATCH)
反映速度: 即日。SERP更新は数日内。

| # | ページ | 現状CTR | 推定改善後CTR | 推定Click増/月 |
|---|--------|---------|-------------|---------------|
| 1 | requirements-vs-requests | 0.39% | 2.0% | +24 |
| 2 | web-system-cost-by-scale | 0.62% | 2.0% | +7 |
| 3 | ai-development-cost-guide | 0.40% | 1.5% | +8 |
| 4 | cdp-cost-and-period | 0% | 1.5% | +5 |
| 5 | churn-prediction-guide | 0% | 1.5% | +2 |

推定合計: +46 clicks/月。title/desc書き換えのみで達成可能。

### Priority 2: 既存記事の強化 (工数: 各記事 2-4時間)

| # | ページ | 施策 | 期待効果 |
|---|--------|------|---------|
| 1 | requirements-definition-complete-guide | テンプレート実例追加 + h2最適化 | SV 1,900クラスタ参入 |
| 2 | ai-development-cost-guide | 費用データ更新 + 事例追加 + FAQ | pos 14.5 → 8-10位 |
| 3 | how-to-write-rfp | 網羅性強化 + story-builder連携 | pos 27 → 15位 |
| 4 | requirements-definition-process | 大幅リライト | SV 720 クラスタ改善 |
| 5 | /services/ai-development | コンテンツ量追加 | 「AI受託開発」対策 |

### Priority 3: 新規コンテンツ (工数: 各記事 4-6時間)

全てB-zone記事。エンジニア向け技術ナレッジは書かない。

| # | テーマ | 対象SV | 着手目安 |
|---|--------|--------|---------|
| 1 | AI受託開発の選び方 | 260+ | 今週 |
| 2 | 人月単価の相場ガイド | 320+ | 来週 |
| 3 | IT投資の稟議書テンプレート | 未測定 | 6月中旬 |

### 時系列ロードマップ

Week 1 (5/28-6/3):
- Priority 1のtitle/desc書き換え全5件を実施
- requirements-vs-requestsのh2/h3構造を表記揺れ対応に改修

Week 2 (6/4-6/10):
- requirements-definition-complete-guideのテンプレート追加
- ai-development-cost-guideの費用データ更新 + FAQ追加

Week 3 (6/11-6/17):
- 新規記事「AI受託開発の選び方」公開
- how-to-write-rfpの網羅性強化

Week 4 (6/18-6/24):
- 新規記事「人月単価の相場ガイド」公開
- /services/ai-developmentのコンテンツ量追加

---

## 8. GSC MCP Fix Note

現在のGA4 Data API連携ではSearch Consoleのクエリ単体ディメンション(`googleSearchConsoleQuery`)は取得できない。ランディングページ単位のデータのみ。

クエリレベルの分析(どのクエリで表示されてクリックされていないか)を行うには、Search Console API直接利用が必要。

現在の状況:
- SA (`ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com`) はGA4 propertyで「編集者」ロール付与済み
- しかしGSCのproperty (`beekle.jp`) への権限は未確認/未付与の可能性がある
- GSC MCP (`mcp__gsc__search_analytics`) は利用可能だが、SA権限がGSCに設定されていなければデータ取得できない

必要なアクション:
1. Google Search Console (https://search.google.com/search-console/) でbeekle.jpプロパティの「ユーザーと権限」を確認
2. SA (`ga4-mcp@ga4-mcp-beekle.iam.gserviceaccount.com`) を「フル」権限で追加
3. 追加後、GSC MCPでクエリレベルのデータ取得が可能になる

クエリデータが取得できれば、本レポートのSection 3 (Quick Wins) でより精密なtitle/desc最適化が可能になる(どのクエリで表示されてクリックされていないかが特定できる)。

---

## Appendix A: 分析上の制約

- GA4 SC連携データはランディングページ単位のみ。クエリ単体の分析はGSC API直接利用が必要(Section 8参照)
- Rakko KeywordのSV/順位データとGA4のimp/CTRデータは計測方法が異なるため、一部数値に乖離がある
- CTR改善の推定値は順位帯別の一般的な期待CTRに基づく概算であり、保証値ではない
- 新規記事の順位予測は含まない(インデックス・上昇に時間がかかるため)

---

## Appendix B: Query-Level Breakdown per Priority Page

Data source: GSC API via scripts/gsc-query.mjs (OAuth authentication, 2026-04-29 to 2026-05-27)

### B.1 requirements-vs-requests (imp 1,536)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| 要求とは | 597 | 0 | 0% | 8.1 |
| 要求定義 | 65 | 0 | 0% | 16.8 |
| 要求定義 要件定義 違い | 55 | 1 | 1.8% | 6.6 |
| 要求 要件 違い | 39 | 0 | 0% | 11.6 |
| 要件整理 要件定義 違い | 36 | 0 | 0% | 7.2 |
| 要求 とは | 19 | 0 | 0% | 9.3 |
| 要件定義 要求定義 違い | 17 | 0 | 0% | 8.7 |
| 条件と要件の違い | 16 | 0 | 0% | 7.9 |
| 要望 要求 要件 | 15 | 0 | 0% | 8.0 |
| 要望と要件の違い | 13 | 0 | 0% | 8.8 |

Insight: The #1 query "要求とは" (597 imp) is a definitional "what is" search. The current title focuses on "違い" (difference), not the definition. Title needs to directly answer "要求とは" to match search intent.

### B.2 web-system-cost-by-scale (imp 485)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| webサービス 開発 費用 | 57 | 0 | 0% | 7.9 |
| webシステム開発 費用 | 52 | 0 | 0% | 11.0 |
| web開発 費用 | 47 | 0 | 0% | 11.3 |
| webシステム 費用 | 37 | 0 | 0% | 7.6 |
| web システム 開発 費用 | 22 | 0 | 0% | 13.7 |
| 大規模システム 費用相場 | 13 | 0 | 0% | 12.7 |
| システム構築費用 相場 | 5 | 0 | 0% | 1.0 |
| システム開発費用 | 4 | 0 | 0% | 1.0 |

Insight: Multiple variants of "web system development cost" all getting 0 clicks despite good positions. Some queries (システム構築費用 相場) have pos 1.0 with 0 clicks, suggesting featured snippet or People Also Ask display.

### B.3 cdp-cost-and-period (imp 333)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| cdp 導入費用 | 49 | 0 | 0% | 4.2 |
| cdp 料金 | 48 | 0 | 0% | 7.6 |
| cdp 価格 | 46 | 0 | 0% | 41.8 |
| cdp 費用 | 39 | 0 | 0% | 6.4 |
| cdpツール 費用 | 30 | 0 | 0% | 7.2 |
| cdpツール 料金 | 29 | 0 | 0% | 22.4 |
| データ基盤 費用 | 8 | 0 | 0% | 6.3 |

Insight: All CDP cost queries at strong positions (pos 4-7) with zero clicks. The title already includes fee ranges ("月数千円から数千万円まで") but the description may not be showing the right information for these specific queries.

### B.4 ai-development-cost-guide (imp 757)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| ai 受託開発 料金 | 19 | 0 | 0% | 3.4 |
| ai開発 見積もり 費用 予算 | 17 | 0 | 0% | 10.0 |
| ai開発 見積もり 費用 内訳 | 17 | 0 | 0% | 5.5 |
| 生成ai poc 費用 | 17 | 0 | 0% | 1.8 |
| ai 受託開発 | 16 | 0 | 0% | 81.8 |
| ai開発 見積もり 相場 難易度 | 16 | 0 | 0% | 17.7 |
| ai開発 見積もり 費用 | 16 | 0 | 0% | 10.6 |
| 受託開発 相場 | 16 | 0 | 0% | 13.3 |

Insight: "生成ai poc 費用" at pos 1.8 with 0 clicks is concerning. Either a featured snippet or the SERP snippet is not compelling. "ai 受託開発 料金" at pos 3.4 also 0 clicks. The description needs concrete price ranges (PoC: 50-200万, MVP: 200-500万) visible in the snippet.

### B.5 mvp-development-guide (imp 292)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| poc mvp | 65 | 1 | 1.5% | 6.7 |
| mvp poc | 25 | 0 | 0% | 7.4 |
| mvp開発 | 23 | 0 | 0% | 53.0 |
| mvp プロトタイプ 違い | 15 | 0 | 0% | 11.5 |

Insight: "poc mvp" and "mvp poc" are the same intent (difference between PoC and MVP). Combined 90 imp at pos 6-7 with only 1 click. Title/desc should directly answer "PoC vs MVP" comparison.

### B.6 how-to-write-rfp (imp 589)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| rfp テンプレート | 66 | 0 | 0% | 63.7 |
| rfp 作り方 | 63 | 0 | 0% | 20.2 |
| rfp 書き方 | 37 | 0 | 0% | 62.5 |
| rfp 作成 進め方 | 19 | 0 | 0% | 41.1 |
| rfpの作り方 | 19 | 0 | 0% | 20.2 |
| rfp 回答 | 16 | 0 | 0% | 61.7 |

Insight: High-SV queries at very poor positions (pos 20-77). This is NOT a title/desc problem but a content authority/quality issue. The page needs major content strengthening to compete for these queries.

### B.7 churn-prediction-guide (imp 114)

| Query | Imp | Clicks | CTR | Pos |
|-------|-----|--------|-----|-----|
| チャーン分析 | 26 | 0 | 0% | 11.3 |
| チャーン 分析 | 8 | 0 | 0% | 12.1 |
| チャーン予測 | 6 | 0 | 0% | 33.3 |
| 解約予測 | 5 | 0 | 0% | 13.8 |

Insight: All queries at pos 11-13. Slightly outside page 1. Title/desc optimization alone won't help much; needs slight content improvement to push into top 10.
