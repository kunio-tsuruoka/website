# 導入事例は2系統ある: /case-studies(allCases) と サービスページ(service.ts caseStudies)

Beekleサイトの「導入事例」は別々の2箇所に存在する。混同しないこと。
- `/case-studies` ページ = `src/pages/case-studies.astro` の `allCases` 配列（industry/scale/period + challenge/solution/results(label/value) 構造）。全社の実績一覧。
- 各サービスページ（例 `/services/rag-system-development`）= `src/data/service.ts` の各サービスの `caseStudies`（title/challenge/solution/results、2026-07に任意 techStack 追加）。そのサービス文脈の事例。
- ある実績が /case-studies にあっても、サービスページには無いことがある（逆も）。「導入事例を更新」と言われたらどちらのページか特定する。

## 教訓（2026-07-01やらかし）
ユーザーが「本番にある」と言ったカスタマーサポートGraphRAG事例を「どこにも無い」と誤断定した。原因: (1) サービスページのHTMLしか見ず /case-studies を見なかった (2) ローカルが origin/main から8コミット遅れで、PR#55で追加された事例がローカルに無かった。
→ 「本番にある/無い」を判断する前に必ず: `git fetch` して origin/main を見る＋関連する複数ページ(/case-studies と service両方)をcurlで確認する。ローカルツリーだけで結論しない。

## worktreeでの安全な着地
散らかった作業ツリー（未追跡がmainでは追跡済み等でcheckout不可）から特定ファイルだけをmain起点PRにする時は、`git worktree add -b <branch> <path> origin/main` で隔離し、対象ファイルを上書きコピー→commit→pushが安全。元ツリーに一切触れない。

# getColumns は全件ページネーション必須（コラム104件 > MicroCMS 100件上限）

`src/lib/microcms.ts` の `getColumns(categoryId?, env?)` は 2026-07-01 に **offset ページネーション化**（totalCountまでループ取得）。それ以前は `limit:100` 固定で、コラム総数が100を超える（現在104件）と最古の記事が黙って落ちていた。

## 影響していた箇所（全て getColumns(undefined) 経由）
- `/column`（src/pages/column.astro）: 記事欠落＋「07 Beekleのナレッジ」空枠
- `sitemap.xml`（src/pages/sitemap.xml.ts）: 末尾コラムのURL漏れ（SEOバグ）
- homepage（src/pages/index.astro）: 最新記事sliceなので実害は小だが取得元は同じ

## /column の設計メモ
- knowledge カテゴリは `/knowledge` 専用ページで表示する方針。column.astro は記事を除外(`c.category?.id !== 'knowledge'`)しているが、numbered カテゴリのループからも `knowledge` を除外しないと**記事0の空枠**が出る（2026-07-01修正）。
- カテゴリ一覧に新カテゴリを足す時、専用ページで扱う類は column.astro のループからも除外する。

## 教訓
MicroCMS 取得関数は「今は100件未満だから大丈夫」で limit 固定にしない。件数が上限を超えた瞬間に一覧・sitemap から静かに脱落する。一覧系は最初からページネーションで書く。
