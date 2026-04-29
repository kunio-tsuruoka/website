---
globs: "[\"src/features/**/*\", \"src/components/flow-mapper.tsx\", \"src/components/scope-manager.tsx\", \"src/components/story-builder.tsx\"]"
---

# Feature-based architecture for /tools/* apps

`/tools/*` 配下の対話型ツール（flow-mapper, scope-manager, story-builder, 今後の業務系ツール）は、規模が大きくなると god component になりやすい。新規・既存問わず以下のアーキテクチャに揃える。

## ディレクトリ構造

```
src/features/<feature>/
  index.tsx                # 公開エントリ（Astro から import）
  store.ts                 # Zustand store（feature単位の永続UI状態）
  types.ts                 # ドメイン型定義（FlowStep, FlowDiagram など）
  utils/                   # 純粋関数（computeLayout, suggestImprovements 等）
    layout.ts
    suggestions.ts
    cost.ts
  components/              # この feature 専用のサブコンポーネント
    SwimlaneCanvas.tsx
    StepCard.tsx
    StepEditor.tsx
    SuggestionsPanel.tsx
    CostsPanel.tsx
  hooks/                   # 必要に応じて feature 固有 hooks
    useOverflowDetect.ts
  constants.ts             # SOLUTIONS, STEP_TYPE_*, デフォルト定数
```

`src/components/<name>.tsx` の1ファイル構成（既存 scope-manager / story-builder）はサイズが300行を超える時点で `src/features/<name>/` への移行を検討する。flow-mapper は既に god component（2700行超）→ 移行必須。

## 状態管理の使い分け

### Zustand（feature単位の共有UI状態 + ドメイン状態）
- 複数のサブコンポーネントから読み書きされる状態
- 永続化（localStorage）が必要な状態
- 例: `state` (asIs/toBe diagram), `view`, `connectMode`, `connectFromId`, `editingId`, `fullscreen`, `onboardingOpen`

### useState（コンポーネント内部のみで完結する private state）
- そのコンポーネントの中だけで意味を持つ一時的UI状態
- 例: StepCard の `editing` (インライン編集中フラグ), `draftLabel` (確定前のテキスト), ExportMenu の `open`, CostsPanel の `open`

### 判定基準（迷ったら）
- 「他のコンポーネントから読みたいか？」YES → Zustand / NO → useState
- 「リロード後も保持したいか？」YES → Zustand + persist / NO → useState

## Zustand store の書き方

```ts
// src/features/flow-mapper/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { State, View, FlowStep } from './types';

type Actions = {
  setView: (v: View) => void;
  setEditingId: (id: string | null) => void;
  addStep: (target: 'asIs' | 'toBe', laneId?: string, phaseId?: string, type?: StepType) => void;
  // ... アクションは store 内に集約
};

export const useFlowStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      asIs: EMPTY.asIs,
      toBe: EMPTY.toBe,
      view: 'asIs',
      editingId: null,
      // ...
      setView: (v) => set({ view: v }),
      addStep: (target, laneId, phaseId, type = 'task') => set((s) => { /* 既存ロジック */ }),
    }),
    { name: 'beekle-flow-mapper-v2' }
  )
);
```

## 純粋関数の切り出し

`computeLayout`, `suggestImprovements`, `stepCost`, `diagramToSvg` などは `utils/` に隔離。store/component 非依存にしてユニットテスト可能に。

```ts
// src/features/flow-mapper/utils/cost.ts
export function stepCost(step: FlowStep, lanes: FlowLane[]): number { /* ... */ }
```

## 公開境界

- `src/pages/tools/<name>.astro` から import するのは `src/features/<name>/index.tsx` のみ
- index.tsx が React のエントリ（store provider 不要、Zustand は外側でも動く）
- 内部の細かい型・util は外に export しない（features 内部の閉じた依存）

## 何をしないか

- Redux、recoil、jotai、tanstack-query は導入しない（プロジェクトとして Zustand に統一）
- Context API は基本使わない（Zustand で十分、不要に再レンダリング誘発しがち）
- 1ツール内で複数 store を作らない。1 feature = 1 store 原則

## 既存からの移行手順

1. `src/features/<name>/` を作り、まず `types.ts` と `utils/*.ts` を切り出す（純粋関数なので最も安全）
2. Zustand store に state とアクションを移し、既存 `useState` の依存を一括置換
3. サブコンポーネント (`SwimlaneCanvas`, `StepEditor` 等) を `components/` に分離
4. ルートを `index.tsx` に集約 → `tools/<name>.astro` の import を差し替え
5. 旧 `src/components/<name>.tsx` を削除

## TODO（優先度順）

- [ ] **flow-mapper**: 2700行超、最優先で feature 分割
- [ ] **scope-manager**: 規模次第、必要なら分割
- [ ] **story-builder**: 規模次第、必要なら分割
