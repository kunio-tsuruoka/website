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
