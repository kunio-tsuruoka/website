# Scope Manager (FM ツール) ルール

## 用語と表示

書籍『システムを作らせる技術』(白川克, ISBN 978-4-532-32399-8) のFM (ファンクショナリティ・マトリクス) を参考に、UI 表記は親しみやすい従来表現を採用：

- **ビジネス価値** ★1〜3（多いほど良い）
- **現場で使えるか** ★1〜3（多いほど良い、書籍の「組織受入態勢」相当）
- **技術コスト** 低/中/高（**書籍の「技術的容易性」とは逆向きの軸**。低=作りやすい/良い、高=難しい/悪い）

## 判定ロジック (`suggestVerdict` in `src/components/scope-manager.tsx`)

判定は内部で `techCost` を `techEase = 4 - techCost` に反転してから「3軸とも H/M/L」として書籍準拠ルールを適用：

1. どれか1つでも未評価 → 提案しない
2. どれか1軸でも L (★1 / 技術コスト=高) → **作らない**（書籍原則: 使われない / 無謀は外す）
3. H が2つ以上 (★3 / 技術コスト=低) → **作る**
4. それ以外 (M中心) → **後回し**

## ストレージ

- `localStorage` キー: `beekle-scope-manager-v1`
- 永続: `markdown` と `requirements`（`techCost` を含む）

## Story Builder との連携

`/tools/story-builder` の Markdown 出力は `- **REQ-XXX-NNN**（種別・優先度・由来:XX）` 形式に揃えてあり、scope-manager の `parseMarkdown` 正規表現にそのままマッチする。

## パイプライン順序との整合（2026-07-14 反転後）

正規のパイプラインは **要求 → FM → ユーザーストーリー → Gherkin → 実装**（[[requirements-pipeline-order]]）。この文脈で両ツールの位置づけ:

- **scope-manager（FM）は「要求（やりたいこと）の一覧」を入力に取り、3軸で絞る**工程。入力は story-builder が出す1行の要求候補でよい（=要求の洗い出し）。「詳細なユーザーストーリー化」ではなく「粗い要求候補の優先順位付け」がFMの役割。
- **詳細なユーザーストーリー＋EARSは、FMで「作る」と決めた要求だけを後工程で書く**。story-builder はこの詳細化にも使えるが、記事コピーで「ストーリーを全部書いてからFM」と書かない（反パターン）。
- ツールのデータフロー（story-builder出力→scope-manager取り込み）は**コード変更不要**。story-builder の1行出力＝要求候補と解釈すれば「要求→FM」に合致する。tool code の反転（story-builderをFM後に強制する等）はしない。
