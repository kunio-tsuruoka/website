# Content Marketing Graph Ontology

Beekle サイトのコンテンツマーケティングを、Neo4j と AI エージェントで分析するための内部設計メモ。

目的は、GSC / GA4 / Clarity AI Citations / DataForSEO / お問い合わせ台帳 / MicroCMS 記事を、単なる集計表ではなく「誰に、何を伝え、どの導線で、何が起きたか」として辿れる状態にすること。

## 何を作るのか

作りたいものは、Looker Studio の代替ダッシュボードではない。
Beekle のコンテンツ、一次情報、外部発信、CTA、CRM上のお問い合わせCVをつなぎ、AIエージェントが「次にどのコンテンツ/導線を直すとお問い合わせが増えるか」を辿れるローカル分析ツールにする。

初期スコープは以下。

1. 自社サイトのLP、記事、CTA、内部リンク、構造化データを取り込む。
2. MicroCMS、Markdown、Astroページの本文を `ContentVersion` と `Section` としてバージョン管理する。
3. note、LinkedIn、登壇資料などの外部発信を、Beekleサイトへの送客導線とUTMつきで取り込む。
4. GSC、GA4、Clarity AI Citations、DataForSEOなどの観測値を、ページ/クエリ/AI引用/CTAに接続する。
5. beekle-crm をCVの正本として扱い、お問い合わせ数、発生日時、着地ページ、UTM、媒体、ステータスをインポートまたはMCP通信で参照する。
6. AIエージェントが、CEP、KBF、RTB、一次情報、CTA、CVの関係を辿り、記事ブリーフ、改善候補、計測漏れを出せるようにする。

やらないことも明確にする。

- 初期版では beekle-crm を置き換えない。
- 初期版では売上、受注率、受注単価まで無理に最適化しない。
- 初期版では完全なMMMを目指さない。MMMは、お問い合わせCVと施策履歴が一定期間たまってから追加する。
- GA4の全イベントや全セッションをNeo4jに入れない。お問い合わせCVへ説明力がある関係だけを残す。

## KPIの置き方

売上は分解すれば以下。

```text
売上 = リード数 × 受注率 × 受注単価
```

ただし、このローカル分析ツールの初期目的は `リード数`、より具体的には `お問い合わせ数` を増やすことに絞る。
受注率や受注単価は beekle-crm 側で見る商談/営業の論点であり、コンテンツマーケティング基盤の第一KPIにはしない。

North Star KPI:

```text
contact_conversions = beekle-crm に記録された実お問い合わせ数
```

補助KPI:

- `cta_clicks`: CTAクリック数。お問い合わせの手前指標。
- `form_starts`: フォーム開始数。取得できる場合だけ。
- `sessions`: 訪問数。母数として使う。
- `gsc_clicks` / `gsc_impressions`: SEOの接点量。
- `ai_citations` / `ai_mentions`: LLMO上の接点量。
- `external_referrals`: note / LinkedIn / 外部媒体からの送客数。

解釈用ディメンション:

- landing page
- CTA
- Offer
- UTM source / medium / campaign / content
- DistributionChannel
- CategoryEntryPoint
- Persona / BuyingRole / InternalInfluencer
- Cluster / EditorialPillar
- Initiative / ChangeSet

重要なのは、リード数、受注率、受注単価の3つを同時に追いすぎないこと。
この設計では、まず `お問い合わせ数が増えたか` を正面に置く。
受注率、受注単価、案件化率、商談品質はCRM側から補助的に参照し、コンテンツ施策の説明変数として扱う。

施策判断のルール:

- お問い合わせCVに接続しない指標は、すべて補助指標として扱う。
- LLMOで引用が増えても、お問い合わせCVに繋がらなければ優先度は上げない。
- noteやLinkedInで反応が増えても、Beekleへの送客とCRM上のお問い合わせCVに接続しなければ成功扱いしない。
- 記事改稿、CTA変更、外部発信、内部リンク追加は、最終的に `ContactConversion` を増やす仮説として `Initiative` に紐づける。

## 前提

- raw データの正は `docs/marketing/data/` のスナップショットに置く。
- Neo4j は raw fact の完全コピーではなく、コンテンツ、意味、導線、施策、観測値をつなぐ関係レイヤにする。
- AI 抽出結果は最初から真実扱いしない。`confidence` と `status` を持つ注釈として蓄積し、人間が必要に応じて承認する。
- お問い合わせの個人情報は Neo4j に入れない。メール、電話、個人名は入れず、匿名化した `ContactConversion` / `Lead` と流入、品質、ペルソナ、着地ページだけを持つ。
- お問い合わせCVの正本は beekle-crm に置く。Neo4j はCRMのコピーではなく、CVとコンテンツ/導線/施策の関係を説明するために必要な匿名化情報だけを持つ。
- beekle-crm との接続は、最初はCSV/JSONインポートでよい。MCP通信できるなら、AIエージェントがCRM状況を必要時に参照し、Neo4jには要約と参照IDだけを保持する。
- 数値の時系列集計は JSON / 将来の DuckDB 側で行い、Neo4j では「どのページ、クエリ、CTA、施策に関係する数値か」を辿れる形を優先する。

## 外部リサーチ反映

この設計は、Beekleの既存データ構造だけでなく、以下の外部ノウハウも前提にする。

| Source | 設計への反映 |
|---|---|
| [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | SEOは検索エンジンがコンテンツを理解し、ユーザーが訪問判断できるようにすること。`TitleMeta`, `InternalLink`, `StructuredData`, `SearchQuery -> RANKS_PAGE -> Page` を追う。 |
| [Google AI optimization guide 日本語版](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?hl=ja) | Googleの生成AI検索も基礎SEOが土台。AEO/GEOの小手先施策ではなく、技術構造、独自で有用な内容、Search Console計測を重視する。`LLMSFile` は任意対象で、Google向け必須施策として扱わない。 |
| [Google structured data guide](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) | Googleは構造化データをページ内容理解に使う。`Page -> HAS_STRUCTURED_DATA -> StructuredData` と本文/FAQの一致を追う。 |
| [Google link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) | アンカーテキストはリンク先理解の手がかり。`INTERNAL_LINKS_TO {anchor, position}` を関係プロパティとして持つ。 |
| [Google helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | E-E-A-Tや人間向け価値を評価軸にする。`Claim`, `ProofPoint`, `Author/Entity`, `ContentRisk` を使い、根拠不足や古い情報を検出する。 |
| [OpenAI Crawlers](https://developers.openai.com/api/docs/bots) | OAI-SearchBotはChatGPT search用、GPTBotは学習用で別制御できる。`Crawler`, `RobotsPolicy`, `CrawlerAccessCheck` を追加し、ChatGPT search向けの発見可能性を分けて見る。 |
| [OpenAI Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) | ChatGPT検索での発見にはOAI-SearchBotをブロックしないこと、referral URLに `utm_source=chatgpt.com` が付くことを確認する。`AIReferralTracking` と `Referrer` に反映する。 |
| [HubSpot topic clusters](https://knowledge.hubspot.com/content-strategy/pillar-pages-topics-and-subtopics) | ピラー、支援記事、内部リンクでトピックを構造化する考え方を `Cluster`, `HAS_PILLAR`, `HAS_SUPPORTING_PAGE` に反映する。 |
| [Content Marketing Institute: What is Content Marketing](https://contentmarketinginstitute.com/what-is-content-marketing) | コンテンツマーケティングは、明確なAudienceに価値ある一貫したコンテンツを届け、最終的に profitable customer action につなげる戦略。`ContentMission`, `AudienceNeed`, `DistributionChannel`, `ContentPurpose` を追加する。 |
| [Content Marketing Institute: Strategic Pillars](https://contentmarketinginstitute.com/strategy-planning/content-strategy-pillars) | コンテンツ戦略は `Why`, `Who`, `How` が必要。事業目的、顧客ニーズ、ブランド固有の視点を `ContentMission`, `EditorialPillar`, `PointOfView` に反映する。 |
| [Content Marketing Institute: B2B Content and Marketing Trends 2026](https://contentmarketinginstitute.com/b2b-research/b2b-content-marketing-trends-research) | Thought leadership は多くの企業が作るが、専門家参加と事業/ブランド指標で管理できている企業は少ない。`SubjectMatterExpert`, `ThoughtLeadership`, `BrandAuthoritySignal` を追加する。 |
| [Edelman / LinkedIn 2025 B2B Thought Leadership Impact Report](https://www.edelman.com/expertise/Business-Marketing/2025-b2b-thought-leadership-report) | B2Bの購買は見えない意思決定者に左右され、Thought leadership は信頼、社内合意、未知ブランドの検討入りを助ける。`BuyingRole {visibility:'hidden'}`, `InternalInfluencer`, `TrustSignal` を追加する。 |
| [LinkedIn: Hidden buyers and thought leadership](https://www.linkedin.com/business/marketing/blog/research-and-insights/b2b-thought-leadership-influence-hidden-buyers) | Hidden buyer は営業接点外でもコンテンツを評価し、C-suite endorsement や購買委員会内の合意に影響する。`ThoughtLeadership -> INFLUENCES -> BuyingRole` を追う。 |
| [Bain: The B2B Elements of Value](https://www.bain.com/insights/the-b2b-elements-of-value-hbr/) | B2Bでも価格/仕様だけでなく、評判リスク、不安低減、使いやすさ、個人的価値が意思決定に効く。`ValueElement`, `EmotionalBenefit`, `ReputationRisk` を追加する。 |
| [GEO paper](https://arxiv.org/abs/2311.09735) | 生成AI回答内の可視性は通常SEOと別指標で見る必要がある。`AIQuery`, `CITES`, `soaPct`, `citations`, `ProofPoint` を明示する。 |
| [Microsoft Clarity AI Citations](https://learn.microsoft.com/en-us/clarity/ai-visibility/ai-citations) | AI回答でどのページが引用され、競合とどう比較されるかを測る。`AIQuery -> CITES -> Page`, `CompetitorDomain`, `Cluster` に反映する。 |
| [Microsoft Clarity Bot Activity](https://learn.microsoft.com/en-us/clarity/ai-visibility/bot-activity-overview) | Bot Activityはクロール観測であり、引用・送客・成果を意味しない。`Crawler -> CRAWLED -> Page` は任意で、`AIQuery -> CITES` や `ContactConversion` とは分ける。 |
| [Neo4j GraphRAG docs](https://neo4j.com/docs/neo4j-graphrag-python/current/user_guide_rag.html) | ベクトル検索だけでなく、Cypherで関係を辿ることで文脈を増やせる。AIエージェント用に `Page`, `Section`, `Cluster`, `Problem`, `CTA`, `Offer` の多段関係を持つ。 |
| [Neo4j graph data modeling principles](https://neo4j.com/graphacademy/training-gdm-40/03-graph-data-modeling-core-principles/) | ノードを細かくしすぎる過剰fanoutは避ける。AI抽出の細部はまず `Annotation` に寄せ、分析で多段 traversal が必要なものだけノード化する。 |
| [ListeningMind CEP x GEO playbook](https://jp.listeningmind.com/knowledge/cep-geo-playbook/) | AI検索ではブランドをキーワードではなく、消費者/買い手の状況であるCEP単位で設計する。`CategoryEntryPoint`, `BuyingSituation`, `Prompt`, `ExternalSource` を追加する。 |
| [ListeningMind note: CEPとGEO](https://note.com/listeningmindjp/n/n9d3e657e6ecb) | AI検索の質問はキーワードより状況・文脈・期待値が濃くなる。`Persona -> HAS_CEP -> Prompt` ではなく、`CEP` を中心にPromptとMessageを設計する。 |
| [LANY LLMO prompt design sheet](https://www.lany.co.jp/useful-materials/llmo-pronpt) | ターゲット属性、サービスカテゴリ、競合、評価軸からMOFU/BOFU別の対策Promptを設計する。`PromptAxis`, `EvaluationAxis`, `PromptSet`, `JourneyStage` を追加する。 |
| [LANY LLMO prompt design article](https://www.lany.co.jp/blog/llmo-prompt-design-textbook) | LANY公式シート上で、SEOとの違い、CEP概念、レイヤー設計の背景記事として案内されている。`PromptAxis` は target / serviceCategory / brand / competitor / evaluationAxis / stage を持てるようにする。 |
| [LANY LLMO白書 2026-03-05](</Users/kunio/Downloads/LLMO白書_20260305 (1).pdf>) | AI第一想起を「上位で、筋の通った理由と、競合比較に耐える根拠で推奨される状態」として扱う。`CategoryEntryPoint`, `KeyBuyingFactor`, `ReferenceSurface`, `ReasonToBelieve` を一連の設計単位にする。 |
| [Category Entry Points in B2B](https://business.linkedin.com/advertise/resources/b2b-institute/cep-in-b2b) | B2BでもCEPは buying situation を特定する軸。W'sで状況を洗い出し、credibility/commonness/competition で優先する。`CategoryEntryPoint.priority` に反映する。 |

### 追加リサーチで分かったこと

1. Google Search の生成AI対策は、現時点では「別物のハック」ではなく基礎SEOの延長として扱う。
   Google公式は、生成AI検索向けでも技術構造、独自で有用なコンテンツ、Search Console計測を重視している。`llms.txt` やAI専用markupは、Google Search向けの必須施策として扱わない。

2. GEO/LLMOの可視性は、単一順位ではなく多段パイプラインとして扱う。
   2026年のGEOサーベイは、AI可視性を search activation, crawling/indexing, retrieval, reranking, citation, prominence, factual absorption, fidelity, user behavior のような確率的プロセスとして整理している。したがって `AIQuery -> CITES -> Page` だけでなく、`PromptRun`, `AIAnswer`, `AnswerCitation`, `Mention`, `SourceDomain`, `ContactConversion` を分ける。

3. 1回のAI回答結果を真実扱いしない。
   GEOサーベイでは、run-to-run variability、source overlap の低さ、fidelity gap が指摘されている。AI visibility service の数値は点推定ではなく、prompt集合、繰り返し回数、platform、測定日を持つ `MeasurementProtocol` と `PromptRun` で管理する。

4. 自社ページだけでなく earned media / third-party sources を追う。
   AI検索では、ブランド保有コンテンツより第三者の権威あるソースが強く出るという調査がある。Beekleサイト内のページだけでなく、外部記事、比較サイト、SNS、求人/会社情報、GitHub、登壇/実績などを `ExternalSource` として持てる設計にする。

5. LLMOでは「引用」と「言及」を分ける。
   AI回答内でリンク付き引用されること、テキストで名前が出ること、競合と並ぶこと、推奨されることは別。`CITES`, `MENTIONS_BRAND`, `RECOMMENDS`, `CO_OCCURS_WITH` を分ける。

6. コンテンツマーケでは persona だけでなく purpose / buyer journey / content format を持つ。
   Content Marketing Institute は目的、Audience persona、Buyer journey を戦略の核として扱っている。`Persona`, `BuyingRole`, `JourneyStage`, `ContentPurpose`, `ContentFormat`, `DistributionChannel` を分ける。

7. Persona だけでは足りない。CEPを一級ノードにする。
   LLMOで見るべき単位は「A1事業部担当者」のような人だけではなく、「上司にAI導入の概算を聞かれた」「既存FAQ botから切り替えるか悩んでいる」「RAG開発会社を比較したい」のような買い手状況。これを `CategoryEntryPoint` として持つ。

8. Prompt設計は、CEP、フェーズ、評価軸、競合を組み合わせる。
   LANYの資料では、ターゲット属性、サービスカテゴリ、競合、評価軸からMOFU/BOFU別のPromptを作る考え方が示されている。`PromptAxis`, `EvaluationAxis`, `PromptSet`, `PromptRun` を追加する。

9. LLMOは `CEP -> KBF -> ReferenceSurface -> RTB` で設計する。
   LANY白書の4ステップは、問いの定義、比較ポイントの特定、検索結果面/参照面の特定、証拠の配置。Neo4jでは `CategoryEntryPoint`, `KeyBuyingFactor`, `ReferenceSurface`, `ReasonToBelieve` をつなぎ、どの問いで何を根拠に推奨されたいかを明示する。

10. 一次情報はRTBの供給源として独立管理する。
    AIに推奨されるには、曖昧な主張ではなく、条件、制約、数値、事例、第三者評価、顧客の生声が必要。インタビュー文字起こし、営業メモ、プロジェクト振り返り、自社の思想、強み、方法論を `SourceMaterial` として貯め、`Quote`, `CaseStudy`, `CompanyStrength`, `ReasonToBelieve` に変換する。

11. Beekleの商材は高関与・理性的なBtoB寄りなので、LLMO優先度は高い。
    AI受託開発、RAG、要件定義、業務改善は、失敗回避、比較検討、社内稟議、セキュリティ、費用妥当性が重要になる。したがって、記事制作はSEO流入だけでなく「AIが比較・推奨で使えるファクト」を増やす前提で設計する。

12. 自社ブランディングは「抽象的な世界観」だけではなく、CEPごとの記憶・信頼・価値連想として管理する。
    B2B Instituteは、ブランドを重要な buying situation に結びつけることを重視している。Neo4jでは `BrandAssociation` を `CategoryEntryPoint`, `ValueElement`, `KeyBuyingFactor`, `ReasonToBelieve` と接続し、Beekleがどの状況で何者として想起/推奨されたいかを追う。

13. コンテンツマーケティングは `Why / Who / How` で設計する。
    CMIは、事業目的、Audience、ブランド固有の視点/物語が戦略の核だとしている。記事単位のSEOキーワードではなく、`ContentMission`, `EditorialPillar`, `PointOfView`, `ContentBrief` を接続して、記事群が同じブランド資産を育てているかを見る。

14. Thought leadership は、社内専門家の知見を表に出す仕組みとして扱う。
    CMIの2026調査では、多くのB2B企業がthought leadershipを作る一方、専門家参加やブランド権威指標まで管理できている企業は限られる。`SubjectMatterExpert -> CONTRIBUTES_TO -> SourceMaterial/ThoughtLeadership` を追い、Beekleの実務知見が記事・登壇・資料に変換される状態にする。

15. Hidden buyer と社内合意を追う。
    Edelman/LinkedInの調査では、見えない意思決定者がB2B購買を進めたり止めたりする。`BuyingRole {visibility:'hidden'}` と `InternalInfluencer` を追加し、情シス、法務、経理、役員などに刺さる不安解消・根拠・比較軸を記事に持たせる。

16. B2Bでも機能価値だけでは足りない。
    BainのB2B Elements of Valueは、価格や仕様だけでなく、不安低減、評判保護、信頼、使いやすさ、個人的価値が効くことを示している。`ValueElement`, `EmotionalBenefit`, `ReputationRisk` を使い、CTAやLPのBenefitを「業務効果」だけで止めない。

17. トピッククラスタはSEO/LLMO両方で必要。
   HubSpotのtopic/pillar/subtopicモデルは、ピラー、支援ページ、内部リンクで情報構造を作る。Neo4jでは `Cluster`, `HAS_PILLAR`, `HAS_SUPPORTING_PAGE`, `INTERNAL_LINKS_TO` として持つ。

18. UX/CVRの摩擦もコンテンツマーケの関係として追う。
   GA4のkey event path と Clarityのdead click/rage click/scroll/quick back は、記事からCTAへ進めない理由を説明する。`FrictionSignal`, `AttributionPath`, `Touchpoint` を追加候補にする。

## LLMO向けサービス候補

ローカルNeo4jに入れる前提で、サービスは「何が取れるか」と「API/CSVで再現可能か」で見る。

| Service | 主に取れるもの | Neo4jでの取込先 | Beekleでの扱い |
|---|---|---|---|
| [Google Search Console Generative AI performance reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) | Google Search / Discover の生成AI機能内インプレッション | `Snapshot`, `Page`, `Metric` | 最優先。Google内の一次データ。ただし対象サイトに表示されるか、API取得できるかは確認が必要。 |
| [Microsoft Clarity AI Citations](https://learn.microsoft.com/en-us/clarity/ai-visibility/ai-citations) | AI回答内の引用ページ、Query、SoA、競合比較 | `AIQuery`, `Page`, `CompetitorDomain`, `Cluster`, `Snapshot` | 既存運用の中核。CSV手動エクスポート前提だが、Beekleにはすでに importer がある。 |
| [Microsoft Clarity Bot Activity](https://learn.microsoft.com/en-us/clarity/ai-visibility/bot-activity-overview) | AI/検索Botのクロールログ | `Crawler`, `Page`, `Snapshot` | Cloudflare連携後に追加候補。クロールは引用や成果ではないので、KPI扱いしない。 |
| [DataForSEO AI Optimization API](https://docs.dataforseo.com/v3/ai_optimization-overview/) | AI search volume、AIツール別のキーワード/意図、LLM mentions | `AIQuery`, `PromptSet`, `AIPlatform`, `AIAnswer`, `CompetitorDomain` | APIで自動化しやすい。既存クレジット運用と相性がよい。LLM Mentions の契約/課金条件は要確認。 |
| [DataForSEO LLM Mentions API](https://docs.dataforseo.com/v3/ai_optimization-llm_mentions-overview/) | ブランド/サイト/キーワードのAI回答内mentions、sources、AI search volume | `AIAnswer`, `Mention`, `AIQuery`, `CompetitorDomain`, `Snapshot` | Neo4j取込向き。ブランドがAI回答に「言及」されたかと、ページが「引用」されたかを分けられる。 |
| [Ahrefs Brand Radar](https://ahrefs.com/brand-radar) | AI回答内のブランド言及、引用、競合比較、大量のsearch-backed prompts | `PromptSet`, `AIQuery`, `AIAnswer`, `CompetitorDomain` | 既にAhrefsを使うなら候補。prompt母集団が大きいが、API/export可否と費用は確認。 |
| [Semrush AI Visibility Toolkit](https://www.semrush.com/kb/1493-ai-visibility-toolkit) | ブランド可視性、競合、prompt/topic、日次追跡、AI crawler blockers | `PromptSet`, `Cluster`, `AIPlatform`, `ContentGap` | SEO運用と一体で使うなら候補。外部レポートとして取り込みたい。 |
| [Otterly AI](https://otterly.ai/) | 自前prompt library、AI platform横断のmentions/citations、競合比較、アラート | `PromptSet`, `AIQuery`, `AIAnswer`, `CompetitorDomain` | 小さく始める監視ツール候補。Beekleの買い手プロンプトを固定観測する用途に合う。 |
| [Peec AI](https://peec.ai/) | ChatGPT / Perplexity / Gemini 等のAI search visibility、競合、引用分析 | `AIVisibilityService`, `PromptSet`, `AIAnswer`, `CompetitorDomain` | AI search analytics専用候補。CSV/APIが取れるなら比較対象。 |
| [Profound](https://www.tryprofound.com/) | AI visibility、source citations、brand sentiment、content AEO | `AIAnswer`, `Sentiment`, `CompetitorDomain`, `ContentGap` | エンタープライズ寄り。Beekle規模ではまず評価だけでよい。 |
| [Scrunch](https://scrunch.com/) | AI search monitoring、site audit、Agent Experience Platform、API | `AIVisibilityService`, `Crawler`, `Page`, `ContentGap` | 機械向け配信まで踏み込むサービス。Google向けには特殊markup不要という公式見解があるため、採用は実験扱い。 |
| [ZipTie.dev](https://ziptie.dev/) | ChatGPT / Perplexity / AI Overviews の可視性トラッキング | `PromptSet`, `AIQuery`, `Snapshot` | 軽量ツール候補。安く試す比較枠。 |

### サービス比較で見る軸

- `coverage`: ChatGPT / Gemini / Perplexity / Copilot / Google AI Overviews / AI Mode のどれを見られるか。
- `prompt_source`: 自前promptだけか、検索需要ベースのprompt母集団を持つか。
- `citation_vs_mention`: リンク付き引用と、テキスト言及を分けられるか。
- `competitor_context`: 同じ回答内で競合が誰と並ぶかを取れるか。
- `exportability`: API、CSV、Looker/BI連携、Webhook があるか。
- `cost`: 継続監視に耐える料金か。Beekleはまず低コスト/API優先。
- `local_graph_fit`: `AIQuery`, `AIAnswer`, `Page`, `CompetitorDomain`, `Cluster`, `ContentGap` に落としやすいか。

### 外部サービスを入れた場合の追加関係

```text
(:AIVisibilityService)-[:PRODUCED]->(:Snapshot)
(:PromptSet)-[:HAS_PROMPT]->(:AIQuery)
(:AIQuery)-[:ASKED_ON]->(:AIPlatform)
(:AIQuery)-[:PRODUCED_ANSWER]->(:AIAnswer)
(:AIAnswer)-[:MENTIONS]->(:Entity)
(:AIAnswer)-[:MENTIONS_BRAND]->(:Entity {name:'Beekle'})
(:AIAnswer)-[:CITES]->(:Page|:CompetitorDomain)
(:AIAnswer)-[:HAS_SENTIMENT]->(:Sentiment)
(:AIAnswer)-[:OBSERVED_IN]->(:Snapshot)
(:CompetitorDomain)-[:CO_OCCURS_WITH]->(:Page|:Entity)
```

注意:

- `AIAnswer` の全文保存はコストと著作権/再利用の扱いが重くなる。まずは hash、要約、mentions、citations、source URL、sentiment だけでよい。
- 自前prompt監視は便利だが、prompt集合が偏る。GSC、Clarity、DataForSEO、Ahrefs/Semrush等の外部母集団と併読する。
- Googleの生成AI検索については、まず Search Console の一次データを優先する。外部ツールの推定値は補助扱い。
- `llms.txt` やAI向け軽量ページは、Google Searchの必須施策ではない。採用するなら、Google向けではなく「他AIエージェント向けの実験」として `Experiment` に紐づける。

## 設計原則

1. `Page` を中心にしすぎない。
   見たいのはページ単体ではなく、「読者の課題」「購買段階」「本文の主張」「証拠」「CTA」「オファー」「結果」のつながり。

2. 意味は `Annotation` で持つ。
   `Persona` や `Problem` をすべて手入力ノード化すると重い。AI が抽出した意味は `Annotation` に入れ、必要なものだけ後で正規ノードに昇格する。

3. `Cluster` は必要。
   コンテンツマーケは記事単体よりクラスタ単位で見る。クラスタは固定分類ではなく、時点と方法を持つ `ClusterSet` の中で管理する。

4. バージョンと施策を分ける。
   `ContentVersion` は「その時点のページ内容」。`Initiative` / `ChangeSet` は「なぜ変えたか」。この2つを分けると、後から効果検証しやすい。

5. 関係には根拠を持たせる。
   AI が「このSectionは費用不安を扱っている」と判定したら、根拠の本文断片、モデル名、抽出日時、信頼度を残す。

6. 一次情報をコンテンツから分離して持つ。
   記事やLPは成果物。インタビュー、文字起こし、事例メモ、社内思想、強み、制約、実装判断は材料。材料を `SourceMaterial` として貯めておくと、別記事、事例、FAQ、比較表、営業資料、LLMO用RTBへ再利用できる。

## コアノード

### Content

| Label | 役割 |
|---|---|
| `Page` | URL単位の恒久ノード。記事、LP、サービス、ツール、ダウンロード、問い合わせなど。 |
| `ContentVersion` | ある時点のページ内容。title/description/body hash/git sha/MicroCMS更新時刻を持つ。 |
| `Section` | 見出し単位の本文ブロック。AI注釈の主な対象。 |
| `CTA` | ページ上の導線。`source`, `ctaId`, `href`, `position` を持つ。 |
| `Offer` | CTAが約束する提供価値。相談、資料DL、ツール利用、サービスLP、事例閲覧など。 |
| `Service` | Beekleが売るサービス面。 |
| `Tool` | 無料ツール、デモ、診断などの中間導線。 |
| `Asset` | PDF、テンプレート、チェックリスト、事例、図表など。 |
| `CaseStudy` | 事例コンテンツ。課題、導入判断、実装、成果、制約、公開可否を持つ。 |
| `ContentMission` | コンテンツマーケのWhy/Who/How。事業目的、顧客ニーズ、ブランド固有の視点を束ねる。 |
| `EditorialPillar` | 編集柱。継続して発信する主題・切り口。単発記事ではなくブランド資産として育てる単位。 |
| `ContentPurpose` | awareness, trust, demand creation, comparison support, conversion, retention など記事の役割。 |
| `ContentBrief` | 記事・LP・事例を書く前の設計書。狙うCEP、KBF、RTB、CTA、一次情報ソースを持つ。 |
| `ArticleDraft` | 記事ドラフト。公開前の原稿、生成元、承認状態、使った引用/根拠を持つ。 |
| `ContentAtom` | 記事から切り出す再利用単位。SNS投稿、メール、図解、セミナー断片、FAQなど。 |
| `DistributionChannel` | LinkedIn, X, メルマガ, ウェビナー, PR, 外部寄稿, 営業資料などの配信面。 |
| `ExternalPublishedContent` | note、外部寄稿、登壇資料など、Beekleサイト外に公開したコンテンツ。 |
| `NoteArticle` | note記事。思想、検証ログ、一次情報、Beekleへの送客導線を持つ外部発信。 |
| `LinkedInPost` | LinkedIn投稿。専門家の署名性、hidden buyerへの接触、記事/note/LPへの送客導線を持つ外部発信。 |
| `QuestionAnswerBlock` | AIが拾いやすい質問→直接回答→理由→具体例のブロック。FAQとは別に本文内のQ&Aも扱う。 |
| `FAQ` | FAQ単位。LLMO では引用・吸収されやすいのでSectionとは別にしてもよい。 |
| `InternalLink` | 内部リンクのアンカーとリンク先。実装上は関係プロパティでもよい。 |
| `TitleMeta` | title / meta description / OG title など。SEO CTRと施策履歴の対象。 |
| `StructuredData` | FAQPage, Article, BreadcrumbList, Organization などの構造化データ。 |
| `LLMSFile` | `/llms.txt` やAI向けサイト要約。将来追加する場合の管理対象。 |

### Meaning

| Label | 役割 |
|---|---|
| `Persona` | 読者像。A1事業部、A2情シス、A3経営層、B同業協業、Cエンジニアなど。 |
| `BuyingRole` | 購買委員会内の役割。起案者、評価者、決裁者、実装者、協業先など。 |
| `InternalInfluencer` | 購買委員会の裏側にいる影響者。法務、経理、情シス、役員、現場責任者など。`BuyingRole` のプロパティでもよい。 |
| `JourneyStage` | 課題認知、情報収集、比較検討、発注直前、導入後など。 |
| `AudienceNeed` | Audienceがコンテンツに期待する具体ニーズ。理解したい、比較したい、社内説明したい、失敗を避けたいなど。 |
| `CategoryEntryPoint` | CEP。買い手がカテゴリに入る具体状況。`status: expected/observed/validated` を持つ。 |
| `CustomerMoment` | 顧客が今まさに困る瞬間。例: FAQを作ったのに問い合わせが減らない。Why nowの中核。 |
| `BuyingSituation` | CEPを構成する状況。例: 上司からAI導入の概算を聞かれた。 |
| `NeedState` | その状況で満たしたい要求状態。例: 予算化前に実現性を見たい。 |
| `Constraint` | 制約。予算、納期、セキュリティ、社内稟議、既存システムなど。 |
| `DesiredOutcome` | 欲しい結果。例: 小さく検証して社内承認を取りたい。 |
| `SmallAction` | 問題発生直後に取れる小さな行動。診断、デモ、ログ分析、精度確認など。 |
| `Intent` | 検索・AI質問・CTA行動の意図。informational/commercial/transactional だけでなく日本語業務意図を持つ。 |
| `Problem` | 読者が抱える具体課題。例: 見積もりが妥当か分からない。 |
| `Trigger` | なぜ今動くのか。例: 予算化、上司からの指示、既存FAQ botの限界。 |
| `EnvironmentalChange` | 今動く背景変化。ChatGPT社内利用、ベテラン退職、問い合わせ増、予算確保など。 |
| `Objection` | 行動前の不安。例: 高そう、失敗しそう、社内データを出せない。 |
| `DecisionCriteria` | 選定基準。費用、期間、セキュリティ、実績、運用負荷など。 |
| `KeyBuyingFactor` | KBF。AIや買い手が比較・推奨で重視する選定軸。`DecisionCriteria` より施策上の優先軸として扱う。 |
| `EvaluationAxis` | LLMOプロンプト設計上の評価軸。費用比較、評判、実績、セキュリティなど。初期は `KeyBuyingFactor` と統合してもよい。 |
| `FitCondition` | Beekleが向いている条件。例: 要件が曖昧で実物を触りながら決めたい。 |
| `NonFitCondition` | Beekle/RAG/GraphRAGが向いていない条件。例: 単純FAQならRAG不要。 |
| `DifferentiatorMechanism` | 形容詞ではなく仕組みとしての差別化。例: 本開発前に動くプロトタイプで判断する。 |
| `CompetitiveAlternative` | SaaS型、大手コンサル、一般受託会社など、比較対象の選択肢。 |
| `ValueElement` | B2Bで買い手が感じる価値要素。機能、使いやすさ、不安低減、評判保護、信頼、個人的評価など。 |
| `Benefit` | 読者にとっての得。機能ではなく得られる状態。 |
| `EmotionalBenefit` | B2Bでも効く感情的得。安心できる、社内説明しやすい、失敗リスクを下げられるなど。 |
| `LossAvoided` | 避けられる損失。手戻り、炎上、予算浪費、選定ミスなど。 |
| `ReputationRisk` | 担当者/部署/会社の評判に関わるリスク。稟議失敗、セキュリティ事故、ベンダー選定ミスなど。 |
| `Claim` | 本文で断定している主張。 |
| `Assumption` | 読者や市場が持つ前提。例: AI開発は高い、RAGはFAQ botの延長、PoCは本番化しないなど。Thought leadershipで更新する対象。 |
| `ProofPoint` | Claim の根拠。数字、事例、出典、デモ、実装実績など。 |
| `ReasonToBelieve` | RTB。KBFやClaimをAI/読者が信じるための根拠パッケージ。ProofPoint、Quote、CaseStudy、ExternalSourceを束ねる。 |
| `Message` | SectionやCTAが伝える主要メッセージ。 |
| `Brand` | Beekleブランド本体。サイト、会社、サービス、代表/チームの発信を束ねる。 |
| `BrandPositioning` | Beekleが市場で何者として見られたいか。誰のどの状況で選ばれるかを含む。 |
| `BrandAssociation` | ブランドに結びつけたい記憶・意味・状況。例: AI受託を業務理解から小さく進める会社。 |
| `BrandPromise` | 顧客に約束する未来。抽象スローガンではなく、CTA/Offerで受け止められる約束。 |
| `BrandVoice` | 文章の声。実務的、率直、業務課題から入る、過剰に煽らないなど。 |
| `Topic` | 主題。要件定義、RAG、CDP、AI受託、費用など。 |
| `Entity` | 製品、技術、競合、用語、会社などの固有概念。 |
| `Annotation` | AIまたは人間による意味付け。`type`, `value`, `evidence`, `confidence`, `status` を持つ。 |

### First-party Knowledge

| Label | 役割 |
|---|---|
| `SourceMaterial` | 一次情報の元データ。インタビュー音声、文字起こし、営業メモ、事例メモ、社内ドキュメントなど。 |
| `Interview` | 顧客、社内、パートナーへのインタビュー。目的、対象、公開可否、収録日を持つ。 |
| `Transcript` | 文字起こし全文。PIIを含む可能性があるので raw はローカル保存、Neo4jにはhash/要約中心。 |
| `Utterance` | 発話単位。話者種別、順序、要約、匿名化済み引用候補を持つ。 |
| `Quote` | 記事や事例で使える引用候補。匿名/実名、公開承認、要約引用か直接引用かを持つ。 |
| `Project` | 事例の元になる案件/取り組み。業種、課題、範囲、制約、公開可否を持つ。 |
| `Outcome` | 成果。定量/定性、測定条件、期間、出典を持つ。 |
| `CompanyStrength` | Beekleの強み。例: 業務理解から実装まで一気通貫、ローカル/小さく試す設計、AIエージェント実装知見。 |
| `Principle` | 自社の思想・判断基準。例: 技術説明より業務課題から入る、小さく作って検証する。 |
| `PointOfView` | 市場や顧客課題に対する見解。記事の主張や切り口の源泉。 |
| `Methodology` | Beekleの進め方。要件定義、PoC、本番化、運用改善、GraphRAG設計など。 |
| `Capability` | 実装できる能力。RAG、MCP、Neo4j、Cloudflare、CRM連携など。 |
| `SubjectMatterExpert` | 社内外の専門家。実装者、PM、代表、営業、顧客など。Thought leadershipの供給源。 |
| `ThoughtLeadership` | 独自の視点を持つ発信物。記事、登壇、ホワイトペーパー、調査、動画など。 |
| `OriginalResearch` | 自社調査、顧客インタビュー集計、ログ分析、PoC検証などの独自調査。 |
| `ResearchFinding` | OriginalResearchから得た発見。PointOfViewやRTBの根拠になる。 |
| `BrandAuthoritySignal` | ブランド権威シグナル。登壇、被リンク、引用、メディア掲載、コミュニティ反応など。 |
| `TrustSignal` | 信頼シグナル。実績、公開事例、第三者評価、技術記事、透明な制約説明など。 |
| `ConfidentialityPolicy` | 公開可否、匿名化条件、引用禁止、社名公開可否などの取り扱い。 |
| `Consent` | 顧客/関係者の公開承認。事例化、引用、数値公開の粒度を持つ。 |

### Cluster

| Label | 役割 |
|---|---|
| `ClusterSet` | ある時点・方法で作ったクラスタ集合。例: `manual-v1`, `embedding-2026-08`。 |
| `Cluster` | コンテンツ、クエリ、課題、意味、キャンペーンなどのまとまり。`type` で区別する。 |

最初は `ContentCluster`, `QueryCluster` などを別ラベルにしない。`(:Cluster {type:'content'})` のようにする。

主な `Cluster.type`:

- `content`: 記事/LP群のまとまり
- `query`: 検索クエリ/AIクエリのまとまり
- `problem`: 課題のまとまり
- `semantic`: 意味的に近いページ群
- `campaign`: 施策対象のまとまり
- `offer`: 同じオファーに送る導線群

### Demand

| Label | 役割 |
|---|---|
| `SearchQuery` | GSCやDataForSEO由来の検索クエリ。 |
| `AIQuery` | Clarity AI Citations 由来のAI引用クエリ。 |
| `PromptSet` | AI検索/LLMO監視用のプロンプト集合。自社で作るもの、外部サービスが自動生成するもの。 |
| `PromptTemplate` | LANY式のプロンプトマップで使うテンプレート。カテゴリ、競合、評価軸、出力形式を持つ。 |
| `PromptAxis` | プロンプト生成の軸。target, serviceCategory, competitor, evaluationAxis, constraint, stage など。 |
| `PromptRun` | 特定日時・platform・model・promptで実行した観測ログ。回答揺れを見るため、AIQueryと分ける。 |
| `AIAnswer` | あるAIPlatformで、あるPrompt/AIQueryに対して得られた回答。保存する場合は要約/hash中心にする。 |
| `Mention` | AI回答内のブランド/サービス/人物/競合の言及。引用とは分ける。 |
| `Sentiment` | AI回答内での言及トーン。positive/neutral/negative/mixed など。 |
| `QueryVariant` | 言い換え、表記ゆれ、長尾質問。 |
| `ReferenceSurface` | AIが根拠を探しに行く検索結果面/媒体面。query、SERP上位、第三者媒体、公式FAQなど。 |
| `ExternalSource` | 第三者記事、比較サイト、レビュー、登壇資料、GitHub、求人/会社情報など外部の根拠面。 |
| `UTMTag` | 外部発信やCTAのUTM。source, medium, campaign, content, term を持つ。note送客は `source: note`, `medium: article`、LinkedIn通常投稿は `source: linkedin`, `medium: social` を必須にする。 |
| `Channel` | Organic Search, AI Assistant, Referral, Direct など。 |
| `Referrer` | chatgpt.com, bing.com, sales-crowd.jp など。 |
| `CompetitorDomain` | AI引用やSERPで比較対象になる外部ドメイン。 |
| `SERPFeature` | AI Overview, FAQ, PAA など。取得できる場合だけ。 |
| `AIPlatform` | ChatGPT, Copilot, Gemini, Perplexity など。取れる範囲でAI流入/引用元を区別する。 |
| `Crawler` | GPTBot, ClaudeBot, PerplexityBot, Bingbot など。Cloudflare連携で取れる場合だけ。 |
| `AIVisibilityService` | Clarity, DataForSEO, Ahrefs, Semrush, Otterly, Peec, Profound, Scrunch などの取得元。 |

### Observation

| Label | 役割 |
|---|---|
| `Snapshot` | 取得ソースと期間。GSC/GA4/Clarity/DataForSEO/beekle-crm。 |
| `Metric` | 施策で動かしたい指標。例: `contact_conversions`, `gsc_clicks`, `ai_citations`, `cta_clicks`。 |
| `MetricObservation` | 汎用の観測値。必要な場合だけ使う。多くは関係プロパティでよい。 |
| `EventObservation` | CTAクリック、フォーム送信、ツール利用など。 |
| `BeekleCRM` | お問い合わせCVの正本。初期はCSV/JSONインポート元、将来はMCP参照元として扱う。 |
| `CRMRecord` | beekle-crm上の問い合わせ/リード/商談レコードへの匿名化参照。raw本文や個人情報は持たない。 |
| `ContactConversion` | お問い合わせCV。初期North Star KPI。receivedAt, source, medium, campaign, landingPage, status などを持つ。 |
| `Lead` | 実問い合わせの匿名化ノード。初期は `ContactConversion` と同義でもよい。quality/persona/channel/source/landingPage だけ持つ。 |
| `CRMStatus` | new, contacted, meeting_scheduled, disqualified などCRM上の状態。必要ならノード化し、初期はプロパティでもよい。 |
| `LeadQuality` | `high`, `medium`, `low`, `spam` など。ノード化せず `Lead.quality` プロパティだけでもよい。 |

### Change

| Label | 役割 |
|---|---|
| `Initiative` | 施策。例: LLMO FAQ強化、CTA差し替え、クラスタ強化。 |
| `Campaign` | note/LinkedIn/記事群/広告などを束ねるキャンペーン。UTM campaign と施策意図を接続する。 |
| `Hypothesis` | 施策仮説。例: AI引用ページのFAQを厚くするとSoAが上がる。 |
| `ChangeSet` | 実際の変更単位。git commit、MicroCMS PATCH、スクリプト名など。 |
| `Experiment` | A/Bや前後比較などの検証単位。 |
| `Decision` | なぜその施策をやった/やらなかったか。 |
| `Task` | 実装や記事改稿の作業。必要なら。 |
| `ContentGap` | AIエージェントが検出した改善点。例: CTA不一致、根拠不足、内部リンク不足。 |
| `ContentRisk` | 放置すると悪化するリスク。例: 古い情報、日付依存、競合に奪われているAI引用。 |

## 追うべき関係

### 1. ページ構造

```text
(:Page)-[:HAS_VERSION]->(:ContentVersion)
(:Page)-[:CURRENT_VERSION]->(:ContentVersion)
(:ContentVersion)-[:PREVIOUS_VERSION]->(:ContentVersion)
(:ContentVersion)-[:HAS_SECTION {order}]->(:Section)
(:ContentVersion)-[:HAS_FAQ {order}]->(:FAQ)
(:Page)-[:HAS_CTA {position, order}]->(:CTA)
(:CTA)-[:PROMOTES]->(:Offer)
(:CTA)-[:LINKS_TO]->(:Page)
(:Page)-[:INTERNAL_LINKS_TO {anchor, position}]->(:Page)
(:Page)-[:CANONICAL_OF]->(:Page)
```

見ること:

- 重要ページにCTAがあるか。
- CTAのリンク先が本文の約束を受け止めているか。
- ピラー記事から支援記事へ、支援記事からLP/CTAへ流れているか。
- AI引用されているページが孤立していないか。

### 2. 本文の意味

```text
(:Section)-[:COMMUNICATES]->(:Message)
(:Section)-[:MAKES_CLAIM]->(:Claim)
(:Claim)-[:SUPPORTED_BY]->(:ProofPoint)
(:Message)-[:TARGETS]->(:Persona)
(:Message)-[:SERVES_ROLE]->(:BuyingRole)
(:Message)-[:SERVES_STAGE]->(:JourneyStage)
(:Message)-[:ADDRESSES]->(:Problem)
(:Message)-[:HANDLES_OBJECTION]->(:Objection)
(:Message)-[:PROMISES]->(:Benefit)
(:Message)-[:AVOIDS_LOSS]->(:LossAvoided)
(:Message)-[:MENTIONS]->(:Topic)
(:Message)-[:MENTIONS_ENTITY]->(:Entity)
(:Message)-[:DIFFERENTIATES_FROM]->(:Entity)
```

見ること:

- 本文が誰向けか。
- 課題、トリガー、不安、選定基準のどれを扱っているか。
- 強いClaimにProofPointがあるか。
- CTAが約束するBenefitと本文のMessageが一致しているか。
- LPのfirst viewが流入元記事の不安を受け止めているか。

### 3. 注釈

```text
(:Section)-[:HAS_ANNOTATION]->(:Annotation)
(:CTA)-[:HAS_ANNOTATION]->(:Annotation)
(:Page)-[:HAS_ANNOTATION]->(:Annotation)
(:Annotation)-[:REFERS_TO]->(:Persona|:Problem|:Benefit|:Objection|:Topic|:Intent)
```

`Annotation` の主要プロパティ:

```text
type: 'persona' | 'problem' | 'benefit' | 'objection' | 'claim' | 'stage' | 'intent' | 'topic'
value: string
evidence: string
confidence: number
model: string
promptVersion: string
status: 'ai_suggested' | 'human_approved' | 'rejected'
createdAt: datetime
```

AI抽出結果はまずここに入れる。人間が承認したものだけ、後で正規ノードとの強い関係にしてよい。

### 4. クラスタ

```text
(:ClusterSet)-[:HAS_CLUSTER]->(:Cluster)
(:Cluster)-[:HAS_MEMBER {weight, reason, status}]->(:Page)
(:Cluster)-[:HAS_MEMBER {weight, reason, status}]->(:SearchQuery)
(:Cluster)-[:HAS_MEMBER {weight, reason, status}]->(:AIQuery)
(:Cluster)-[:TARGETS]->(:Persona)
(:Cluster)-[:SERVES_STAGE]->(:JourneyStage)
(:Cluster)-[:ADDRESSES]->(:Problem)
(:Cluster)-[:PROMOTES]->(:Offer)
(:Cluster)-[:HAS_PILLAR]->(:Page)
(:Cluster)-[:HAS_SUPPORTING_PAGE]->(:Page)
(:Cluster)-[:COMPETES_WITH]->(:Cluster)
```

見ること:

- クラスタごとの「誰向け」「何の課題」「どのオファー」が明確か。
- ピラーと支援記事の役割が分かれているか。
- 同じクエリを複数クラスタが奪い合っていないか。
- AI引用は強いがCTA/Offerが弱いクラスタはどこか。
- GSCは強いが、お問い合わせCVが出ていないクラスタはどこか。

### 5. 検索需要とページ

今のGSCスナップショットは query 別 / page 別が中心。Neo4jには将来的に query x page を入れたい。

```text
(:SearchQuery)-[:EXPRESSES]->(:Intent)
(:SearchQuery)-[:EXPRESSES_PROBLEM]->(:Problem)
(:SearchQuery)-[:BELONGS_TO]->(:Cluster)
(:SearchQuery)-[:RANKS_PAGE {
  clicks,
  impressions,
  ctr,
  position
}]->(:Page)
(:SearchQuery)-[:OBSERVED_IN]->(:Snapshot)
```

見ること:

- 表示されているクエリの課題を本文が扱っているか。
- buyer intent クエリが情報記事に吸われていないか。
- 順位5-20でCTRが弱いページはどれか。
- 同じクエリで複数ページが競合していないか。
- クエリのJourneyStageとCTAのCTAIntentが合っているか。

### 6. AI引用とLLMO

```text
(:AIQuery)-[:EXPRESSES]->(:Intent)
(:AIQuery)-[:EXPRESSES_PROBLEM]->(:Problem)
(:AIQuery)-[:BELONGS_TO]->(:Cluster)
(:AIQuery)-[:CITES {
  citations,
  soaPct
}]->(:Page)
(:AIQuery)-[:OBSERVED_IN]->(:Snapshot)
(:AIQuery)-[:MENTIONS]->(:Topic)
```

見ること:

- AIが引用しているページに適切なCTAがあるか。
- AIQueryの背後にある購買意図と、ページの本文/Offerが合っているか。
- AI引用されているがOrganic流入やお問い合わせCVに繋がっていないページはどこか。
- QueryではなくTopic単位で伸びている領域はどこか。
- LLMOで強いページから、商用ページへ内部リンクが張れているか。

### 6.5 観測値

観測値は、取得ソースごとの `Snapshot` に対する関係プロパティとして持つ。
指標ごとにノードを大量生成するより、初期実装ではこの方が読みやすい。

```text
(:Page)-[:HAS_GSC_PAGE_METRIC {
  clicks,
  impressions,
  ctr,
  position
}]->(:Snapshot)

(:Page)-[:HAS_GA4_PAGE_METRIC {
  sessions,
  screenPageViews
}]->(:Snapshot)

(:CTA)-[:HAS_GA4_EVENT_METRIC {
  eventName,
  eventCount
}]->(:Snapshot)

(:Page)-[:HAS_CLARITY_CITATION_METRIC {
  citations
}]->(:Snapshot)

(:AIQuery)-[:HAS_CLARITY_QUERY_METRIC {
  citations,
  soaPct
}]->(:Snapshot)
```

見ること:

- 同じページの GSC / GA4 / Clarity を横断できるか。
- 施策対象ページの前後比較ができるか。
- 指標だけ高く、CTAやお問い合わせCVに繋がらないページはどこか。

### 6.6 SEO / LLMOで特に追う関係

SEOとLLMOは同じ「流入」ではない。SEOは検索結果でクリックされること、LLMOはAI回答の中で引用・参照・要約・推奨されることが中心になる。
そのため、両方を同じ `traffic` として潰さず、以下の関係を分けて持つ。

#### SEO

```text
(:Page)-[:HAS_TITLE_META]->(:TitleMeta)
(:TitleMeta)-[:CREATED_BY]->(:ContentVersion)
(:SearchQuery)-[:TRIGGERS_SERP_FEATURE]->(:SERPFeature)
(:SearchQuery)-[:RANKS_PAGE {
  clicks,
  impressions,
  ctr,
  position
}]->(:Page)
(:Page)-[:DUPLICATES_INTENT_WITH]->(:Page)
(:Page)-[:CANNIBALIZES_WITH]->(:Page)
(:Page)-[:HAS_STRUCTURED_DATA]->(:StructuredData)
(:Page)-[:INTERNAL_LINKS_TO {anchor, position}]->(:Page)
```

SEOで見ること:

- title / description が実際の `SearchQuery` と合っているか。
- 順位はあるのにCTRが低いページは、title問題か、AI Overview/意図ズレか。
- 同じクエリに複数ページが出てカニバっていないか。
- ピラー/支援記事/LPの内部リンクがクラスタ内で機能しているか。
- FAQやArticle構造化データが、実際の本文構造と一致しているか。
- 更新日やタイトル変更など、施策前後の変化を `ContentVersion` と結びつけられるか。

#### LLMO

```text
(:AIQuery)-[:CITES {
  citations,
  soaPct
}]->(:Page)
(:AIQuery)-[:BELONGS_TO]->(:Cluster)
(:AIQuery)-[:EXPRESSES_PROBLEM]->(:Problem)
(:AIQuery)-[:ASKED_ON]->(:AIPlatform)
(:Page)-[:HAS_STRUCTURED_DATA]->(:StructuredData)
(:Page)-[:EXPOSED_IN]->(:LLMSFile)
(:Page)-[:MAKES_CLAIM]->(:Claim)
(:Claim)-[:SUPPORTED_BY]->(:ProofPoint)
(:FAQ)-[:ANSWERS]->(:AIQuery)
(:Crawler)-[:CRAWLED]->(:Page)
```

LLMOで見ること:

- AIがどのQuery/TopicでどのPageを引用しているか。
- AI引用されるページが、問い合わせ・資料DL・サービスLPへ自然に接続しているか。
- AIQueryの課題とページ内のFAQ/Claim/ProofPointが一致しているか。
- 引用されているがProofPointが弱いページはどれか。
- 競合も引用されるQueryで、自社の差別化Messageが足りているか。
- `/llms.txt` を作る場合、そこに載せたページとAI引用ページが一致しているか。
- AIクローラのBot Activityが取れる場合、クロールされているが引用されないページはどれか。

#### SEOとLLMOで分けるべきギャップ

| Gap | SEO側の見方 | LLMO側の見方 |
|---|---|---|
| `query_page_mismatch` | 検索クエリの意図と表示ページがズレる | AIQueryの問いと引用ページの回答がズレる |
| `ctr_gap` | 順位はあるがクリックされない | AI回答内で引用されても送客されない |
| `proof_gap` | E-E-A-T / 信頼性が弱い | AIが根拠として使いにくい |
| `schema_gap` | 構造化データが足りない/本文と不一致 | FAQ/Claim/EntityをAIが拾いにくい |
| `cluster_gap` | 内部リンクとピラー構成が弱い | 関連ページ群としてAIに認識されにくい |
| `conversion_gap` | Organic流入がCTAへ進まない | AI引用ページから商用導線へ進まない |

### 6.7 CEP / KBF / RTB

LANY白書の4ステップは、Neo4jでは以下の一連の関係に落とす。

```text
(:CategoryEntryPoint)-[:OCCURS_FOR]->(:Persona|:BuyingRole)
(:CategoryEntryPoint)-[:HAS_SITUATION]->(:BuyingSituation)
(:CategoryEntryPoint)-[:TRIGGERED_BY]->(:Trigger)
(:CategoryEntryPoint)-[:HAS_NEED]->(:NeedState|:Problem)
(:CategoryEntryPoint)-[:HAS_CONSTRAINT]->(:Constraint)
(:CategoryEntryPoint)-[:WANTS_OUTCOME]->(:DesiredOutcome|:Benefit)
(:CategoryEntryPoint)-[:EXPRESSED_AS]->(:SearchQuery|:AIQuery|:PromptTemplate)
(:CategoryEntryPoint)-[:PRIORITIZED_BY {
  businessImpact,
  commonness,
  credibility,
  competition,
  winability
}]->(:Cluster)

(:PromptSet)-[:COVERS_CEP]->(:CategoryEntryPoint)
(:PromptSet)-[:HAS_TEMPLATE]->(:PromptTemplate)
(:PromptTemplate)-[:USES_AXIS]->(:PromptAxis)
(:PromptAxis)-[:TARGETS]->(:Persona|:Service|:Topic|:Entity|:CompetitorDomain|:EvaluationAxis|:Constraint|:JourneyStage)
(:AIQuery)-[:INSTANCE_OF]->(:PromptTemplate)
(:PromptRun)-[:RUNS]->(:AIQuery)
(:PromptRun)-[:ASKED_ON]->(:AIPlatform)
(:PromptRun)-[:PRODUCED]->(:AIAnswer)

(:AIAnswer)-[:RECOMMENDS]->(:Service|:Entity)
(:AIAnswer)-[:EVALUATES_WITH]->(:KeyBuyingFactor)
(:AIAnswer)-[:CITES]->(:Page|:ExternalSource|:CompetitorDomain)
(:AIAnswer)-[:MENTIONS_BRAND]->(:Entity {name: 'Beekle'})
(:AIAnswer)-[:CO_OCCURS_WITH]->(:CompetitorDomain)

(:KeyBuyingFactor)-[:IMPORTANT_FOR]->(:CategoryEntryPoint)
(:KeyBuyingFactor)-[:SUPPORTED_BY]->(:ReasonToBelieve)
(:ReasonToBelieve)-[:BACKED_BY]->(:ProofPoint|:Quote|:CaseStudy|:ExternalSource|:MetricObservation)
(:ReasonToBelieve)-[:PLACED_ON]->(:Page|:ExternalSource|:Asset)
(:Message)-[:BUILDS_ASSOCIATION_WITH]->(:CategoryEntryPoint)
(:Message)-[:ARGUES_FOR]->(:KeyBuyingFactor)
```

見ること:

- 想定CEPが単なる仮説か、GSC/Clarity/ContactConversion/Interviewで観測されたものか。
- 重点CEPごとに、AIが重視するKBFが見えているか。
- KBFごとに、AIが言い切れるRTBがあるか。
- RTBが実際に参照されやすいページ/外部媒体に置かれているか。
- AI回答でBeekleが候補に入っているだけでなく、狙ったKBFで推奨されているか。

Beekleで最初に持つ想定CEP例:

- 上司に生成AI導入の概算と進め方を聞かれた。
- 既存FAQ botやチャットボットが限界で、RAG/GraphRAGに切り替えるか悩んでいる。
- AI受託開発会社、RAG開発会社、AIエージェント開発会社を比較したい。
- 要件定義書やRFPを作らないと見積もりが取れない。
- 社内データをAIに使ってよいか、セキュリティと運用が不安。
- 既存の業務SaaSやCRMとAIをつなぎたいが、どこから着手すべきか分からない。
- 同業SIer/制作会社がAI実装パートナーを探している。

`CategoryEntryPoint.status`:

- `expected`: 戦略上の想定。まだデータで観測されていない。
- `observed`: GSC、Clarity、DataForSEO、ContactConversion、Interviewで近い問いが観測された。
- `validated`: AI引用、指名検索、問い合わせ、商談メモ、事例化のいずれかで成果に接続した。

### 6.8 一次情報から記事・事例へ

記事を書くための知識グラフは、公開ページだけを読むだけでは足りない。インタビュー文字起こし、事例メモ、自社の思想、強み、方法論を蓄積し、`ContentBrief` に渡す。

```text
(:SourceMaterial)-[:HAS_INTERVIEW]->(:Interview)
(:Interview)-[:HAS_TRANSCRIPT]->(:Transcript)
(:Transcript)-[:HAS_UTTERANCE {order, speakerType}]->(:Utterance)
(:Utterance)-[:EXTRACTED_AS]->(:Quote|:Problem|:Objection|:KeyBuyingFactor|:ReasonToBelieve|:Claim)
(:Quote)-[:EVIDENCES]->(:Problem|:Objection|:CompanyStrength|:KeyBuyingFactor|:ReasonToBelieve)
(:Quote)-[:REQUIRES_CONSENT]->(:Consent)

(:Project)-[:HAS_SOURCE]->(:SourceMaterial)
(:Project)-[:FACED]->(:Problem)
(:Project)-[:HAD_CONSTRAINT]->(:Constraint)
(:Project)-[:USED_CAPABILITY]->(:Capability)
(:Project)-[:FOLLOWED]->(:Methodology)
(:Project)-[:PRODUCED_OUTCOME]->(:Outcome)
(:CaseStudy)-[:ABOUT_PROJECT]->(:Project)
(:CaseStudy)-[:SHOWS_BEFORE]->(:Problem)
(:CaseStudy)-[:SHOWS_INTERVENTION]->(:Methodology|:Capability|:Service)
(:CaseStudy)-[:SHOWS_OUTCOME]->(:Outcome|:Benefit|:MetricObservation)
(:CaseStudy)-[:SUPPORTS]->(:ReasonToBelieve|:CompanyStrength|:KeyBuyingFactor)

(:CompanyStrength)-[:PROVEN_BY]->(:ReasonToBelieve|:CaseStudy|:Quote|:Outcome)
(:Principle)-[:GUIDES]->(:Methodology|:ContentBrief)
(:PointOfView)-[:FRAMES]->(:Message|:ContentBrief)
(:Methodology)-[:DELIVERS]->(:Benefit)
(:Capability)-[:ENABLES]->(:Methodology|:Offer)

(:ContentBrief)-[:TARGETS_CEP]->(:CategoryEntryPoint)
(:ContentBrief)-[:TARGETS_PERSONA]->(:Persona)
(:ContentBrief)-[:TARGETS_STAGE]->(:JourneyStage)
(:ContentBrief)-[:TARGETS_KBF]->(:KeyBuyingFactor)
(:ContentBrief)-[:USES_RTB]->(:ReasonToBelieve)
(:ContentBrief)-[:USES_SOURCE]->(:SourceMaterial|:Transcript|:Quote|:CaseStudy|:Project)
(:ContentBrief)-[:PROMOTES]->(:Offer)
(:ArticleDraft)-[:REALIZES]->(:ContentBrief)
(:ArticleDraft)-[:USES_QUOTE]->(:Quote)
(:ArticleDraft)-[:USES_RTB]->(:ReasonToBelieve)
(:ArticleDraft)-[:CREATES_VERSION]->(:ContentVersion)
```

見ること:

- 記事が一次情報から書かれているか。AI一般論だけで埋まっていないか。
- 事例が「課題 -> 制約 -> 実装判断 -> 成果 -> 再現条件」まで辿れるか。
- Beekleの強みが、自己紹介ではなくQuote/CaseStudy/Outcomeで裏付いているか。
- 自社の思想や方法論が、個別記事のMessageに一貫して反映されているか。
- 公開できない情報を誤って記事に使っていないか。

記事ブリーフに最低限入れる項目:

- 狙うCEPと、その根拠。expected / observed / validated のどれか。
- 読者のPersona、BuyingRole、JourneyStage。
- AIが比較で使うKBF。
- そのKBFに対するRTB。数字、事例、引用、第三者情報、制約条件。
- BeekleのPointOfView。なぜその見方をするのか。
- CTAとOffer。本文で約束した未来を受け止める導線。
- 公開可否。社名、数値、引用、スクリーンショットを使えるか。

### 6.9 自社ブランディングと編集戦略

ブランディングは、単にコピーやロゴを管理する層ではない。Beekleをどの買い手状況、どの価値、どの根拠、どの語り口と結びつけるかを管理する。

```text
(:Brand {name: 'Beekle'})-[:HAS_POSITIONING]->(:BrandPositioning)
(:Brand)-[:HAS_PROMISE]->(:BrandPromise)
(:Brand)-[:USES_VOICE]->(:BrandVoice)
(:Brand)-[:WANTS_ASSOCIATION]->(:BrandAssociation)
(:BrandAssociation)-[:LINKS_TO_CEP]->(:CategoryEntryPoint)
(:BrandAssociation)-[:LINKS_TO_TOPIC]->(:Topic)
(:BrandAssociation)-[:LINKS_TO_VALUE]->(:ValueElement|:Benefit|:EmotionalBenefit)
(:BrandAssociation)-[:LINKS_TO_KBF]->(:KeyBuyingFactor)
(:BrandAssociation)-[:PROVEN_BY]->(:ReasonToBelieve|:CaseStudy|:Quote|:Outcome|:TrustSignal)
(:BrandPositioning)-[:DIFFERENTIATES_FROM]->(:CompetitorDomain|:Entity)
(:BrandPromise)-[:FULFILLED_BY]->(:Offer|:Service|:Methodology)

(:ContentMission)-[:SUPPORTS_BUSINESS_OBJECTIVE]->(:Metric|:Initiative)
(:ContentMission)-[:SERVES]->(:Persona|:BuyingRole|:InternalInfluencer)
(:ContentMission)-[:ADDRESSES_NEED]->(:AudienceNeed)
(:ContentMission)-[:EXPRESSES]->(:BrandPositioning|:PointOfView)
(:ContentMission)-[:HAS_PILLAR]->(:EditorialPillar)
(:EditorialPillar)-[:TARGETS_CEP]->(:CategoryEntryPoint)
(:EditorialPillar)-[:BUILDS_ASSOCIATION]->(:BrandAssociation)
(:EditorialPillar)-[:COVERS_TOPIC]->(:Topic)
(:EditorialPillar)-[:USES_FORMAT]->(:ContentPurpose)
(:ContentBrief)-[:BELONGS_TO_PILLAR]->(:EditorialPillar)
(:ContentBrief)-[:HAS_PURPOSE]->(:ContentPurpose)
(:ContentBrief)-[:PLANNED_FOR]->(:DistributionChannel)
(:ArticleDraft)-[:REPURPOSED_AS]->(:ContentAtom)
(:ContentAtom)-[:DISTRIBUTED_ON]->(:DistributionChannel)
(:ExternalPublishedContent)-[:PUBLISHED_ON]->(:DistributionChannel)
(:NoteArticle)-[:IS_A]->(:ExternalPublishedContent)
(:NoteArticle)-[:USES_SOURCE]->(:SourceMaterial|:Quote|:OriginalResearch|:CaseStudy)
(:NoteArticle)-[:EXPRESSES]->(:PointOfView)
(:NoteArticle)-[:BUILDS_ASSOCIATION]->(:BrandAssociation)
(:NoteArticle)-[:LINKS_TO]->(:Page|:Offer|:Service)
(:NoteArticle)-[:HAS_UTM]->(:UTMTag {source: 'note', medium: 'article'})

(:LinkedInPost)-[:IS_A]->(:ExternalPublishedContent)
(:LinkedInPost)-[:AUTHORED_BY]->(:SubjectMatterExpert|:Brand)
(:LinkedInPost)-[:USES_SOURCE]->(:SourceMaterial|:Quote|:OriginalResearch|:CaseStudy)
(:LinkedInPost)-[:AMPLIFIES]->(:Page|:NoteArticle|:CaseStudy|:Asset|:ThoughtLeadership)
(:LinkedInPost)-[:EXPRESSES]->(:PointOfView)
(:LinkedInPost)-[:BUILDS_ASSOCIATION]->(:BrandAssociation)
(:LinkedInPost)-[:TARGETS]->(:CategoryEntryPoint|:BuyingRole|:InternalInfluencer)
(:LinkedInPost)-[:LINKS_TO]->(:Page|:Offer|:Service|:NoteArticle)
(:LinkedInPost)-[:HAS_UTM]->(:UTMTag {source: 'linkedin', medium: 'social'})
(:UTMTag)-[:ATTRIBUTES_TO]->(:Initiative|:Campaign|:EditorialPillar|:CategoryEntryPoint)

(:SubjectMatterExpert)-[:CONTRIBUTES_TO]->(:SourceMaterial|:Interview|:ThoughtLeadership|:OriginalResearch)
(:ThoughtLeadership)-[:EXPRESSES]->(:PointOfView)
(:ThoughtLeadership)-[:CHALLENGES]->(:Objection|:Assumption|:ContentRisk)
(:ThoughtLeadership)-[:INFLUENCES]->(:BuyingRole|:InternalInfluencer|:Persona)
(:ThoughtLeadership)-[:BUILDS_AUTHORITY]->(:BrandAuthoritySignal)
(:OriginalResearch)-[:PRODUCES]->(:ResearchFinding)
(:ResearchFinding)-[:SUPPORTS]->(:PointOfView|:ReasonToBelieve|:BrandAssociation)
(:TrustSignal)-[:REDUCES]->(:Objection|:ReputationRisk)
```

見ること:

- 記事群がBeekleのどのブランド連想を育てているか。
- 重点CEPに対して、機能価値だけでなく不安低減や評判リスク回避まで説明できているか。
- 専門家や現場の知見が、記事、登壇、資料、SNS断片に変換されているか。
- Thought leadershipが単なるノウハウ記事ではなく、BeekleのPointOfViewを作っているか。
- Hidden buyer向けの根拠があるか。例: 法務/情シス向けのセキュリティ説明、経理/役員向けの投資判断材料。
- 配信面まで含めて計画されているか。記事を書いて終わりではなく、メール、LinkedIn、営業資料、ウェビナーに再利用されているか。
- note記事の末尾にBeekleへの送客リンクがあり、`utm_source=note&utm_medium=article&utm_campaign=...` が付いているか。
- LinkedIn投稿からBeekleへ送客する場合、`utm_source=linkedin&utm_medium=social&utm_campaign=...` が付いているか。
- LinkedInを単なる拡散先にせず、誰の署名性で、どのCEP/hidden buyerに届かせる投稿かが決まっているか。
- note/LinkedInの反応数で満足せず、最終的に `ContactConversion` に接続しているか。

Beekleで最初に持つブランド連想候補:

- AI受託開発を、業務課題から小さく検証して本番化する会社。
- RAG/GraphRAG/AIエージェントを、流行語ではなく業務導線とデータ構造から設計する会社。
- 要件定義、PoC、運用改善まで、技術とマーケティングの両方で見る会社。
- ローカル/Docker/既存APIを活かし、過剰なSaaS費用をかけずに検証環境を作る会社。
- 正確性、セキュリティ、運用負荷、社内説明まで含めてAI導入を進める会社。

初期の編集柱候補:

- AI導入の意思決定と稟議。
- RAG/GraphRAG/AIエージェントの業務実装。
- LLMO/SEO/コンテンツマーケティングの計測と改善。
- ローカルAI分析基盤、Neo4j、データ蓄積。
- 事例から学ぶ、小さく作って検証する進め方。

### 7. CTAとオファー

```text
(:CTA)-[:PROMOTES]->(:Offer)
(:Offer)-[:SOLVES]->(:Problem)
(:Offer)-[:FITS_PERSONA]->(:Persona)
(:Offer)-[:FITS_STAGE]->(:JourneyStage)
(:Offer)-[:HANDLES_OBJECTION]->(:Objection)
(:Offer)-[:PROVES_WITH]->(:ProofPoint)
(:CTA)-[:EXPECTS_INTENT]->(:Intent)
(:CTA)-[:HAS_GA4_EVENT_METRIC {
  eventCount
}]->(:Snapshot)
```

見ること:

- CTAが本文のProblemを解決するOfferに接続しているか。
- 情報収集段階の記事に、いきなり重い問い合わせCTAだけを出していないか。
- 費用不安の記事に、費用・見積もり整理のCTAが出ているか。
- B向け協業CTAがA向け本文に混ざっていないか。
- CTAクリックはあるのにお問い合わせにならないOfferはどれか。

### 8. お問い合わせCVと導線

```text
(:BeekleCRM)-[:PRODUCED]->(:Snapshot)
(:CRMRecord)-[:SYNCED_FROM]->(:BeekleCRM)
(:CRMRecord)-[:OBSERVED_IN]->(:Snapshot)
(:ContactConversion)-[:FROM_CRM_RECORD]->(:CRMRecord)
(:ContactConversion)-[:RECORDED_IN]->(:BeekleCRM)
(:ContactConversion)-[:LANDED_ON]->(:Page)
(:ContactConversion)-[:CONVERTED_VIA]->(:CTA)
(:ContactConversion)-[:INTERESTED_IN]->(:Offer)
(:ContactConversion)-[:ATTRIBUTED_TO]->(:Channel|:DistributionChannel|:UTMTag)
(:ContactConversion)-[:REFERRED_BY]->(:Referrer)
(:ContactConversion)-[:MATCHES_PERSONA]->(:Persona)
(:ContactConversion)-[:MATCHES_CEP]->(:CategoryEntryPoint)
(:ContactConversion)-[:HAS_CRM_STATUS]->(:CRMStatus)
(:ContactConversion)-[:HAS_QUALITY]->(:LeadQuality)
(:Lead)-[:REPRESENTS]->(:ContactConversion)
```

注意:

- お問い合わせCVの正本は beekle-crm。
- Neo4jには個人情報を入れない。メール、電話、個人名、問い合わせ本文のrawは持たない。
- 会社名も必要なら匿名化またはhash化する。
- GA4の `form_submit` はスパム込みなので、実お問い合わせは beekle-crm または `docs/marketing/data/leads/leads.jsonl` を正とする。
- MCPでbeekle-crmを見られる場合でも、Neo4jに保存するのは `crmRecordIdHash`, `receivedAt`, `landingPage`, `utm`, `status`, `quality`, `sourceSnapshotId` 程度にする。
- 受注率や受注単価は、初期KPIではなくCRM側の補助文脈として参照する。

見ること:

- どのクラスタ/ページ/CTAが実お問い合わせに繋がったか。
- note/LinkedIn/検索/AI流入のどれが、お問い合わせCVに接続しているか。
- UTMがある外部発信と、実お問い合わせのlanding page/source/campaignがつながっているか。
- AI流入のlast-touchがDirectに化けていないか。
- お問い合わせが生まれた本文MessageやOfferは何か。
- スパムを生む導線やreferrerはどれか。

### 9. 施策と履歴

```text
(:Initiative)-[:TESTS]->(:Hypothesis)
(:Initiative)-[:TARGETS]->(:Cluster|:Page|:Offer|:Persona|:Problem)
(:Initiative)-[:CHANGED]->(:Page|:CTA|:Offer|:Section)
(:Initiative)-[:EXPECTED_TO_MOVE]->(:Metric)
(:Initiative)-[:HAS_CHANGESET]->(:ChangeSet)
(:Campaign)-[:IMPLEMENTS]->(:Initiative)
(:Campaign)-[:USES_CHANNEL]->(:DistributionChannel)
(:Campaign)-[:HAS_UTM]->(:UTMTag)
(:Campaign)-[:PROMOTES]->(:Page|:Offer|:Service|:NoteArticle)
(:Campaign)-[:TARGETS_CEP]->(:CategoryEntryPoint)
(:ChangeSet)-[:CREATED_VERSION]->(:ContentVersion)
(:ChangeSet)-[:CHANGED_SECTION {changeType, beforeHash, afterHash}]->(:Section)
(:ChangeSet)-[:CHANGED_CTA {beforeHref, afterHref, beforeCopy, afterCopy}]->(:CTA)
(:Decision)-[:JUSTIFIES]->(:Initiative)
(:Experiment)-[:COMPARES]->(:Snapshot)
```

見ること:

- 何を変えたから、どの指標が動いたか。
- どの `utm_campaign` が、どの施策/記事/外部発信/CTAに紐づくか。
- 同日に複数施策を入れて効果分離不能になっていないか。
- 施策仮説がGSC/Clarity/GA4/ContactConversionのどの指標で検証されるか。
- 成功した施策パターンを別クラスタへ横展開できるか。

### 10. 競合・代替

```text
(:Page)-[:MENTIONS_COMPETITOR]->(:CompetitorDomain|:Entity)
(:Offer)-[:ALTERNATIVE_TO]->(:Entity)
(:Message)-[:DIFFERENTIATES_FROM]->(:Entity)
(:AIQuery)-[:ALSO_CITES]->(:CompetitorDomain)
(:SearchQuery)-[:SERP_COMPETES_WITH]->(:CompetitorDomain)
```

見ること:

- AI回答内でどの競合と並んでいるか。
- 自社の差別化Messageが本文にあるか。
- 比較記事が自社Offerに自然に接続しているか。
- 自社開発、SaaS、受託、コンサルなど代替選択肢との位置づけが明確か。

### 11. 証拠・信頼

```text
(:Claim)-[:SUPPORTED_BY]->(:ProofPoint)
(:ProofPoint)-[:SOURCE_IS]->(:Asset|:Page|:Entity)
(:ProofPoint)-[:PROVES]->(:Benefit)
(:ProofPoint)-[:REDUCES]->(:Objection)
(:Service)-[:HAS_PROOF]->(:ProofPoint)
```

見ること:

- 強い主張に根拠があるか。
- 事例、数字、デモ、実装経験がどのOfferを支えているか。
- AI引用されやすいFAQや比較表に根拠が足りているか。
- 古い根拠や日付依存の記述が残っていないか。

### 12. コンテンツ品質

```text
(:Page)-[:HAS_GAP]->(:ContentGap)
(:Page)-[:HAS_RISK]->(:ContentRisk)
(:Page)-[:NEEDS_UPDATE_FOR]->(:Topic|:Entity|:Problem)
(:Page)-[:DUPLICATES_INTENT_WITH]->(:Page)
(:Page)-[:CANNIBALIZES_WITH]->(:Page)
(:Page)-[:ORPHANED_FROM]->(:Cluster)
```

`ContentGap.type` の例:

- `persona_mismatch`
- `stage_mismatch`
- `problem_offer_mismatch`
- `proof_gap`
- `cep_kbf_rtb_gap`
- `first_party_evidence_gap`
- `brand_association_gap`
- `hidden_buyer_gap`
- `expert_participation_gap`
- `cta_gap`
- `internal_link_gap`
- `query_page_mismatch`
- `ai_citation_no_conversion_path`
- `external_utm_gap`
- `crm_attribution_gap`
- `content_decay`
- `cannibalization`
- `measurement_gap`

この層はAIエージェントの出力先として重要。検出した問題をノード化しておくと、修正済み/未修正を追える。

## AIエージェントに検出させたいズレ

### Persona Mismatch

```text
本文: A1 事業部担当者向け
CTA: B 同業協業向け
=> persona_mismatch
```

見る関係:

```text
Page/Section -> Message -> Persona
CTA -> Offer -> Persona
```

### Stage Mismatch

```text
本文: 情報収集段階
CTA: いきなり本開発相談
=> stage_mismatch
```

見る関係:

```text
Message -> JourneyStage
CTA -> Offer -> JourneyStage
```

### Problem Offer Mismatch

```text
本文: 費用不安
CTA: 技術相談だけ
=> problem_offer_mismatch
```

見る関係:

```text
Message -> Problem
Offer -> SOLVES -> Problem
```

### Proof Gap

```text
本文: 効果が高いと主張
根拠: 事例/数字/デモなし
=> proof_gap
```

見る関係:

```text
Section -> Claim -> ProofPoint
```

### CEP KBF RTB Gap

```text
CEP: AI受託開発会社を比較したい
KBF: セキュリティと実装後の運用
RTB: 事例/方法論/制約条件の説明なし
=> cep_kbf_rtb_gap
```

見る関係:

```text
CategoryEntryPoint -> KeyBuyingFactor -> ReasonToBelieve
ReasonToBelieve -> ProofPoint|CaseStudy|Quote|ExternalSource
Page/Section -> Message -> KeyBuyingFactor
```

### First Party Evidence Gap

```text
記事: 一般的なLLMO解説だけ
一次情報: インタビュー、案件知見、Beekleの判断基準が未接続
=> first_party_evidence_gap
```

見る関係:

```text
ContentBrief -> USES_SOURCE -> SourceMaterial|Transcript|Quote|CaseStudy|Project
ArticleDraft -> USES_RTB -> ReasonToBelieve
CompanyStrength -> PROVEN_BY -> Quote|CaseStudy|Outcome
```

### Brand Association Gap

```text
記事: 流入は取れている
ブランド連想: Beekleが何者として記憶/推奨されたいかに未接続
=> brand_association_gap
```

見る関係:

```text
ContentBrief -> BELONGS_TO_PILLAR -> EditorialPillar
EditorialPillar -> BUILDS_ASSOCIATION -> BrandAssociation
BrandAssociation -> LINKS_TO_CEP|LINKS_TO_VALUE|PROVEN_BY
```

### Hidden Buyer Gap

```text
記事: 事業部担当者には刺さる
hidden buyer: 情シス/法務/経理/役員の不安や判断材料がない
=> hidden_buyer_gap
```

見る関係:

```text
ContentMission -> SERVES -> InternalInfluencer|BuyingRole
ThoughtLeadership -> INFLUENCES -> InternalInfluencer
TrustSignal -> REDUCES -> Objection|ReputationRisk
```

### Expert Participation Gap

```text
Thought leadershipを名乗っている
社内専門家のSourceMaterialやOriginalResearchがない
=> expert_participation_gap
```

見る関係:

```text
SubjectMatterExpert -> CONTRIBUTES_TO -> SourceMaterial|ThoughtLeadership|OriginalResearch
ThoughtLeadership -> EXPRESSES -> PointOfView
OriginalResearch -> PRODUCES -> ResearchFinding
```

### Demand Content Mismatch

```text
GSC query: AI受託開発会社
Ranking page: 開発フロー解説
=> buyer query を情報記事が誤catch
```

見る関係:

```text
SearchQuery -> Intent/Problem
SearchQuery -> RANKS_PAGE -> Page
Page -> Message/Offer
```

### AI Citation Conversion Gap

```text
AIQueryで引用されている
ページに商用CTAまたは関連LPへの導線が弱い
=> ai_citation_no_conversion_path
```

見る関係:

```text
AIQuery -> CITES -> Page
Page -> HAS_CTA -> CTA -> Offer
```

### External UTM Gap

```text
note/LinkedInからBeekleへ送客している
でもUTMがない、またはsource/medium/campaignが揃っていない
=> external_utm_gap
```

見る関係:

```text
NoteArticle|LinkedInPost -> LINKS_TO -> Page|Offer|Service
NoteArticle|LinkedInPost -> HAS_UTM -> UTMTag
UTMTag -> ATTRIBUTES_TO -> Campaign|Initiative|EditorialPillar|CategoryEntryPoint
```

判定:

- noteのBeekle送客は `utm_source=note&utm_medium=article&utm_campaign=...` が必須。
- LinkedIn通常投稿のBeekle送客は `utm_source=linkedin&utm_medium=social&utm_campaign=...` が必須。
- LinkedIn広告は `utm_medium=paid_social` にする。
- `utm_campaign` が後で読んでも何の施策か分からない場合もギャップ扱いにする。

### CRM Attribution Gap

```text
お問い合わせは発生している
でもlanding page、CTA、UTM、referrer、campaignのどれにも接続できない
=> crm_attribution_gap
```

見る関係:

```text
ContactConversion -> FROM_CRM_RECORD -> CRMRecord
ContactConversion -> LANDED_ON -> Page
ContactConversion -> CONVERTED_VIA -> CTA
ContactConversion -> ATTRIBUTED_TO -> UTMTag|Channel|DistributionChannel
ContactConversion -> REFERRED_BY -> Referrer
```

判定:

- beekle-crm上のお問い合わせが、Neo4j上でlanding pageに接続していない。
- UTMつき流入があるのに、CRM側のCVにcampaign/sourceが残っていない。
- CTAクリックはあるのに、お問い合わせCVと同じ導線として接続できない。
- note/LinkedInの送客があるのに、お問い合わせCV側ではDirect扱いになっている。

### Cluster Gap

```text
要件定義クラスタは流入が強い
でもRFP/相談/資料DLの受け皿が弱い
=> cluster_offer_gap
```

見る関係:

```text
Cluster -> HAS_MEMBER -> Page
Cluster -> PROMOTES -> Offer
Page -> HAS_CTA -> CTA
ContactConversion -> LANDED_ON -> Page
```

### Cannibalization

```text
同じQueryClusterに対して複数Pageが順位を奪い合う
=> cannibalization
```

見る関係:

```text
SearchQuery -> RANKS_PAGE -> Page
SearchQuery -> BELONGS_TO -> Cluster
```

### Internal Link Gap

```text
AI引用ページから商用LPへ内部リンクがない
クラスタ内の支援記事からピラーへ戻れない
=> internal_link_gap
```

見る関係:

```text
Page -> INTERNAL_LINKS_TO -> Page
Cluster -> HAS_PILLAR / HAS_SUPPORTING_PAGE
```

### Measurement Gap

```text
CTAがあるが data-cta-source がない
施策を入れたが ChangeSet/Initiative がない
=> measurement_gap
```

見る関係:

```text
Page -> HAS_CTA -> CTA
Initiative -> CHANGED -> Page
Page/CTA -> metric relationships -> Snapshot
```

## MVPで入れるもの

最初の実装では、ノードを増やしすぎない。

### MVP Labels

```text
Page
ContentVersion
Section
CTA
Offer
Service
TitleMeta
StructuredData
ContentMission
EditorialPillar
ContentPurpose
DistributionChannel
ExternalPublishedContent
NoteArticle
LinkedInPost
UTMTag
Annotation
Persona
BuyingRole
InternalInfluencer
JourneyStage
Intent
Problem
Topic
AudienceNeed
CategoryEntryPoint
Constraint
DesiredOutcome
KeyBuyingFactor
ValueElement
ReasonToBelieve
Brand
BrandAssociation
BrandPositioning
BrandPromise
BrandVoice
CompanyStrength
Principle
PointOfView
SubjectMatterExpert
ThoughtLeadership
SourceMaterial
Interview
Transcript
Quote
CaseStudy
ContentBrief
ClusterSet
Cluster
SearchQuery
AIQuery
PromptSet
PromptTemplate
PromptRun
AIAnswer
ReferenceSurface
ExternalSource
Channel
Referrer
Snapshot
BeekleCRM
CRMRecord
ContactConversion
Lead
Initiative
Campaign
ChangeSet
ContentGap
```

### MVP Relationships

```text
Page HAS_VERSION ContentVersion
Page CURRENT_VERSION ContentVersion
ContentVersion HAS_SECTION Section
Page HAS_CTA CTA
CTA PROMOTES Offer
CTA LINKS_TO Page
Page HAS_TITLE_META TitleMeta
Page HAS_STRUCTURED_DATA StructuredData
Page INTERNAL_LINKS_TO Page
Section HAS_ANNOTATION Annotation
Annotation REFERS_TO Persona|Problem|Topic|Intent|JourneyStage
Brand WANTS_ASSOCIATION BrandAssociation
Brand HAS_PROMISE BrandPromise
Brand USES_VOICE BrandVoice
BrandAssociation LINKS_TO_CEP CategoryEntryPoint
BrandAssociation LINKS_TO_VALUE ValueElement
BrandAssociation PROVEN_BY ReasonToBelieve|CaseStudy|Quote
ContentMission HAS_PILLAR EditorialPillar
ContentMission SERVES Persona|BuyingRole|InternalInfluencer
ContentMission ADDRESSES_NEED AudienceNeed
EditorialPillar TARGETS_CEP CategoryEntryPoint
EditorialPillar BUILDS_ASSOCIATION BrandAssociation
ContentBrief BELONGS_TO_PILLAR EditorialPillar
ContentBrief HAS_PURPOSE ContentPurpose
ContentBrief PLANNED_FOR DistributionChannel
ExternalPublishedContent PUBLISHED_ON DistributionChannel
NoteArticle IS_A ExternalPublishedContent
NoteArticle LINKS_TO Page|Offer|Service
NoteArticle HAS_UTM UTMTag
LinkedInPost IS_A ExternalPublishedContent
LinkedInPost AUTHORED_BY SubjectMatterExpert|Brand
LinkedInPost AMPLIFIES Page|NoteArticle|CaseStudy|ThoughtLeadership
LinkedInPost TARGETS CategoryEntryPoint|BuyingRole|InternalInfluencer
LinkedInPost LINKS_TO Page|Offer|Service|NoteArticle
LinkedInPost HAS_UTM UTMTag
UTMTag ATTRIBUTES_TO Campaign|Initiative|EditorialPillar|CategoryEntryPoint
SubjectMatterExpert CONTRIBUTES_TO SourceMaterial|ThoughtLeadership
ThoughtLeadership EXPRESSES PointOfView
CategoryEntryPoint EXPRESSED_AS SearchQuery|AIQuery
CategoryEntryPoint OCCURS_FOR Persona
CategoryEntryPoint HAS_CONSTRAINT Constraint
CategoryEntryPoint WANTS_OUTCOME DesiredOutcome
KeyBuyingFactor IMPORTANT_FOR CategoryEntryPoint
KeyBuyingFactor SUPPORTED_BY ReasonToBelieve
ReasonToBelieve BACKED_BY Quote|CaseStudy|Page
CompanyStrength PROVEN_BY ReasonToBelieve|CaseStudy|Quote
Principle GUIDES ContentBrief
Interview HAS_TRANSCRIPT Transcript
Transcript HAS_ANNOTATION Annotation
Quote EVIDENCES ReasonToBelieve|Problem|CompanyStrength
CaseStudy SUPPORTS ReasonToBelieve|CompanyStrength|KeyBuyingFactor
ContentBrief TARGETS_CEP CategoryEntryPoint
ContentBrief TARGETS_KBF KeyBuyingFactor
ContentBrief USES_RTB ReasonToBelieve
ContentBrief USES_SOURCE SourceMaterial|Transcript|Quote|CaseStudy
PromptSet COVERS_CEP CategoryEntryPoint
PromptSet HAS_TEMPLATE PromptTemplate
AIQuery INSTANCE_OF PromptTemplate
PromptRun RUNS AIQuery
PromptRun PRODUCED AIAnswer
AIAnswer EVALUATES_WITH KeyBuyingFactor
AIAnswer CITES Page|ExternalSource
ReferenceSurface CONTAINS Page|ExternalSource
ClusterSet HAS_CLUSTER Cluster
Cluster HAS_MEMBER Page|SearchQuery|AIQuery
SearchQuery RANKS_PAGE Page
AIQuery CITES Page
Page HAS_GSC_PAGE_METRIC Snapshot
Page HAS_GA4_PAGE_METRIC Snapshot
Page HAS_CLARITY_CITATION_METRIC Snapshot
CTA HAS_GA4_EVENT_METRIC Snapshot
BeekleCRM PRODUCED Snapshot
CRMRecord SYNCED_FROM BeekleCRM
ContactConversion FROM_CRM_RECORD CRMRecord
ContactConversion RECORDED_IN BeekleCRM
ContactConversion LANDED_ON Page
ContactConversion CONVERTED_VIA CTA
ContactConversion ATTRIBUTED_TO UTMTag|Channel|DistributionChannel
ContactConversion MATCHES_CEP CategoryEntryPoint
Lead REPRESENTS ContactConversion
Initiative CHANGED Page|CTA|Offer
Campaign IMPLEMENTS Initiative
Campaign HAS_UTM UTMTag
Campaign PROMOTES Page|Offer|Service|NoteArticle
ChangeSet CREATED_VERSION ContentVersion
Page HAS_GAP ContentGap
```

これだけで、以下の質問に答えられる。

- AI引用されているのに、CTAが弱いページはどれか。
- 要件定義クラスタは誰向けで、どのOfferへ送っているか。
- GSCで強いページと、お問い合わせCVが出たページはつながっているか。
- 施策投入後に、対象ページのGSC/GA4/Clarityがどう変わったか。
- 本文の課題とCTAの約束がズレているページはどれか。
- 重点CEPごとにKBFとRTBがあり、記事が一次情報を使って書ける状態か。
- 事例・インタビュー・自社の強みが、どの記事/CTA/Offerの根拠になっているか。
- note/LinkedInからの送客がUTM付きで、お問い合わせCVに接続しているか。
- beekle-crmのお問い合わせ数をNorth Star KPIとして、施策前後で見られるか。

## 後回しでよいもの

以下は最初から入れなくてよい。

- 個別セッション単位の行動ログ
- GA4の全イベント明細
- SERPの全競合ドメイン履歴
- すべてのParagraphノード
- 詳細なA/Bテスト基盤
- 完全なMMM投入データ
- 細かいクラスタ種別の固定ラベル化

必要になったら増やす。最初は「Page、Section、CTA、Annotation、Cluster、Query、Snapshot、Initiative」に加えて、「CategoryEntryPoint、KeyBuyingFactor、ReasonToBelieve、SourceMaterial、ContentBrief」の関係が動けば十分。

## 安定ID

Neo4jに入れるIDは後で再インポートしても揺れないようにする。

```text
Page.id = normalized path
ContentVersion.id = pageId + ':' + contentHash
Section.id = contentVersionId + ':s' + order + ':' + headingHash
CTA.id = pageId + ':' + source + ':' + ctaId + ':' + hrefHash
Annotation.id = targetId + ':' + type + ':' + valueHash + ':' + promptVersion
Brand.id = 'brand:' + slug(name)
BrandAssociation.id = 'brand-association:' + slug(name)
BrandPositioning.id = 'brand-positioning:' + date + ':' + slug(name)
BrandPromise.id = 'brand-promise:' + slug(name)
BrandVoice.id = 'brand-voice:' + slug(name)
ContentMission.id = 'content-mission:' + date + ':' + slug(name)
EditorialPillar.id = 'editorial-pillar:' + slug(name)
ContentPurpose.id = 'content-purpose:' + slug(name)
DistributionChannel.id = 'channel:' + slug(name)
ExternalPublishedContent.id = sourceType + ':' + normalized externalUrl
NoteArticle.id = 'note:' + normalized noteUrl
LinkedInPost.id = 'linkedin:' + postUrnOrUrlHash
UTMTag.id = 'utm:' + source + ':' + medium + ':' + campaign + ':' + content + ':' + term
ValueElement.id = 'value-element:' + slug(name)
PointOfView.id = 'pov:' + slug(name) + ':' + sourceHash
SubjectMatterExpert.id = 'sme:' + role + ':' + nameOrHash
ThoughtLeadership.id = 'thought:' + sourceType + ':' + sourceHash
ClusterSet.id = date + ':' + method
Cluster.id = clusterSetId + ':' + type + ':' + slug(name)
SearchQuery.id = 'search:' + normalized query
AIQuery.id = 'ai:' + normalized query
CategoryEntryPoint.id = 'cep:' + slug(name) + ':' + status
KeyBuyingFactor.id = 'kbf:' + slug(name)
ReasonToBelieve.id = 'rtb:' + slug(name) + ':' + sourceHash
SourceMaterial.id = sourceType + ':' + sourceDate + ':' + sourceHash
Interview.id = 'interview:' + sourceDate + ':' + participantHash
Transcript.id = interviewId + ':' + transcriptHash
Quote.id = transcriptId + ':q:' + quoteHash
CaseStudy.id = 'case:' + slug(projectName) + ':' + sourceHash
ContentBrief.id = 'brief:' + date + ':' + slug(title)
PromptSet.id = 'promptset:' + date + ':' + slug(name)
PromptTemplate.id = promptSetId + ':template:' + slug(name)
PromptRun.id = promptTemplateId + ':' + platform + ':' + runAt
AIAnswer.id = promptRunId + ':' + answerHash
ReferenceSurface.id = 'surface:' + sourceType + ':' + hash(normalizedQueryOrUrl)
ExternalSource.id = normalized url
Channel.id = 'traffic-channel:' + slug(name)
Referrer.id = 'referrer:' + normalized domain
Snapshot.id = source + ':' + rangeStart + ':' + rangeEnd + ':' + importedAtDate
BeekleCRM.id = 'beekle-crm'
CRMRecord.id = 'crm-record:' + crmRecordIdHash
ContactConversion.id = 'contact-cv:' + crmRecordIdHash
Lead.id = existing lead id from leads.jsonl
Initiative.id = date + ':' + slug(name)
Campaign.id = 'campaign:' + slug(utmCampaignOrName)
```

## 制約

```cypher
CREATE CONSTRAINT page_id IF NOT EXISTS
FOR (n:Page) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT content_version_id IF NOT EXISTS
FOR (n:ContentVersion) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT section_id IF NOT EXISTS
FOR (n:Section) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT cta_id IF NOT EXISTS
FOR (n:CTA) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT annotation_id IF NOT EXISTS
FOR (n:Annotation) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT brand_id IF NOT EXISTS
FOR (n:Brand) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT brand_association_id IF NOT EXISTS
FOR (n:BrandAssociation) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT brand_positioning_id IF NOT EXISTS
FOR (n:BrandPositioning) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT brand_promise_id IF NOT EXISTS
FOR (n:BrandPromise) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT brand_voice_id IF NOT EXISTS
FOR (n:BrandVoice) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT content_mission_id IF NOT EXISTS
FOR (n:ContentMission) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT editorial_pillar_id IF NOT EXISTS
FOR (n:EditorialPillar) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT content_purpose_id IF NOT EXISTS
FOR (n:ContentPurpose) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT distribution_channel_id IF NOT EXISTS
FOR (n:DistributionChannel) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT external_published_content_id IF NOT EXISTS
FOR (n:ExternalPublishedContent) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT note_article_id IF NOT EXISTS
FOR (n:NoteArticle) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT linkedin_post_id IF NOT EXISTS
FOR (n:LinkedInPost) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT utm_tag_id IF NOT EXISTS
FOR (n:UTMTag) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT value_element_id IF NOT EXISTS
FOR (n:ValueElement) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT pov_id IF NOT EXISTS
FOR (n:PointOfView) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT sme_id IF NOT EXISTS
FOR (n:SubjectMatterExpert) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT thought_leadership_id IF NOT EXISTS
FOR (n:ThoughtLeadership) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT cluster_id IF NOT EXISTS
FOR (n:Cluster) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT query_id IF NOT EXISTS
FOR (n:SearchQuery) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT ai_query_id IF NOT EXISTS
FOR (n:AIQuery) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT cep_id IF NOT EXISTS
FOR (n:CategoryEntryPoint) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT kbf_id IF NOT EXISTS
FOR (n:KeyBuyingFactor) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT rtb_id IF NOT EXISTS
FOR (n:ReasonToBelieve) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT source_material_id IF NOT EXISTS
FOR (n:SourceMaterial) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT interview_id IF NOT EXISTS
FOR (n:Interview) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT transcript_id IF NOT EXISTS
FOR (n:Transcript) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT quote_id IF NOT EXISTS
FOR (n:Quote) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT case_study_id IF NOT EXISTS
FOR (n:CaseStudy) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT content_brief_id IF NOT EXISTS
FOR (n:ContentBrief) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT prompt_set_id IF NOT EXISTS
FOR (n:PromptSet) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT prompt_run_id IF NOT EXISTS
FOR (n:PromptRun) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT prompt_template_id IF NOT EXISTS
FOR (n:PromptTemplate) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT ai_answer_id IF NOT EXISTS
FOR (n:AIAnswer) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT external_source_id IF NOT EXISTS
FOR (n:ExternalSource) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT reference_surface_id IF NOT EXISTS
FOR (n:ReferenceSurface) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT channel_id IF NOT EXISTS
FOR (n:Channel) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT referrer_id IF NOT EXISTS
FOR (n:Referrer) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT snapshot_id IF NOT EXISTS
FOR (n:Snapshot) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT beekle_crm_id IF NOT EXISTS
FOR (n:BeekleCRM) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT crm_record_id IF NOT EXISTS
FOR (n:CRMRecord) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT contact_conversion_id IF NOT EXISTS
FOR (n:ContactConversion) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT lead_id IF NOT EXISTS
FOR (n:Lead) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT campaign_id IF NOT EXISTS
FOR (n:Campaign) REQUIRE n.id IS UNIQUE;
```

## 代表クエリ

### AI引用が強いのにCTAがないページ

```cypher
MATCH (q:AIQuery)-[c:CITES]->(p:Page)
WHERE c.citations >= 20
OPTIONAL MATCH (p)-[:HAS_CTA]->(cta:CTA)
WITH p, sum(c.citations) AS citations, count(cta) AS ctas
WHERE ctas = 0
RETURN p.path, citations
ORDER BY citations DESC;
```

### 本文のPersonaとCTAのOffer Personaがズレているページ

```cypher
MATCH (p:Page)-[:CURRENT_VERSION]->(:ContentVersion)-[:HAS_SECTION]->(s:Section)
MATCH (s)-[:HAS_ANNOTATION]->(:Annotation {type:'persona', status:'human_approved'})-[:REFERS_TO]->(bodyPersona:Persona)
MATCH (p)-[:HAS_CTA]->(:CTA)-[:PROMOTES]->(:Offer)-[:FITS_PERSONA]->(offerPersona:Persona)
WHERE bodyPersona.id <> offerPersona.id
RETURN p.path, collect(DISTINCT bodyPersona.name) AS bodyPersonas, collect(DISTINCT offerPersona.name) AS offerPersonas;
```

### クラスタ別のAI引用とお問い合わせCV

```cypher
MATCH (cluster:Cluster {type:'content'})-[:HAS_MEMBER]->(p:Page)
OPTIONAL MATCH (:AIQuery)-[c:CITES]->(p)
OPTIONAL MATCH (cv:ContactConversion)-[:LANDED_ON]->(p)
RETURN
  cluster.name AS cluster,
  sum(coalesce(c.citations, 0)) AS aiCitations,
  count(DISTINCT cv) AS contactConversions
ORDER BY aiCitations DESC;
```

### 施策後の対象ページ指標

```cypher
MATCH (i:Initiative)-[:CHANGED]->(p:Page)
MATCH (p)-[m:HAS_GSC_PAGE_METRIC]->(s:Snapshot)
WHERE i.id = $initiativeId
RETURN p.path, s.rangeStart, s.rangeEnd, m.clicks, m.impressions, m.ctr, m.position
ORDER BY p.path, s.rangeEnd;
```

### 重点CEPなのにRTBが足りない

```cypher
MATCH (cep:CategoryEntryPoint)-[priority:PRIORITIZED_BY]->(:Cluster)
WHERE priority.businessImpact >= 4
OPTIONAL MATCH (kbf:KeyBuyingFactor)-[:IMPORTANT_FOR]->(cep)
OPTIONAL MATCH (kbf)-[:SUPPORTED_BY]->(rtb:ReasonToBelieve)
WITH cep, count(DISTINCT kbf) AS kbfs, count(DISTINCT rtb) AS rtbs
WHERE kbfs = 0 OR rtbs = 0
RETURN cep.name, cep.status, kbfs, rtbs
ORDER BY cep.status, cep.name;
```

### 記事ブリーフが一次情報なしで作られている

```cypher
MATCH (brief:ContentBrief)
OPTIONAL MATCH (brief)-[:USES_SOURCE]->(source:SourceMaterial|Transcript|Quote|CaseStudy)
WITH brief, count(source) AS sources
WHERE sources = 0
RETURN brief.title, brief.status, brief.createdAt
ORDER BY brief.createdAt DESC;
```

### 自社の強みがどの記事の根拠にもなっていない

```cypher
MATCH (strength:CompanyStrength)
OPTIONAL MATCH (strength)-[:PROVEN_BY]->(rtb:ReasonToBelieve)<-[:USES_RTB]-(brief:ContentBrief)
WITH strength, count(DISTINCT brief) AS briefs
WHERE briefs = 0
RETURN strength.name, strength.summary
ORDER BY strength.name;
```

### ブランド連想に接続していない記事ブリーフ

```cypher
MATCH (brief:ContentBrief)
OPTIONAL MATCH (brief)-[:BELONGS_TO_PILLAR]->(:EditorialPillar)-[:BUILDS_ASSOCIATION]->(association:BrandAssociation)
WITH brief, count(DISTINCT association) AS associations
WHERE associations = 0
RETURN brief.title, brief.status, brief.createdAt
ORDER BY brief.createdAt DESC;
```

### hidden buyer向けの根拠がないCEP

```cypher
MATCH (cep:CategoryEntryPoint)<-[:TARGETS_CEP]-(pillar:EditorialPillar)
OPTIONAL MATCH (pillar)<-[:HAS_PILLAR]-(:ContentMission)-[:SERVES]->(role:InternalInfluencer)
OPTIONAL MATCH (role)<-[:INFLUENCES]-(tl:ThoughtLeadership)
WITH cep, collect(DISTINCT role.name) AS hiddenRoles, count(DISTINCT tl) AS thoughtPieces
WHERE size(hiddenRoles) = 0 OR thoughtPieces = 0
RETURN cep.name, hiddenRoles, thoughtPieces
ORDER BY cep.name;
```

### Thought leadershipに専門家参加がない

```cypher
MATCH (tl:ThoughtLeadership)
OPTIONAL MATCH (expert:SubjectMatterExpert)-[:CONTRIBUTES_TO]->(tl)
WITH tl, count(expert) AS experts
WHERE experts = 0
RETURN tl.title, tl.sourceType, tl.createdAt
ORDER BY tl.createdAt DESC;
```

### お問い合わせCVを生んだページ/CTA/媒体

```cypher
MATCH (cv:ContactConversion)
OPTIONAL MATCH (cv)-[:LANDED_ON]->(p:Page)
OPTIONAL MATCH (cv)-[:CONVERTED_VIA]->(cta:CTA)
OPTIONAL MATCH (cv)-[:ATTRIBUTED_TO]->(utm:UTMTag)
OPTIONAL MATCH (cv)-[:REFERRED_BY]->(ref:Referrer)
RETURN
  coalesce(p.path, '(unknown)') AS landingPage,
  coalesce(cta.ctaId, '(unknown)') AS cta,
  coalesce(utm.source, ref.domain, '(unknown)') AS source,
  coalesce(utm.medium, '(unknown)') AS medium,
  coalesce(utm.campaign, '(none)') AS campaign,
  count(DISTINCT cv) AS contactConversions
ORDER BY contactConversions DESC;
```

### note/LinkedIn送客でUTMがない

```cypher
MATCH (external)-[:LINKS_TO]->(target)
WHERE (external:NoteArticle OR external:LinkedInPost)
  AND (target:Page OR target:Offer OR target:Service)
OPTIONAL MATCH (external)-[:HAS_UTM]->(utm:UTMTag)
WITH external, target, utm
WHERE
  utm IS NULL
  OR utm.source IS NULL
  OR utm.medium IS NULL
  OR utm.campaign IS NULL
  OR utm.campaign = ''
RETURN labels(external) AS externalType, external.title, target.id AS target, utm
ORDER BY external.title;
```

### CRMのお問い合わせが導線に接続できていない

```cypher
MATCH (cv:ContactConversion)-[:FROM_CRM_RECORD]->(record:CRMRecord)
OPTIONAL MATCH (cv)-[:LANDED_ON]->(p:Page)
OPTIONAL MATCH (cv)-[:CONVERTED_VIA]->(cta:CTA)
OPTIONAL MATCH (cv)-[:ATTRIBUTED_TO]->(utm:UTMTag)
WITH cv, record, p, cta, utm
WHERE p IS NULL OR cta IS NULL OR utm IS NULL
RETURN
  cv.id,
  record.id AS crmRecord,
  cv.receivedAt,
  p.path AS landingPage,
  cta.ctaId AS cta,
  utm.source AS source,
  utm.campaign AS campaign
ORDER BY cv.receivedAt DESC;
```

### 施策後にお問い合わせ数が増えたか

```cypher
MATCH (campaign:Campaign)-[:HAS_UTM]->(utm:UTMTag)
OPTIONAL MATCH (cv:ContactConversion)-[:ATTRIBUTED_TO]->(utm)
WITH campaign, utm, count(DISTINCT cv) AS contactConversions
RETURN
  campaign.name,
  utm.source,
  utm.medium,
  utm.campaign,
  contactConversions
ORDER BY contactConversions DESC;
```

## 次に作る実装

1. Neo4j Docker compose を追加する。
2. beekle-crm から `ContactConversion`, `CRMRecord`, `Snapshot` をインポートする。MCP通信が使える場合は、個人情報を保存せず参照IDと要約だけを持つ。
3. `docs/marketing/data/latest` とサイトソースから `Page`, `CTA`, `SearchQuery`, `AIQuery`, `Snapshot` を取り込む。
4. Markdown/Astro/MicroCMS本文から `ContentVersion`, `Section`, `InternalLink` を取り込む。
5. note/LinkedInの公開URL、送客リンク、UTM、配信面、投稿者を取り込む。
6. `Brand`, `BrandAssociation`, `ContentMission`, `EditorialPillar`, `BrandVoice` の初期定義を入れる。
7. インタビュー文字起こし、事例メモ、自社情報から `SourceMaterial`, `Transcript`, `Quote`, `CompanyStrength`, `Principle`, `PointOfView`, `CaseStudy` を取り込む。
8. AI抽出で `Annotation`, `CategoryEntryPoint`, `KeyBuyingFactor`, `ReasonToBelieve` 候補を作る。ただし最初は `ai_suggested` のみ。
9. 人間が承認できる簡易CLIを作る。
10. `ContentBrief` 生成CLIを作り、狙うCEP、KBF、RTB、一次情報、CTA、ブランド連想、配信面を出す。
11. `ContentGap` 検出クエリを作り、次の改善候補を出す。

## 公開記事化するときの切り口

- Looker Studioでは見えない「ページ同士の意味の関係」を管理する。
- LLMO時代は、記事単体ではなく「誰に何を伝えるコンテンツ群か」を追う必要がある。
- AI第一想起は、CEP、KBF、RTB、参照面を設計して初めて狙える。
- 一次情報を貯めるナレッジグラフがないと、記事が一般論になり、事例も自社の強みに接続しない。
- 自社ブランディングは、スローガンではなく「どのCEPで何者として記憶/推奨されるか」を設計する。
- Thought leadershipは、専門家の知見、独自調査、事例をブランド連想へ変換する仕組みとして扱う。
- GSC、GA4、Clarity AI Citations、問い合わせをグラフでつなぐ。
- 施策履歴を入れると、何を変えたから何が動いたかを後から辿れる。
- AIエージェントに「次に直すべきページ」を聞ける状態を作る。
