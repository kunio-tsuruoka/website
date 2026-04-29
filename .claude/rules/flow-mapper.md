---
globs: "[\"src/components/flow-mapper.tsx\", \"src/pages/tools/flow-mapper.astro\"]"
---

# Flow-mapper architecture (v2)

- データモデル: `FlowDiagram = { phases[], lanes[], steps[] }`。`step.next: string[]` で任意グラフ接続。`step.phaseId` + `step.laneId` で2D配置。
- 描画は `computeLayout(diagram)` でステップ座標を一括計算 → HTMLボタン(編集UI) + SVGオーバーレイ(矢印) で重ねる。フェーズ列幅は「そのフェーズの全レーンの最大ステップ数」で決まる。
- 接続編集はドラッグではなく、StepEditor の「次のステップ」チェックボックスで管理（タッチデバイス対応・実装簡素化）。
- PNG/SVG出力は `diagramToSvg()` で同じ `computeLayout` を再利用してSVG文字列を生成 → `svgToPng()` で `<img>` + canvas でラスタ化。html2canvas等の依存を入れずに済む。
- localStorage キーは `beekle-flow-mapper-v2`。スキーマ変更時は v3 に上げる（v1 は phases フィールドが無いため自動で EMPTY にフォールバック）。
