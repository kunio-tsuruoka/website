# SEO/CTR最適化の判断軸

## imp急増 × CTR低下フェーズの打ち手

GSCで「インプレッション急増、クリック数停滞、CTR低下」が出たら、新規記事よりも **既存上位記事のtitle/description書き換えのROIが圧倒的に高い**。新規はインデックス・上昇まで時間かかるが、title/descはMicroCMS PATCHで即時反映されSERP表示も数日内に更新される。

## title/descCTR診断のシグナル

- title末尾が「整理」「解説」「ガイド」など受け身動詞 → 結論不明でクリック誘発弱い
- descが「〜を解説します」「〜について整理しました」で終わる → SERPで答えが見えない、結論型に書き換える
- 順位7〜10位 × imp 50+ × CTR 0% は典型的なtitle/desc文言ミスマッチ。順位の問題ではない

## 表記揺れクラスタの拾い方

「要求定義 要件定義 違い」「要求 要件 違い」「要件 要求 違い」「要望と要件の違い」のように **同一意図で順序・粒度が違うクエリ群** は、合算impで価値判定する。受け皿1記事を以下の方針で強化:
1. titleに主要2〜3語を入れる（「要求」「要件」「違い」のように語順自由でマッチする並び）
2. h2/h3で表記揺れを別個に拾う（要望 vs 要件、要求整理 vs 要件定義 等を独立したFAQ h3に）
3. 短縮形（「要求 要件 違い」のような『定義』なしクエリ）にもh3で言及して内部アンカーリンクで結論セクションへ誘導

## MicroCMS PATCH で title/description/content を一括更新

`client.update({ endpoint: 'columns', contentId, content: { title, description, content }})` は1回のPATCHで全フィールド更新可。content側は `microcms.md` の「1行詰めHTMLは壊れる」ルールに従い改行入りで送る。サニタイザは block間 whitespace を trim する（送信bytes - 受信bytes ≒ 200程度の差は正常）。

## 検証手順

PATCH後は `client.get()` で fetched.content に対して以下を正規表現でアサート:
- 新規追加した h2 の id または見出し文が存在
- 既存重要セクション（「次に読むべき記事」「まとめ」など）の h2 が消えてない（サニタイザによる事故検知）

# 記事を書く前に必ず市場調査する（DataForSEO volume/intent＋rakko PAA）。マップの想定クエリは実需要と乖離する

2026-07-05ユーザー指摘「ちゃんとリサーチして市場調査してから記事を書けよ」。LLMOコンテンツマップの想定クエリだけで記事を量産したら、実検索需要と大きくズレていた。**新記事の着手前に必ず** `mcp__dataforseo__dataforseo_labs_google_keyword_overview`(language_code='ja', location_name='Japan'で volume/intent/difficulty)＋`mcp__rakko-keyword__question-search`(PAA)で検証し、実需のある頭クエリを標的に、PAAでH2/FAQを構成する。

## 2026-07-05実測(月間, ja)＝マップ検証結果
- 実需あり: **属人化 解消 880**(informational/低競合、PAA=方法/メリット/効果/事例/経理・営業・製造/AI・DXで解消)、**カスタマーサポート ai 390**(navigational、PAA=とは/メリット/事例。ただしairbnb等ブランドノイズ多くて実質は割引)、**製造業 ai 活用 170**、**aiチャットボット 比較 140**(commercial=CV近)、技能継承 90、問い合わせ 削減 50。
- **ほぼ需要なし(=書いても検索流入見込み薄)**: チャットボット 答えられない0 / FAQ 使われない0 / 営業時間外 問い合わせ0 / 適合表 管理0 / 型番管理0 / 電話 問い合わせ 削減≈0。
- 教訓: マップの「課題語」ロングテールは実ボリュームがほぼ無い。頭は「◯◯ 解消」「カスタマーサポート ai」「製造業 ai 活用」「ai 比較」等の一般語。ブランド名を含む頭語(カスタマーサポートai)はPAAにairbnb等が混じり実需が水増しされる点も確認。

## この結果での是正
- 公開済 B1(属人化)=実需要880に当たり妥当(ただし問い合わせ対応に狭く框っており、業務全般/経理/営業/製造の広い意図は取りこぼし)。B2技能継承90=中、B3チャットボット/D1製造業問い合わせ=Google需要弱(LLMO/内部リンク価値で残置)。
- 未公開ドラフト B4電話/B5FAQ/B6時間外/B7適合表=狙いクエリ0需要。**公開保留**。retarget or shelve。
- 次に書くべき(データ順): 属人化解消の広いピラー(880)、カスタマーサポートAI とは/メリット/事例(390)、aiチャットボット比較(140,CV)、製造業はai活用(170)にretarget。
- 関連: [[project_llmo_content_map]], marketing-data-hub, seo.md(頭クエリ/意図), analytics-ga4。

# サービスLP同士のカニバリと「LLMのfan-outクエリ≠実需要」（2026-07-27 実測）

LLM推奨プローブ(kb01)で不在だった `/services/rag-system-development` を「1ページ目に上げる」ために診断したら、前提が2つ崩れた。着手前に必ず同じ確認をする。

## 1. ChatGPTのfan-outクエリを実需要と取り違えない

`ai_optimization_llm_response` のレスポンスに出る `fan_out_queries`（例「社内文書 AI 横断検索 RAG 開発 会社 日本」）は**LLMが合成した検索文字列**であって、Googleの実検索需要ではない。DataForSEO で当たると `社内文書検索 ai` / `生成ai 社内文書検索` / `社内 ai 検索` / `rag 構築支援` などは**DBにデータ無し（≒0）**。GSCでも60日24impしかなかった。

実需要はこちら（ja/Japan, 2026-07-27実測）:

| クエリ | 月間 | intent | 競合 |
|---|---|---|---|
| graphrag | **1,600** | informational | LOW (KD23) |
| rag構築（スペース無し） | **720** | informational | MEDIUM |
| rag 開発 | 260 | **transactional** | MEDIUM |
| graphrag とは | 170 | informational | LOW |
| 社内ai 構築 | 110 | navigational | HIGH |
| ナレッジグラフ rag | 90 | navigational | LOW |

→ LLMO目的でも、狙う語は**実需要のある語**に置く。fan-out文字列そのものを狙わない。

## 2. サービスLP同士のキーワードカニバリを疑う

`生成ai 社内文書検索` という1クエリに対し、`/services/internal-document-ai-search`(24imp/pos20.5) と `/services/rag-system-development`(7imp/pos21.6) の**両方がインプレを取り、どちらも20位台で止まっていた**。seoTitle が両方とも「社内文書(AI)検索」で始まっていたのが原因。

サービスLPを増やしたら **`seoTitle` の主語が既存LPと被っていないか**を必ず確認する。診断は GSC の query×page で、同一クエリに複数の自社URLが出ていないかを見る。

是正: rag-system-development を `RAG構築・GraphRAG開発｜社内AI検索システムをPoCから本番運用まで` に変更（需要ゼロ語→720+1,600の語へ）。internal-document-ai-search は社内文書検索の面として据え置き。

## 3. ブリッジCTAはLLMの到達経路になる

kb02 で初めてサービスLPが引用されたとき、引用URLは
`/services/rag-system-development?intent=service-bridge&source=column-what-is-rag` だった。
**コラムに置いた `{{*_SERVICE_BRIDGE}}` 経由でクローラが到達している**ことがクエリパラメータから確認できる。

→ 高順位のコラムにブリッジが張られていないと、その資産がサービスLPに繋がらない。`graphrag`(1,600/月) で pos 9.6 を取っていた `/knowledge/graphrag-knowledge-search` にブリッジが無かったのが最大の穴だった（`scripts/insert-service-bridge.mjs` で是正）。**新しいサービスLPを作ったら、そのテーマで最上位のコラムにブリッジがあるかを必ず確認する。**
