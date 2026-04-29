# flow-mapper feature 移行状況

`.claude/rules/feature-architecture.md` の方針に沿って、god component化していた
`src/components/flow-mapper.tsx`（2700行超）を `src/features/flow-mapper/` に
段階分割する作業を進行中。

## Phase A: 完了（このコミット）

- [x] `types.ts` — ドメイン型定義（FlowStep, FlowDiagram, View, Aggregates 等）
- [x] `utils/format.ts` — fmtMin / fmtYen / uid（純粋関数）
- [x] `utils/cost.ts` — stepCost / stepLaborCost / stepVariableCost / totalMinutes / computeAggregates
- [x] `utils/suggestions.ts` — SOLUTIONS 定数 / suggestImprovements
- [x] 各 utils に同階層 `.test.ts` を配置（Vitest）
- [x] `vitest.config.ts` / `tests/setup.ts`
- [x] `package.json` に zustand / vitest / jsdom / testing-library / @vitest/ui を追加

## Phase B: 未着手（次セッション）

- [ ] `bun install` 実施（package.json更新ぶん）
- [ ] `bun test:ci` でテスト全件パス確認
- [ ] `utils/layout.ts` — computeLayout / buildArrowPath / 定数（CARD_W, HEADER_H 等）
- [ ] `utils/svg.ts` — diagramToSvg / svgToPng / escapeXml / download
- [ ] `utils/markdown.ts` — diagramToMarkdown / diffSummary / exportMarkdown
- [ ] `utils/sample.ts` — SAMPLE / EMPTY 定数
- [ ] `constants.ts` — STEP_TYPE_LABEL / STEP_TYPE_STYLE / STEP_TYPE_FILL / STEP_TYPE_STROKE / SUGGESTION_BADGE
- [ ] `store.ts` — Zustand store（state + アクション一式、persist middleware）
- [ ] `components/StepCard.tsx`
- [ ] `components/StepEditor.tsx`
- [ ] `components/SwimlaneCanvas.tsx`
- [ ] `components/ShapePalette.tsx` + `components/StepIcon.tsx`
- [ ] `components/SuggestionsPanel.tsx`
- [ ] `components/CostsPanel.tsx`
- [ ] `components/CompareView.tsx`
- [ ] `components/EmptyEditor.tsx`
- [ ] `components/ExportMenu.tsx`
- [ ] `components/PrintStyles.tsx`
- [ ] `index.tsx` — エントリ。store を読んでサブコンポーネントを組み合わせるだけ
- [ ] `src/pages/tools/flow-mapper.astro` の import を `@/features/flow-mapper` 経由に変更
- [ ] `src/components/flow-mapper.tsx` を削除
- [ ] Playwright で実機確認（既存の verify スクリプトを再利用）

## ローカル動作確認

```bash
bun install                    # 新規deps適用
bun test:ci                    # ユニットテスト
bun dev                        # /tools/flow-mapper を実機で確認
```

## 設計判断ログ

- **Zustand採用理由**: Redux/jotai は規模過剰、Context は再レンダリング誘発が痛い。Zustand は `useStore(s => s.field)` で必要なフィールドだけ subscribe できる
- **persist middleware**: localStorage キーは `beekle-flow-mapper-v2` を踏襲。スキーマ変更時に v3 へ
- **テスト戦略**: 純粋関数（utils）優先。store のアクションは type-safe な reducer的に書けば `getState()` ベースでテスト可
