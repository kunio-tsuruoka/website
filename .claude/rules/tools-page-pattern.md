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
