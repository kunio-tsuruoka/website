# squash merge後はソースブランチを削除する

PR を squash merge する運用では、**マージ完了後にソースブランチを必ず削除する**こと。`gh pr merge --squash --delete-branch` を使えば自動。

**why**: 削除せずに同じブランチを再利用して新しい作業を続けると、次にPRを開いた時に致命的な擬似コンフリクトが発生する。
- main: 過去の作業を「1つの squash commit」として持つ
- 再利用ブランチ: 元の複数コミットを履歴に持つ + 新規コミット
- git の3-way merge ベースは元のbranch時点を起点にするため、古いコミットの変更を「両方持つ」扱いになり、main側で更新されたファイル全てを「branch側に取り込まれていない変更」として扱う

**実例 (2026-05-06)**: PR #22 squash merge 後、`feat/tools-improvements` ブランチを再利用して prooffirst/資料DL/QA 等の作業を継続 → PR #23 を開いた時に `mergeable: CONFLICTING` で 19 ファイル分の擬似差分が発生。GitHub Actions CI も走らない。`git diff --name-only $(git merge-base HEAD origin/main) origin/main` で見ると、main側にあるが branch側に「ない」とされるファイルが大量に出る。

**復旧方法**: main から新ブランチを切り、`git cherry-pick <squash-merge後の最初のcommit>^..<最新>` で新規コミットだけを移植 → push → 新PR。古いブランチは閉じる。

**how to apply**:
- 個人運用でも `gh pr merge --squash --delete-branch` を必ず付ける
- もし削除し忘れて再利用してしまったら、上記の cherry-pick 救済を即座に行う（コンフリクト解決を頑張らない方が早い）

# 並行サブエージェント作業中のgit運用

- サブエージェントが同一リポジトリを編集中に、親セッションで `git add -A` を使わない。親のコミットは必ずパス指定でステージする（例: `git add backend/ data/ docs/`）
- 2026-07-03 shirakaneで発生: 親のバックエンドコミットがエージェント作業途中のfrontend変更を巻き込んだ（結果的に最終状態と一致し実害なしだったが、途中状態を固定するリスクがあった）
