import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

type StepType = 'start' | 'task' | 'decision' | 'system' | 'wait' | 'end';

type FlowStep = {
  id: string;
  type: StepType;
  laneId: string;
  phaseId: string;
  label: string;
  durationMin: number;
  tool: string;
  pain: string;
  improvement: string;
  next: string[];
};

type FlowLane = { id: string; name: string };
type FlowPhase = { id: string; name: string };

type FlowDiagram = {
  title: string;
  phases: FlowPhase[];
  lanes: FlowLane[];
  steps: FlowStep[];
};

type View = 'asIs' | 'toBe' | 'compare';
type State = { asIs: FlowDiagram; toBe: FlowDiagram };

const STORAGE_KEY = 'beekle-flow-mapper-v2';

const STEP_TYPE_LABEL: Record<StepType, string> = {
  start: '開始',
  task: '作業',
  decision: '判断',
  system: 'システム',
  wait: '待ち',
  end: '完了',
};

const STEP_TYPE_STYLE: Record<StepType, string> = {
  start: 'bg-emerald-100 border-emerald-500 text-emerald-900',
  task: 'bg-white border-gray-400 text-gray-900',
  decision: 'bg-amber-100 border-amber-500 text-amber-900',
  system: 'bg-sky-100 border-sky-500 text-sky-900',
  wait: 'bg-gray-100 border-gray-400 text-gray-700',
  end: 'bg-rose-100 border-rose-500 text-rose-900',
};

const STEP_TYPE_FILL: Record<StepType, string> = {
  start: '#d1fae5',
  task: '#ffffff',
  decision: '#fef3c7',
  system: '#e0f2fe',
  wait: '#f3f4f6',
  end: '#ffe4e6',
};

const STEP_TYPE_STROKE: Record<StepType, string> = {
  start: '#10b981',
  task: '#9ca3af',
  decision: '#f59e0b',
  system: '#0ea5e9',
  wait: '#9ca3af',
  end: '#f43f5e',
};

const SAMPLE: State = {
  asIs: {
    title: '受注〜出荷業務（紙・電話運用）',
    phases: [
      { id: 'p1', name: '①受注' },
      { id: 'p2', name: '②引当・指示' },
      { id: 'p3', name: '③出荷' },
    ],
    lanes: [
      { id: 'l1', name: '顧客' },
      { id: 'l2', name: '営業担当' },
      { id: 'l3', name: '事務' },
      { id: 'l4', name: '倉庫' },
    ],
    steps: [
      {
        id: 's1',
        type: 'start',
        laneId: 'l1',
        phaseId: 'p1',
        label: 'メール／FAXで注文',
        durationMin: 0,
        tool: 'メール／FAX',
        pain: '',
        improvement: '',
        next: ['s2'],
      },
      {
        id: 's2',
        type: 'task',
        laneId: 'l2',
        phaseId: 'p1',
        label: '営業がExcelに転記',
        durationMin: 15,
        tool: 'Excel',
        pain: '転記ミスが月3〜5件',
        improvement: '',
        next: ['s3'],
      },
      {
        id: 's3',
        type: 'task',
        laneId: 'l3',
        phaseId: 'p2',
        label: '事務が在庫を電話で確認',
        durationMin: 20,
        tool: '電話',
        pain: '倉庫が忙しいと折返し待ち',
        improvement: '',
        next: ['s4'],
      },
      {
        id: 's4',
        type: 'decision',
        laneId: 'l3',
        phaseId: 'p2',
        label: '在庫あり？',
        durationMin: 5,
        tool: '',
        pain: '',
        improvement: '',
        next: ['s5', 's9'],
      },
      {
        id: 's5',
        type: 'task',
        laneId: 'l3',
        phaseId: 'p2',
        label: '注文書を紙で印刷',
        durationMin: 10,
        tool: 'プリンタ',
        pain: '紙の行き来で半日ロス',
        improvement: '',
        next: ['s6'],
      },
      {
        id: 's6',
        type: 'task',
        laneId: 'l4',
        phaseId: 'p3',
        label: 'ピッキング・梱包',
        durationMin: 60,
        tool: '紙の指示書',
        pain: '指示書の紛失あり',
        improvement: '',
        next: ['s7'],
      },
      {
        id: 's7',
        type: 'task',
        laneId: 'l3',
        phaseId: 'p3',
        label: '送り状を手書き',
        durationMin: 15,
        tool: 'ペン／伝票',
        pain: '宛名ミス',
        improvement: '',
        next: ['s8'],
      },
      {
        id: 's8',
        type: 'end',
        laneId: 'l4',
        phaseId: 'p3',
        label: '集荷・出荷',
        durationMin: 10,
        tool: '',
        pain: '',
        improvement: '',
        next: [],
      },
      {
        id: 's9',
        type: 'task',
        laneId: 'l2',
        phaseId: 'p2',
        label: '営業が顧客に納期回答',
        durationMin: 20,
        tool: '電話',
        pain: '謝罪対応が常態化',
        improvement: '',
        next: ['s10'],
      },
      {
        id: 's10',
        type: 'end',
        laneId: 'l1',
        phaseId: 'p2',
        label: '欠品連絡（注文取消）',
        durationMin: 0,
        tool: '',
        pain: '',
        improvement: '',
        next: [],
      },
    ],
  },
  toBe: {
    title: '受注〜出荷業務（システム化後）',
    phases: [
      { id: 'p1', name: '①受注' },
      { id: 'p2', name: '②引当・指示' },
      { id: 'p3', name: '③出荷' },
    ],
    lanes: [
      { id: 'l1', name: '顧客' },
      { id: 'l2', name: '営業担当' },
      { id: 'l3', name: '事務' },
      { id: 'l4', name: '倉庫' },
      { id: 'l5', name: 'システム' },
    ],
    steps: [
      {
        id: 's1',
        type: 'start',
        laneId: 'l1',
        phaseId: 'p1',
        label: 'Webフォームで注文',
        durationMin: 0,
        tool: '受注Webフォーム',
        pain: '',
        improvement: '入力規則で誤注文を未然防止',
        next: ['s2'],
      },
      {
        id: 's2',
        type: 'system',
        laneId: 'l5',
        phaseId: 'p2',
        label: '在庫を自動引当',
        durationMin: 0,
        tool: '在庫API',
        pain: '',
        improvement: '電話確認を撤廃',
        next: ['s3'],
      },
      {
        id: 's3',
        type: 'decision',
        laneId: 'l5',
        phaseId: 'p2',
        label: '在庫あり？',
        durationMin: 0,
        tool: '',
        pain: '',
        improvement: '',
        next: ['s4', 's8'],
      },
      {
        id: 's4',
        type: 'system',
        laneId: 'l5',
        phaseId: 'p2',
        label: 'ピッキング指示を自動生成',
        durationMin: 0,
        tool: 'WMS',
        pain: '',
        improvement: '紙の指示書を廃止',
        next: ['s5'],
      },
      {
        id: 's5',
        type: 'task',
        laneId: 'l4',
        phaseId: 'p3',
        label: 'ハンディでピッキング',
        durationMin: 40,
        tool: 'ハンディ端末',
        pain: '',
        improvement: '誤出荷をリアルタイム検知',
        next: ['s6'],
      },
      {
        id: 's6',
        type: 'system',
        laneId: 'l5',
        phaseId: 'p3',
        label: '送り状を自動発行',
        durationMin: 0,
        tool: '配送API',
        pain: '',
        improvement: '宛名ミスを撲滅',
        next: ['s7'],
      },
      {
        id: 's7',
        type: 'end',
        laneId: 'l4',
        phaseId: 'p3',
        label: '集荷・出荷',
        durationMin: 5,
        tool: '',
        pain: '',
        improvement: '',
        next: [],
      },
      {
        id: 's8',
        type: 'system',
        laneId: 'l5',
        phaseId: 'p2',
        label: '欠品を即座に通知',
        durationMin: 0,
        tool: 'メール／LINE',
        pain: '',
        improvement: '営業の電話謝罪を不要化',
        next: ['s9'],
      },
      {
        id: 's9',
        type: 'end',
        laneId: 'l1',
        phaseId: 'p2',
        label: '代替提案を確認',
        durationMin: 0,
        tool: '',
        pain: '',
        improvement: '機会損失を抑制',
        next: [],
      },
    ],
  },
};

const EMPTY: State = {
  asIs: {
    title: '現状の業務フロー',
    phases: [
      { id: 'p1', name: '①受注' },
      { id: 'p2', name: '②処理' },
      { id: 'p3', name: '③完了' },
    ],
    lanes: [{ id: 'l1', name: '担当者A' }],
    steps: [],
  },
  toBe: {
    title: '改善後の業務フロー',
    phases: [
      { id: 'p1', name: '①受注' },
      { id: 'p2', name: '②処理' },
      { id: 'p3', name: '③完了' },
    ],
    lanes: [{ id: 'l1', name: '担当者A' }],
    steps: [],
  },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadInitial(): State {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as State;
    if (parsed?.asIs?.lanes && parsed?.toBe?.lanes && parsed?.asIs?.phases) return parsed;
  } catch {
    /* ignore */
  }
  return EMPTY;
}

function totalMinutes(d: FlowDiagram) {
  return d.steps.reduce((acc, s) => acc + (Number.isFinite(s.durationMin) ? s.durationMin : 0), 0);
}

function fmtMin(m: number) {
  if (m < 60) return `${m}分`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}時間` : `${h}時間${r}分`;
}

function diagramToMarkdown(label: string, d: FlowDiagram): string {
  const lines: string[] = [];
  lines.push(`## ${label}：${d.title}`);
  lines.push('');
  lines.push(`- フェーズ数: ${d.phases.length}`);
  lines.push(`- 担当者数: ${d.lanes.length}名／部署`);
  lines.push(`- ステップ数: ${d.steps.length}`);
  lines.push(`- 想定リードタイム合計: ${fmtMin(totalMinutes(d))}`);
  lines.push('');
  lines.push('| # | フェーズ | 担当 | 種別 | 内容 | 時間 | 使用ツール | 接続先 | 課題／改善 |');
  lines.push('|---|----------|------|------|------|------|------------|--------|------------|');
  const idIndex = new Map(d.steps.map((s, i) => [s.id, i + 1]));
  for (let i = 0; i < d.steps.length; i++) {
    const s = d.steps[i];
    const phase = d.phases.find((p) => p.id === s.phaseId)?.name ?? '-';
    const lane = d.lanes.find((l) => l.id === s.laneId)?.name ?? '-';
    const note = s.pain || s.improvement || '';
    const next = s.next.map((nid) => `#${idIndex.get(nid) ?? '?'}`).join(', ') || '-';
    lines.push(
      `| ${i + 1} | ${phase} | ${lane} | ${STEP_TYPE_LABEL[s.type]} | ${s.label} | ${s.durationMin || 0}分 | ${s.tool || '-'} | ${next} | ${note.replace(/\|/g, '/').replace(/\n/g, ' ') || '-'} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

function diffSummary(asIs: FlowDiagram, toBe: FlowDiagram): string {
  const lines: string[] = [];
  const a = totalMinutes(asIs);
  const b = totalMinutes(toBe);
  const delta = a - b;
  lines.push('## ギャップ分析（As-Is → To-Be）');
  lines.push('');
  lines.push('| 指標 | As-Is | To-Be | 差分 |');
  lines.push('|------|-------|-------|------|');
  lines.push(
    `| ステップ数 | ${asIs.steps.length} | ${toBe.steps.length} | ${toBe.steps.length - asIs.steps.length} |`
  );
  lines.push(
    `| 担当者数 | ${asIs.lanes.length} | ${toBe.lanes.length} | ${toBe.lanes.length - asIs.lanes.length} |`
  );
  lines.push(
    `| 想定リードタイム | ${fmtMin(a)} | ${fmtMin(b)} | ${delta >= 0 ? '-' : '+'}${fmtMin(Math.abs(delta))} |`
  );
  lines.push('');
  const pains = asIs.steps.filter((s) => s.pain.trim());
  const improvements = toBe.steps.filter((s) => s.improvement.trim());
  if (pains.length) {
    lines.push('### 現状の主な課題');
    lines.push('');
    for (const s of pains) {
      lines.push(`- **${s.label}**：${s.pain}`);
    }
    lines.push('');
  }
  if (improvements.length) {
    lines.push('### 改善ポイント');
    lines.push('');
    for (const s of improvements) {
      lines.push(`- **${s.label}**：${s.improvement}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function exportMarkdown(state: State): string {
  return [
    '# 業務フロー可視化（As-Is／To-Be）',
    '',
    `_作成日: ${new Date().toLocaleDateString('ja-JP')}_`,
    '',
    diagramToMarkdown('As-Is（現状）', state.asIs),
    diagramToMarkdown('To-Be（あるべき姿）', state.toBe),
    diffSummary(state.asIs, state.toBe),
    '---',
    '',
    'Beekle 業務フロー可視化ツール（https://beekle.jp/tools/flow-mapper）で作成',
  ].join('\n');
}

function download(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CARD_W = 180;
const CARD_H = 72;
const CARD_GAP = 12;
const PHASE_PAD_X = 24;
const LANE_PAD_Y = 16;
const HEADER_H = 48;
const LANE_LABEL_W = 120;

type LayoutBox = { x: number; y: number; w: number; h: number };
type Layout = {
  width: number;
  height: number;
  phaseX: Map<string, { x: number; w: number }>;
  laneY: Map<string, { y: number; h: number }>;
  step: Map<string, LayoutBox>;
};

function computeLayout(d: FlowDiagram): Layout {
  // Group steps by (phase, lane)
  const cellSteps = new Map<string, FlowStep[]>();
  for (const s of d.steps) {
    const key = `${s.phaseId}::${s.laneId}`;
    const arr = cellSteps.get(key) ?? [];
    arr.push(s);
    cellSteps.set(key, arr);
  }

  // Compute phase widths: max steps in any lane within that phase
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

  // Lane heights: fixed
  const laneY = new Map<string, { y: number; h: number }>();
  let cursorY = HEADER_H;
  const laneH = LANE_PAD_Y * 2 + CARD_H;
  for (const lane of d.lanes) {
    laneY.set(lane.id, { y: cursorY, h: laneH });
    cursorY += laneH;
  }
  const totalH = cursorY;

  // Position steps within their cell
  const step = new Map<string, LayoutBox>();
  for (const phase of d.phases) {
    const px = phaseX.get(phase.id);
    if (!px) continue;
    for (const lane of d.lanes) {
      const ly = laneY.get(lane.id);
      if (!ly) continue;
      const arr = cellSteps.get(`${phase.id}::${lane.id}`) ?? [];
      arr.forEach((s, idx) => {
        const x = px.x + PHASE_PAD_X + idx * (CARD_W + CARD_GAP);
        const y = ly.y + LANE_PAD_Y;
        step.set(s.id, { x, y, w: CARD_W, h: CARD_H });
      });
    }
  }

  return { width: totalW, height: totalH, phaseX, laneY, step };
}

function buildArrowPath(from: LayoutBox, to: LayoutBox): string {
  // Right edge of `from` to left edge of `to`. If same lane row, draw simple curve;
  // if different rows, route with vertical bend.
  const x1 = from.x + from.w;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y + to.h / 2;
  if (x2 > x1) {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2 - 6} ${y2}`;
  }
  // Backward connection: route over the top
  const offsetY = Math.min(y1, y2) - 24;
  return `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x1 + 30} ${offsetY}, ${(x1 + x2) / 2} ${offsetY} S ${x2 - 30} ${y2}, ${x2 - 6} ${y2}`;
}

export function FlowMapper() {
  const [state, setState] = useState<State>(EMPTY);
  const [view, setView] = useState<View>('asIs');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, hydrated]);

  const target: 'asIs' | 'toBe' = view === 'toBe' ? 'toBe' : 'asIs';
  const activeDiagram = view === 'compare' ? null : state[view];

  function updateDiagram(t: 'asIs' | 'toBe', mutator: (d: FlowDiagram) => FlowDiagram) {
    setState((prev) => ({ ...prev, [t]: mutator(prev[t]) }));
  }

  function addLane(t: 'asIs' | 'toBe') {
    updateDiagram(t, (d) => ({
      ...d,
      lanes: [...d.lanes, { id: uid(), name: `担当者${d.lanes.length + 1}` }],
    }));
  }
  function renameLane(t: 'asIs' | 'toBe', id: string, name: string) {
    updateDiagram(t, (d) => ({
      ...d,
      lanes: d.lanes.map((l) => (l.id === id ? { ...l, name } : l)),
    }));
  }
  function deleteLane(t: 'asIs' | 'toBe', id: string) {
    updateDiagram(t, (d) => {
      if (d.lanes.length <= 1) return d;
      return {
        ...d,
        lanes: d.lanes.filter((l) => l.id !== id),
        steps: d.steps
          .filter((s) => s.laneId !== id)
          .map((s) => ({
            ...s,
            next: s.next.filter((nid) => d.steps.some((x) => x.id === nid && x.laneId !== id)),
          })),
      };
    });
  }

  function addPhase(t: 'asIs' | 'toBe') {
    updateDiagram(t, (d) => ({
      ...d,
      phases: [...d.phases, { id: uid(), name: `フェーズ${d.phases.length + 1}` }],
    }));
  }
  function renamePhase(t: 'asIs' | 'toBe', id: string, name: string) {
    updateDiagram(t, (d) => ({
      ...d,
      phases: d.phases.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  }
  function deletePhase(t: 'asIs' | 'toBe', id: string) {
    updateDiagram(t, (d) => {
      if (d.phases.length <= 1) return d;
      return {
        ...d,
        phases: d.phases.filter((p) => p.id !== id),
        steps: d.steps
          .filter((s) => s.phaseId !== id)
          .map((s) => ({
            ...s,
            next: s.next.filter((nid) => d.steps.some((x) => x.id === nid && x.phaseId !== id)),
          })),
      };
    });
  }

  function addStep(t: 'asIs' | 'toBe', laneId?: string, phaseId?: string) {
    const d = state[t];
    const newStep: FlowStep = {
      id: uid(),
      type: 'task',
      laneId: laneId ?? d.lanes[0]?.id ?? '',
      phaseId: phaseId ?? d.phases[0]?.id ?? '',
      label: '新しいステップ',
      durationMin: 10,
      tool: '',
      pain: '',
      improvement: '',
      next: [],
    };
    // 直前の「終端ステップ」(next が空) があれば、新ステップへ自動接続。
    // フロー作成の体験を「ステップを足す → 自動的に矢印で繋がる」に揃える。
    // 既に分岐がある場合は触らない（ユーザーの明示的な構造を尊重）。
    updateDiagram(t, (dd) => {
      const prev = [...dd.steps].reverse().find((s) => s.next.length === 0 && s.type !== 'end');
      const stepsWithLink = prev
        ? dd.steps.map((s) => (s.id === prev.id ? { ...s, next: [newStep.id] } : s))
        : dd.steps;
      return { ...dd, steps: [...stepsWithLink, newStep] };
    });
    setEditingId(newStep.id);
  }

  function updateStep(t: 'asIs' | 'toBe', id: string, patch: Partial<FlowStep>) {
    updateDiagram(t, (d) => ({
      ...d,
      steps: d.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function deleteStep(t: 'asIs' | 'toBe', id: string) {
    updateDiagram(t, (d) => ({
      ...d,
      steps: d.steps
        .filter((s) => s.id !== id)
        .map((s) => ({ ...s, next: s.next.filter((nid) => nid !== id) })),
    }));
    if (editingId === id) setEditingId(null);
  }

  function loadSample() {
    setState(SAMPLE);
    setView('asIs');
    setEditingId(null);
  }

  function resetAll() {
    if (!confirm('現在のフローを破棄して空の状態に戻します。よろしいですか？')) return;
    setState(EMPTY);
    setEditingId(null);
  }

  function copyToBeFromAsIs() {
    if (!confirm('As-IsをTo-Beにコピーします（既存のTo-Beは上書き）。続行しますか？')) return;
    setState((prev) => {
      const cloned: FlowDiagram = JSON.parse(JSON.stringify(prev.asIs));
      cloned.title = `${prev.asIs.title}（改善後）`;
      cloned.steps = cloned.steps.map((s) => ({ ...s, pain: '', improvement: '' }));
      return { ...prev, toBe: cloned };
    });
    setView('toBe');
  }

  const editingStep = useMemo(() => {
    if (!editingId || !activeDiagram) return null;
    return activeDiagram.steps.find((s) => s.id === editingId) ?? null;
  }, [editingId, activeDiagram]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden flow-mapper-root">
      <PrintStyles />
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2 no-print">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden text-sm">
          {(['asIs', 'toBe', 'compare'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setView(v);
                setEditingId(null);
              }}
              className={cn(
                'px-4 py-2 font-medium transition-colors first:border-l-0 border-l border-gray-300',
                view === v
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {v === 'asIs' ? 'As-Is（現状）' : v === 'toBe' ? 'To-Be（改善後）' : '比較'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100"
          >
            サンプルを読込
          </button>
          {view === 'toBe' ? (
            <button
              type="button"
              onClick={copyToBeFromAsIs}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              As-Isをコピー
            </button>
          ) : null}
          <ExportMenu state={state} view={view} />
          <button
            type="button"
            onClick={resetAll}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600"
          >
            リセット
          </button>
        </div>
      </div>

      {/* Body */}
      {view === 'compare' ? (
        <CompareView state={state} />
      ) : activeDiagram ? (
        <div className="grid lg:grid-cols-[1fr_340px] gap-0">
          <div className="p-4 md:p-6">
            <input
              type="text"
              value={activeDiagram.title}
              onChange={(e) => updateDiagram(target, (d) => ({ ...d, title: e.target.value }))}
              className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-400 focus:outline-none w-full mb-4 no-print-border"
              placeholder="フロー名を入力"
            />
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs no-print">
              <button
                type="button"
                onClick={() => addPhase(target)}
                className="px-2.5 py-1 font-medium text-primary-700 border border-dashed border-primary-300 rounded hover:bg-primary-50"
              >
                ＋ フェーズ追加
              </button>
              <button
                type="button"
                onClick={() => addLane(target)}
                className="px-2.5 py-1 font-medium text-primary-700 border border-dashed border-primary-300 rounded hover:bg-primary-50"
              >
                ＋ 担当（レーン）追加
              </button>
              <button
                type="button"
                onClick={() => addStep(target)}
                className="px-2.5 py-1 font-medium text-white bg-primary-500 rounded hover:bg-primary-600"
              >
                ＋ ステップ追加
              </button>
            </div>
            <SwimlaneCanvas
              diagram={activeDiagram}
              editingId={editingId}
              onSelect={setEditingId}
              onAddStep={(laneId, phaseId) => addStep(target, laneId, phaseId)}
              onRenameLane={(id, name) => renameLane(target, id, name)}
              onDeleteLane={(id) => deleteLane(target, id)}
              onRenamePhase={(id, name) => renamePhase(target, id, name)}
              onDeletePhase={(id) => deletePhase(target, id)}
            />
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50 no-print">
            {editingStep ? (
              <StepEditor
                key={editingStep.id}
                step={editingStep}
                diagram={activeDiagram}
                view={view}
                onChange={(patch) => updateStep(target, editingStep.id, patch)}
                onDelete={() => deleteStep(target, editingStep.id)}
                onClose={() => setEditingId(null)}
              />
            ) : (
              <EmptyEditor onAddStep={() => addStep(target)} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .flow-mapper-root, .flow-mapper-root * { visibility: visible; }
        .flow-mapper-root { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; }
        .flow-mapper-root .no-print { display: none !important; }
        .flow-mapper-root .no-print-border { border: none !important; }
      }
    `}</style>
  );
}

function SwimlaneCanvas({
  diagram,
  editingId,
  onSelect,
  onAddStep,
  onRenameLane,
  onDeleteLane,
  onRenamePhase,
  onDeletePhase,
}: {
  diagram: FlowDiagram;
  editingId: string | null;
  onSelect: (id: string) => void;
  onAddStep: (laneId: string, phaseId: string) => void;
  onRenameLane: (id: string, name: string) => void;
  onDeleteLane: (id: string) => void;
  onRenamePhase: (id: string, name: string) => void;
  onDeletePhase: (id: string) => void;
}) {
  const layout = useMemo(() => computeLayout(diagram), [diagram]);

  const arrows = useMemo(() => {
    const list: { d: string; key: string; emphasized: boolean }[] = [];
    for (const s of diagram.steps) {
      const from = layout.step.get(s.id);
      if (!from) continue;
      for (const nid of s.next) {
        const to = layout.step.get(nid);
        if (!to) continue;
        list.push({
          key: `${s.id}->${nid}`,
          d: buildArrowPath(from, to),
          emphasized: editingId === s.id || editingId === nid,
        });
      }
    }
    return list;
  }, [diagram, layout, editingId]);

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
      <div
        className="relative"
        style={{ width: layout.width, height: layout.height, minWidth: '100%' }}
      >
        {/* Phase header row */}
        <div
          className="absolute top-0 left-0 bg-gray-50 border-b border-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-500"
          style={{ width: LANE_LABEL_W, height: HEADER_H }}
        >
          フェーズ →
        </div>
        {diagram.phases.map((phase) => {
          const px = layout.phaseX.get(phase.id);
          if (!px) return null;
          return (
            <div
              key={`ph-${phase.id}`}
              className="absolute top-0 bg-primary-50 border-b border-r border-primary-200 flex items-center justify-between px-3 group"
              style={{ left: px.x, width: px.w, height: HEADER_H }}
            >
              <input
                type="text"
                value={phase.name}
                onChange={(e) => onRenamePhase(phase.id, e.target.value)}
                className="bg-transparent text-sm font-bold text-primary-900 focus:outline-none w-full no-print-border"
              />
              {diagram.phases.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`フェーズ「${phase.name}」とそのステップを削除しますか？`))
                      onDeletePhase(phase.id);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 no-print"
                  aria-label="フェーズを削除"
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Lane label column + lane bands */}
        {diagram.lanes.map((lane, laneIdx) => {
          const ly = layout.laneY.get(lane.id);
          if (!ly) return null;
          return (
            <div key={`ln-row-${lane.id}`}>
              {/* Lane label */}
              <div
                className={cn(
                  'absolute left-0 border-r border-gray-300 px-2 flex items-center group',
                  laneIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                )}
                style={{ top: ly.y, width: LANE_LABEL_W, height: ly.h }}
              >
                <input
                  type="text"
                  value={lane.name}
                  onChange={(e) => onRenameLane(lane.id, e.target.value)}
                  className="bg-transparent text-sm font-bold text-primary-900 focus:outline-none w-full no-print-border"
                />
                {diagram.lanes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`担当「${lane.name}」とそのステップを削除しますか？`))
                        onDeleteLane(lane.id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 px-1 opacity-0 group-hover:opacity-100 no-print"
                    aria-label="担当を削除"
                  >
                    ×
                  </button>
                ) : null}
              </div>
              {/* Lane band background */}
              <div
                className={cn(
                  'absolute border-b border-gray-200',
                  laneIdx % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'
                )}
                style={{
                  top: ly.y,
                  left: LANE_LABEL_W,
                  width: layout.width - LANE_LABEL_W,
                  height: ly.h,
                }}
              />
            </div>
          );
        })}

        {/* Phase column dividers */}
        {diagram.phases.map((phase) => {
          const px = layout.phaseX.get(phase.id);
          if (!px) return null;
          return (
            <div
              key={`pdiv-${phase.id}`}
              className="absolute border-r border-dashed border-gray-200 pointer-events-none"
              style={{ left: px.x + px.w, top: HEADER_H, height: layout.height - HEADER_H }}
            />
          );
        })}

        {/* Empty cell add buttons */}
        {diagram.phases.map((phase) =>
          diagram.lanes.map((lane) => {
            const px = layout.phaseX.get(phase.id);
            const ly = layout.laneY.get(lane.id);
            if (!px || !ly) return null;
            const hasStep = diagram.steps.some(
              (s) => s.phaseId === phase.id && s.laneId === lane.id
            );
            if (hasStep) return null;
            return (
              <button
                key={`add-${phase.id}-${lane.id}`}
                type="button"
                onClick={() => onAddStep(lane.id, phase.id)}
                className="absolute text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors no-print"
                style={{
                  left: px.x + PHASE_PAD_X,
                  top: ly.y + LANE_PAD_Y,
                  width: CARD_W,
                  height: CARD_H,
                  border: '1.5px dashed #cbd5e1',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3D4DB7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                ＋ ここに追加
              </button>
            );
          })
        )}

        {/* SVG arrows layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={layout.width}
          height={layout.height}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="fm-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
            </marker>
            <marker
              id="fm-arrow-strong"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="#3D4DB7" />
            </marker>
          </defs>
          {arrows.map((a) => (
            <path
              key={a.key}
              d={a.d}
              fill="none"
              stroke={a.emphasized ? '#3D4DB7' : '#64748b'}
              strokeWidth={a.emphasized ? 2 : 1.5}
              markerEnd={a.emphasized ? 'url(#fm-arrow-strong)' : 'url(#fm-arrow)'}
            />
          ))}
        </svg>

        {/* Steps */}
        {diagram.steps.map((step) => {
          const box = layout.step.get(step.id);
          if (!box) return null;
          return (
            <StepCard
              key={step.id}
              step={step}
              box={box}
              selected={editingId === step.id}
              onSelect={() => onSelect(step.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function StepCard({
  step,
  box,
  selected,
  onSelect,
}: { step: FlowStep; box: LayoutBox; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'absolute text-left border-2 rounded-lg shadow-sm transition-all hover:shadow-md focus:outline-none',
        STEP_TYPE_STYLE[step.type],
        selected && 'ring-2 ring-primary-500 ring-offset-1 z-10'
      )}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div className="px-2 py-1.5 h-full flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-white/80 border border-current/30">
            {STEP_TYPE_LABEL[step.type]}
          </span>
          {step.durationMin > 0 ? (
            <span className="text-[9px] text-gray-500">{fmtMin(step.durationMin)}</span>
          ) : null}
        </div>
        <p className="text-xs font-semibold leading-tight mt-1 line-clamp-2">{step.label}</p>
        <div className="mt-auto text-[9px] text-gray-500 truncate">
          {step.tool ? `🔧 ${step.tool}` : ''}
          {step.pain ? <span className="text-red-700"> ⚠ {step.pain}</span> : null}
          {step.improvement ? (
            <span className="text-emerald-700"> ✓ {step.improvement}</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function StepEditor({
  step,
  diagram,
  view,
  onChange,
  onDelete,
  onClose,
}: {
  step: FlowStep;
  diagram: FlowDiagram;
  view: View;
  onChange: (patch: Partial<FlowStep>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const candidates = diagram.steps.filter((s) => s.id !== step.id);

  function toggleNext(nid: string) {
    const set = new Set(step.next);
    if (set.has(nid)) set.delete(nid);
    else set.add(nid);
    onChange({ next: Array.from(set) });
  }

  return (
    <div className="p-4 max-h-[800px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">ステップを編集</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xs"
        >
          閉じる ×
        </button>
      </div>

      <div className="space-y-3">
        <Field label="内容">
          <input
            type="text"
            value={step.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-primary-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="種別">
            <select
              value={step.type}
              onChange={(e) => onChange({ type: e.target.value as StepType })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {(Object.keys(STEP_TYPE_LABEL) as StepType[]).map((t) => (
                <option key={t} value={t}>
                  {STEP_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="所要時間（分）">
            <input
              type="number"
              min={0}
              value={step.durationMin}
              onChange={(e) => onChange({ durationMin: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="フェーズ">
            <select
              value={step.phaseId}
              onChange={(e) => onChange({ phaseId: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {diagram.phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="担当">
            <select
              value={step.laneId}
              onChange={(e) => onChange({ laneId: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
            >
              {diagram.lanes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="使用ツール">
          <input
            type="text"
            value={step.tool}
            onChange={(e) => onChange({ tool: e.target.value })}
            placeholder="例: Excel, Slack"
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
          />
        </Field>

        {view === 'asIs' ? (
          <Field label="課題・痛み">
            <textarea
              value={step.pain}
              onChange={(e) => onChange({ pain: e.target.value })}
              rows={2}
              placeholder="例: 転記ミスが月3〜5件"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        ) : (
          <Field label="改善ポイント">
            <textarea
              value={step.improvement}
              onChange={(e) => onChange({ improvement: e.target.value })}
              rows={2}
              placeholder="例: 自動化で転記ゼロ"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        )}

        <div>
          <span className="block text-xs font-semibold text-gray-600 mb-1">
            次のステップ（複数選択で分岐）
          </span>
          {candidates.length === 0 ? (
            <p className="text-xs text-gray-400">
              他のステップが無いため接続できません。先にステップを追加してください。
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
              {candidates.map((c) => {
                const checked = step.next.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleNext(c.id)}
                      className="accent-primary-500"
                    />
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-bold border',
                        STEP_TYPE_STYLE[c.type]
                      )}
                    >
                      {STEP_TYPE_LABEL[c.type]}
                    </span>
                    <span className="truncate">{c.label}</span>
                  </label>
                );
              })}
            </div>
          )}
          {step.next.length > 1 ? (
            <p className="mt-1 text-[10px] text-amber-700">
              複数選択中：「判断」種別と組み合わせると分岐になります
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('このステップを削除しますか？')) onDelete();
          }}
          className="w-full px-3 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
        >
          このステップを削除
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
      {children}
    </div>
  );
}

function EmptyEditor({ onAddStep }: { onAddStep: () => void }) {
  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-3">使い方</h3>
      <ol className="text-xs text-gray-600 space-y-2 mb-4 list-decimal list-inside leading-relaxed">
        <li>下の「＋ ここに追加」を押すか「＋ ステップ追加」でステップを作成</li>
        <li>ステップは追加した順に自動で矢印で繋がります</li>
        <li>ステップをクリックして種別・所要時間・ツール・課題などを編集</li>
        <li>分岐させたい場合は「判断」種別にして、編集パネルで複数の「次のステップ」をチェック</li>
        <li>To-Be に切り替えて改善後フローを作成、「比較」で差分を確認</li>
      </ol>
      <button
        type="button"
        onClick={onAddStep}
        className="w-full px-4 py-2 text-xs font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600"
      >
        ＋ 最初のステップを追加
      </button>
      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
        まず試したい方は、ツールバーの「サンプルを読込」で受注〜出荷業務のサンプルデータを開けます。
      </p>
    </div>
  );
}

function CompareView({ state }: { state: State }) {
  const a = totalMinutes(state.asIs);
  const b = totalMinutes(state.toBe);
  const delta = a - b;
  const stepDelta = state.toBe.steps.length - state.asIs.steps.length;
  const laneDelta = state.toBe.lanes.length - state.asIs.lanes.length;
  const pains = state.asIs.steps.filter((s) => s.pain.trim());
  const improvements = state.toBe.steps.filter((s) => s.improvement.trim());

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid md:grid-cols-3 gap-3">
        <Metric
          label="想定リードタイム"
          asIs={fmtMin(a)}
          toBe={fmtMin(b)}
          good={delta > 0}
          delta={delta !== 0 ? `${delta > 0 ? '−' : '+'}${fmtMin(Math.abs(delta))}` : '±0'}
        />
        <Metric
          label="ステップ数"
          asIs={`${state.asIs.steps.length}`}
          toBe={`${state.toBe.steps.length}`}
          good={stepDelta < 0}
          delta={stepDelta === 0 ? '±0' : `${stepDelta > 0 ? '+' : ''}${stepDelta}`}
        />
        <Metric
          label="関与する担当"
          asIs={`${state.asIs.lanes.length}`}
          toBe={`${state.toBe.lanes.length}`}
          good={laneDelta <= 0}
          delta={laneDelta === 0 ? '±0' : `${laneDelta > 0 ? '+' : ''}${laneDelta}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50/40 border border-red-200 rounded-xl">
          <h3 className="text-sm font-bold text-red-900 mb-3">As-Is の課題（{pains.length}件）</h3>
          {pains.length === 0 ? (
            <p className="text-xs text-gray-500">
              As-Is側でステップに「課題・痛み」を記入すると、ここに集約されます。
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-red-900">
              {pains.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="font-semibold whitespace-nowrap">⚠</span>
                  <span>
                    <span className="font-semibold">{s.label}：</span>
                    {s.pain}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl">
          <h3 className="text-sm font-bold text-emerald-900 mb-3">
            To-Be の改善ポイント（{improvements.length}件）
          </h3>
          {improvements.length === 0 ? (
            <p className="text-xs text-gray-500">
              To-Be側でステップに「改善ポイント」を記入すると、ここに集約されます。
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-emerald-900">
              {improvements.map((s) => (
                <li key={s.id} className="flex gap-2">
                  <span className="font-semibold whitespace-nowrap">✓</span>
                  <span>
                    <span className="font-semibold">{s.label}：</span>
                    {s.improvement}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  asIs,
  toBe,
  delta,
  good,
}: { label: string; asIs: string; toBe: string; delta: string; good: boolean }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-soft">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-gray-400">As-Is</span>
        <span className="text-sm font-semibold text-gray-700">{asIs}</span>
        <span className="text-xs text-gray-400 mx-1">→</span>
        <span className="text-xs text-gray-400">To-Be</span>
        <span className="text-base font-bold text-primary-600">{toBe}</span>
      </div>
      <p className={cn('mt-2 text-xs font-bold', good ? 'text-emerald-600' : 'text-gray-500')}>
        {good ? '↓改善' : ''} {delta}
      </p>
    </div>
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function diagramToSvg(d: FlowDiagram, label: string): string {
  const layout = computeLayout(d);
  const W = layout.width;
  const H = layout.height + 36;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Hiragino Sans, Noto Sans JP, sans-serif">`
  );
  parts.push('<defs>');
  parts.push(
    '<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>'
  );
  parts.push('</defs>');
  parts.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  parts.push(
    `<text x="12" y="22" font-size="14" font-weight="bold" fill="#001738">${escapeXml(label)}：${escapeXml(d.title)}</text>`
  );

  // shift layout down for title
  const offsetY = 32;

  // Phase headers
  parts.push(
    `<rect x="0" y="${offsetY}" width="${LANE_LABEL_W}" height="${HEADER_H}" fill="#f9fafb" stroke="#d1d5db"/>`
  );
  for (const phase of d.phases) {
    const px = layout.phaseX.get(phase.id);
    if (!px) continue;
    parts.push(
      `<rect x="${px.x}" y="${offsetY}" width="${px.w}" height="${HEADER_H}" fill="#eef0fb" stroke="#c7caee"/>`
    );
    parts.push(
      `<text x="${px.x + 8}" y="${offsetY + HEADER_H / 2 + 5}" font-size="13" font-weight="bold" fill="#001738">${escapeXml(phase.name)}</text>`
    );
  }

  // Lane labels & bands
  d.lanes.forEach((lane, idx) => {
    const ly = layout.laneY.get(lane.id);
    if (!ly) return;
    const bandFill = idx % 2 === 0 ? '#fafafa' : '#ffffff';
    parts.push(
      `<rect x="${LANE_LABEL_W}" y="${ly.y + offsetY}" width="${W - LANE_LABEL_W}" height="${ly.h}" fill="${bandFill}" stroke="#e5e7eb"/>`
    );
    parts.push(
      `<rect x="0" y="${ly.y + offsetY}" width="${LANE_LABEL_W}" height="${ly.h}" fill="${bandFill}" stroke="#d1d5db"/>`
    );
    parts.push(
      `<text x="8" y="${ly.y + offsetY + ly.h / 2 + 5}" font-size="13" font-weight="bold" fill="#001738">${escapeXml(lane.name)}</text>`
    );
  });

  // Arrows
  for (const s of d.steps) {
    const from = layout.step.get(s.id);
    if (!from) continue;
    for (const nid of s.next) {
      const to = layout.step.get(nid);
      if (!to) continue;
      const fromShifted: LayoutBox = { ...from, y: from.y + offsetY };
      const toShifted: LayoutBox = { ...to, y: to.y + offsetY };
      const path = buildArrowPath(fromShifted, toShifted);
      parts.push(
        `<path d="${path}" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>`
      );
    }
  }

  // Steps
  for (const s of d.steps) {
    const box = layout.step.get(s.id);
    if (!box) continue;
    const fill = STEP_TYPE_FILL[s.type];
    const stroke = STEP_TYPE_STROKE[s.type];
    parts.push(
      `<rect x="${box.x}" y="${box.y + offsetY}" width="${box.w}" height="${box.h}" rx="6" ry="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`
    );
    parts.push(
      `<text x="${box.x + 8}" y="${box.y + offsetY + 16}" font-size="9" font-weight="bold" fill="#374151">[${escapeXml(STEP_TYPE_LABEL[s.type])}]${s.durationMin > 0 ? ` ${fmtMin(s.durationMin)}` : ''}</text>`
    );
    // wrap label
    const maxChars = 18;
    const label1 = s.label.slice(0, maxChars);
    const label2 = s.label.length > maxChars ? s.label.slice(maxChars, maxChars * 2) : '';
    parts.push(
      `<text x="${box.x + 8}" y="${box.y + offsetY + 34}" font-size="11" font-weight="bold" fill="#111827">${escapeXml(label1)}</text>`
    );
    if (label2)
      parts.push(
        `<text x="${box.x + 8}" y="${box.y + offsetY + 48}" font-size="11" font-weight="bold" fill="#111827">${escapeXml(label2)}</text>`
      );
    if (s.tool) {
      parts.push(
        `<text x="${box.x + 8}" y="${box.y + offsetY + 62}" font-size="9" fill="#6b7280">🔧 ${escapeXml(s.tool.slice(0, 20))}</text>`
      );
    }
  }

  parts.push('</svg>');
  return parts.join('');
}

async function svgToPng(svg: string, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas context not available'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

function ExportMenu({ state, view }: { state: State; view: View }) {
  const [open, setOpen] = useState(false);
  const ts = new Date().toISOString().slice(0, 10);
  const currentDiagram = view === 'toBe' ? state.toBe : state.asIs;
  const currentLabel = view === 'toBe' ? 'To-Be' : 'As-Is';

  function exportJson() {
    download(`flow-mapper-${ts}.json`, JSON.stringify(state, null, 2), 'application/json');
    setOpen(false);
  }

  function exportMd() {
    download(`flow-mapper-${ts}.md`, exportMarkdown(state), 'text/markdown');
    setOpen(false);
  }

  function exportSvg() {
    const svg = diagramToSvg(currentDiagram, currentLabel);
    download(`flow-mapper-${currentLabel}-${ts}.svg`, svg, 'image/svg+xml');
    setOpen(false);
  }

  async function exportPng() {
    try {
      const svg = diagramToSvg(currentDiagram, currentLabel);
      const blob = await svgToPng(svg, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-mapper-${currentLabel}-${ts}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`PNG変換に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
    setOpen(false);
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as State;
        if (!parsed?.asIs?.lanes || !parsed?.toBe?.lanes || !parsed?.asIs?.phases)
          throw new Error('invalid');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        location.reload();
      } catch {
        alert('JSONの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    setOpen(false);
  }

  function printView() {
    window.print();
    setOpen(false);
  }

  const isCompareView = view === 'compare';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 border border-primary-600 rounded-lg hover:bg-primary-600"
      >
        エクスポート ▾
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="閉じる"
            className="fixed inset-0 z-10 bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-medium z-20 overflow-hidden">
            <button
              type="button"
              onClick={exportPng}
              disabled={isCompareView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
            >
              PNG画像でダウンロード（{currentLabel}）
            </button>
            <button
              type="button"
              onClick={exportSvg}
              disabled={isCompareView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 disabled:text-gray-300 disabled:hover:bg-white"
            >
              SVG画像でダウンロード（{currentLabel}）
            </button>
            <button
              type="button"
              onClick={exportMd}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              Markdownでダウンロード（全体）
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              JSONでダウンロード（再読込可）
            </button>
            <label
              htmlFor="flow-mapper-import"
              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 cursor-pointer"
            >
              JSONを読み込む
            </label>
            <input
              id="flow-mapper-import"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importJson}
            />
            <button
              type="button"
              onClick={printView}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100"
            >
              印刷／PDF保存
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
