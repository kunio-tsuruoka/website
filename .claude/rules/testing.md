---
globs: "[\"src/features/**/*\", \"src/lib/**/*\", \"**/*.test.ts\", \"**/*.test.tsx\"]"
---

# Testing strategy (Vitest)

このプロジェクトは Vitest で feature 内の純粋関数とコンポーネントロジックをテストする。E2E は Playwright（既に @playwright/test で導入済み、`/tmp/flow-mapper-verify*.mjs` で実機確認に使用）を使う。

## セットアップ（未導入の場合）

```bash
bun add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

`package.json` の scripts に追加:
```json
{
  "test": "vitest",
  "test:ci": "vitest run",
  "test:ui": "vitest --ui"
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@astrojs/react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
```

## テスト対象の優先順位

### 1. 純粋関数（最優先・高ROI）
`src/features/*/utils/*.ts` に切り出した関数は副作用ゼロのためテスト最小コスト。

- `flow-mapper/utils/cost.ts` → `stepCost`, `stepLaborCost`, `stepVariableCost`, `computeAggregates`
- `flow-mapper/utils/layout.ts` → `computeLayout`（座標計算の境界条件）
- `flow-mapper/utils/suggestions.ts` → `suggestImprovements`（パターンマッチの網羅）
- `lib/microcms.ts` → 関数化されている部分

### 2. Zustand store のアクション
store のアクション（`addStep`, `applySolutionToToBe` 等）は state を入力にしてstate を返す純粋ロジックなのでテスト容易。

```ts
// src/features/flow-mapper/store.test.ts
import { useFlowStore } from './store';
test('addStep 連続呼びで自動接続される', () => {
  const { addStep, asIs } = useFlowStore.getState();
  addStep('asIs', undefined, undefined, 'start');
  addStep('asIs', undefined, undefined, 'task');
  const steps = useFlowStore.getState().asIs.steps;
  expect(steps).toHaveLength(2);
  expect(steps[0].next).toContain(steps[1].id);
});
```

### 3. React Testing Library でコンポーネント挙動
レンダリング結果＋ユーザー操作の検証。`@testing-library/react` の `render` + `userEvent`。

### 4. やらないこと
- スタイル（Tailwind class名）の単体テスト → 過剰、Playwright スクリーンショット比較で十分
- 描画位置（SVG path 文字列の完全一致）→ 脆い、`computeLayout` の数値テストで代用

## ファイル配置

```
src/features/flow-mapper/
  utils/
    cost.ts
    cost.test.ts          # 同階層に <name>.test.ts
    suggestions.ts
    suggestions.test.ts
  store.ts
  store.test.ts
```

## CI

`bun test:ci` を CI（GitHub Actions など）で実行。`bun check:ci`（Biome）と並列で動かす。

## E2E との役割分担

| レイヤ | ツール | カバレッジ |
|---|---|---|
| 純粋関数 | Vitest | 入出力境界、エッジケース |
| store / hooks | Vitest + Testing Library | アクションの整合性 |
| コンポーネント | Vitest + Testing Library | クリック→state変化、表示確認 |
| ページ全体 | Playwright | ブラウザ実機での操作・スクリーンショット・回帰 |

## 既存 Playwright スクリプト

`/tmp/flow-mapper-verify*.mjs` は手動デバッグ用。本番化するなら `tests/e2e/` に移動して `playwright.config.ts` を整備。
