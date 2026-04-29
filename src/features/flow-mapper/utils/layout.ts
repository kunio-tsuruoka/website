import {
  CARD_GAP,
  CARD_H,
  CARD_W,
  HEADER_H,
  LANE_LABEL_W,
  LANE_PAD_Y,
  PHASE_PAD_X,
} from '../constants';
import type { FlowDiagram, FlowStep, Layout, LayoutBox } from '../types';

export function computeLayout(d: FlowDiagram): Layout {
  // (phase, lane) ごとにステップをまとめてセル内位置を決める
  const cellSteps = new Map<string, FlowStep[]>();
  for (const s of d.steps) {
    const key = `${s.phaseId}::${s.laneId}`;
    const arr = cellSteps.get(key) ?? [];
    arr.push(s);
    cellSteps.set(key, arr);
  }

  // フェーズ列幅: そのフェーズ内、いずれかのレーンに含まれる最大ステップ数で決まる
  const phaseX = new Map<string, { x: number; w: number }>();
  let cursorX = LANE_LABEL_W;
  for (const phase of d.phases) {
    let maxStepsInColumn = 1;
    for (const lane of d.lanes) {
      const arr = cellSteps.get(`${phase.id}::${lane.id}`) ?? [];
      maxStepsInColumn = Math.max(maxStepsInColumn, arr.length || 1);
    }
    const w = PHASE_PAD_X * 2 + maxStepsInColumn * CARD_W + (maxStepsInColumn - 1) * CARD_GAP;
    phaseX.set(phase.id, { x: cursorX, w });
    cursorX += w;
  }
  const totalW = cursorX;

  // レーン高は固定
  const laneY = new Map<string, { y: number; h: number }>();
  let cursorY = HEADER_H;
  const laneH = LANE_PAD_Y * 2 + CARD_H;
  for (const lane of d.lanes) {
    laneY.set(lane.id, { y: cursorY, h: laneH });
    cursorY += laneH;
  }
  const totalH = cursorY;

  // セル内でステップを横に並べる
  const step = new Map<string, LayoutBox>();
  for (const phase of d.phases) {
    const px = phaseX.get(phase.id);
    if (!px) continue;
    for (const lane of d.lanes) {
      const ly = laneY.get(lane.id);
      if (!ly) continue;
      const arr = cellSteps.get(`${phase.id}::${lane.id}`) ?? [];
      for (let idx = 0; idx < arr.length; idx++) {
        const s = arr[idx];
        const x = px.x + PHASE_PAD_X + idx * (CARD_W + CARD_GAP);
        const y = ly.y + LANE_PAD_Y;
        step.set(s.id, { x, y, w: CARD_W, h: CARD_H });
      }
    }
  }

  return { width: totalW, height: totalH, phaseX, laneY, step };
}

export function buildArrowPath(from: LayoutBox, to: LayoutBox): string {
  // from の右辺から to の左辺へ。順方向は単純なベジェ、逆方向は上に迂回。
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y + to.h / 2;
  if (x2 > x1) {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 6} ${y2}`;
  }
  const offsetY = Math.min(y1, y2) - 24;
  return `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x1 + 30} ${offsetY}, ${(x1 + x2) / 2} ${offsetY} S ${x2 - 30} ${y2}, ${x2 - 6} ${y2}`;
}
