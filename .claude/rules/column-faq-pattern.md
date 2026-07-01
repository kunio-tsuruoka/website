# Column FAQ retrofitting pattern

既存のコラム記事に FAQ ブロックを追加して `FAQPage` 構造化データを emit させる運用パターン。AI検索（ChatGPT検索・Claude・Perplexity 等）の引用率を上げる目的。

## FAQ ブロックの HTML フォーマット

`src/pages/column/[...slug].astro` の FAQ 抽出器 (`headingFaqPattern` 正規表現) が拾えるのは、以下のいずれかの形:

```html
<h2>よくある質問（FAQ）</h2>
<h2>Q. 質問文？</h2>
<p>A. 回答文...</p>
<h2>Q. 別の質問？</h2>
<p>A. 別の回答...</p>
```

- `Q\d*\.?` を許容するため、`Q. 〜` / `Q1. 〜` / `Q 〜` のいずれでも OK
- 各 Q は独立した `<h2>` で、直後の `<p>` が回答とみなされる
- 「よくある質問」見出しは optional（あった方が人間に親切）

## スクリプト

`scripts/patch-add-faq.mjs`:
- `FAQ_PATCHES` 配列に `{ slug, introHeading, faqs }` を追記
- 既定 dry-run、`--apply` 必須
- `hasExistingFaq()` で二重挿入を防ぐ（再実行しても安全）
- `insertFaqBeforeFinalCta()` で最後の `{{CONTACT_CTA}}` の直前に挿入

監査スクリプト `scripts/audit-faq.mjs` で全コラムのカバレッジを集計（`headingFaqPattern` と同じ正規表現で判定）。

## FAQ 作成の質ルール（ハルシネーション防止）

- 質問・回答は **記事本文に根拠がある内容のみ** 書く（`.claude/rules/ai-demo-infrastructure.md` の hallucination 対策と同じ思想）
- 略語の正式名称・英訳は記事に明示されている場合のみ書く
- 各 Q に既存コラム／ツールへの **内部リンクを 1〜2 個** 入れて、AI検索引用時の「次のアクション導線」も担保する
- Q は自然言語の疑問文（AI 検索がリフレーズした形）にする。「〜のメリットは？」より「〜するにはどうすればよいですか？」の方が良い
- 1 記事あたり 4〜5 問を目安に（少なすぎると schema が薄い、多すぎると本文と冗長になる）

## 検証手順

1. dry-run → 挿入後の HTML をレビュー
2. `--apply` で PATCH
3. dev で当該ページを `curl` し、`'"@type":"Question"'` の出現数 = Q の数 を確認
4. `node --env-file=.env scripts/audit-faq.mjs` で全体カバレッジを再集計

## 2026-05-11 時点のカバレッジ

`audit-faq.mjs` 出力ベース:
- `dx`: 7/7 (100%) — 完全展開済み
- `estimate-concerns`: 8/13
- `project-management`: 12/25
- `communication`: 5/10
- `cdp-development`: 6/14
- `ai-development`: 5/13

未対応: 計 39/82 (48%)。優先度高いカテゴリから同パターンで順次展開する。
