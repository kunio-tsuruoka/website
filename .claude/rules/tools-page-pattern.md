---
globs: "[\"src/pages/tools/**/*.astro\", \"src/components/scope-manager.tsx\", \"src/components/story-builder.tsx\", \"src/components/flow-mapper.tsx\"]"
---

# Tools page pattern

- New `/tools/<name>` 系のツールは scope-manager.astro / story-builder.astro と同じ枠（PageHero → 3カードの価値訴求 → 成果物プレビュー → 使い方 4ステップ → ツール本体 → 関連リンク → 黒背景CTA）に揃える。
- React 本体は最小は `src/components/<name>.tsx` 1ファイル。**ただし300行を超えたら `src/features/<name>/` の feature-based 構造に移行する**（詳細は `feature-architecture.md`）。`localStorage` キーは `beekle-<name>-v1`（v2,v3...で破壊的変更）。
- `src/components/header.tsx` の `toolsItems` 配列にも忘れず追加する。
- Biome ルールで `Array.forEach` は禁止（`noForEach`）。`for...of` か `for (let i)` を使う。
- `<div role="button">` は `useSemanticElements` で却下。`<button type="button">` を使う。
- 状態管理: 共有UI/ドメイン状態は Zustand、コンポーネントprivate な一時状態は `useState`。詳細は `feature-architecture.md`。

# 発注準備キット系ツールの localStorage 容量対応方針

実装上の判断 (2026-05-03 確定):

- 容量超過時の `try/catch` 黙殺はやめる → setItem 失敗時は `console.warn` で可視化する
- **「localStorage 使用量ダッシュボード」UI は作らない**（オーバーエンジニアリング、現状の合計 100KB 程度なら 5MB 制限の 2% で余裕がある）
- `navigator.storage.estimate()` での詳細な容量監視も基本不要
- ただし **「保存データの一覧 + 削除UI」は必要**（古いデータが localStorage に積もるのを防ぐ + プライバシー懸念のあるユーザーに明示的な削除手段を提供する）
- 各ツールが localStorage 書き込み時に `savedAt: Date.now()` メタを別キー (`beekle-tool-meta-v1`) に書く
- /tools index で `DataHousekeeping` コンポーネントが 4ツールの保存状況を一覧 + 個別削除/一括削除を提供
- 90日以上経過のデータには「古い」バッジを表示

**why**: 容量ダッシュボードは過剰だが、保存データの存在自体を可視化して削除可能にするのは UX/プライバシー両面で必要。ユーザーから明示。

**how to apply**: ツール側 `setItem` の `try/catch` には `console.warn`、保存と同時にメタ情報も書く。/tools index に `DataHousekeeping` を必ず組み込む。
