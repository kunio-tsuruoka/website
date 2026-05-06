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
