# コラム・ブログを書くときは cognitive-rhythm-writing スキルを必ず呼ぶ

コラム本文（MicroCMS `columns`）、`claudedocs/drafts/` のドラフト、note 等のブログ記事を新規執筆・推敲するときは、書き始める前に `Skill` ツールで `cognitive-rhythm-writing` を呼ぶ。同スキルは冒頭で `../japanese-tech-writing/SKILL.md` を読むよう指示しており、両方 `.claude/skills/` に配置済みなので相対参照はそのまま解決する。

- 対象: コラム・ブログの地の文、ドラフト、読ませることを目的とした解説文。
- 非対象: UI コピー、ボタンラベル、meta description、コミットメッセージ、社内ドキュメント。

出典は k16shikano の public gist（Unlicense＝パブリックドメイン相当なので取り込み・改変とも自由）。本文は改変せず vendor しているので、再同期は raw を取得して上書きするだけでよい。

- cognitive-rhythm-writing: https://gist.github.com/k16shikano/eb2929f13ed19c97188393d297be8432
- japanese-tech-writing: https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d

## 衝突したときの優先順位

両スキルは「Markdown で書く技術書の章」を前提にしている。Beekle のコラムは MicroCMS への HTML 入稿で、SEO/LLMO の構造要件を持つ。衝突する箇所では以下で裁定する。

### プロジェクト規約が勝つ（スキルの指示を適用しない）

- **整形全般**: japanese-tech-writing の「一文ごとに改行」「コードブロック」「脚注 `[^ラベル]`」はいずれも Markdown 記法。MicroCMS 入稿 HTML に Markdown を残さない（CLAUDE.md、[[column-writing-style]]）。`<strong>` `<h2>` `<ul>` で書く。
- **太字**: japanese-tech-writing は「初出の定義語を太字にする」と定めるが、`<strong>` の多用は禁止（[[column-writing-style]]「強調の氾濫を避ける」）。さらに `<li>`/`<p>` 冒頭の `<strong>16文字以下のラベル</strong>：` は自動で紫チップ化される（[[column-rendering]]）。定義語を機械的に太字化しない。
- **見出しと節の入り方**: FAQ ブロックの `<h2>Q. 質問文？</h2>` 形式（[[column-faq-pattern]]）と、検索クエリの表記揺れを拾う見出し（[[seo]]）は、スキルの「見出しで結論を言い切らない」「節の頭で宣言しない」より優先する。AI 検索の引用を取るための構造なので崩さない。
- **CTA マーカー**: `{{CONTACT_CTA}}` 等の位置・構造はスキルの対象外（[[microcms]]、`src/lib/column-visuals.ts`）。

### スキルが勝つ（既存規約を上書き・補強する）

- 地の文の拍、段落構成、論証の厳密さ、冗長の排除。既存規約に対応物がない領域なので、そのまま適用する。
- 「LLM っぽい表現の禁止」と「ダッシュ（——）を使わない」は [[content]] の「AIっぽい日本語チェックリスト」と同方向。判定がより細かいスキル側に従う。

## スキルは文章論であって、事実性を担保しない

cognitive-rhythm-writing は「あとで事実に裏切られる思い込みを書く」「未回収の緊張を開いておく」といった装置を推奨する。これは語り手の判断状態を書く技法であって、**存在しない案件・数値・場面を作ってよいという意味ではない**。緊張の材料は、実在する事実（[[marketing]] の実績、出典のある統計、対象そのものの性質）からしか取らない。スキル自身も「拍・緊張の材料は状況側からしか取らない。材料が見つからない位置には何も足さず平坦なまま残す」と定めており、[[marketing]] の捏造防止と矛盾しない。迷ったら平坦なまま残す。
