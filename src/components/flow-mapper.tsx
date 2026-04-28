import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

type StepType = 'start' | 'task' | 'decision' | 'system' | 'wait' | 'end';

type FlowStep = {
  id: string;
  type: StepType;
  laneId: string;
  label: string;
  durationMin: number;
  tool: string;
  pain: string;
  improvement: string;
};

type FlowLane = {
  id: string;
  name: string;
};

type FlowDiagram = {
  title: string;
  lanes: FlowLane[];
  steps: FlowStep[];
};

type View = 'asIs' | 'toBe' | 'compare';

type State = {
  asIs: FlowDiagram;
  toBe: FlowDiagram;
};

const STORAGE_KEY = 'beekle-flow-mapper-v1';

const STEP_TYPE_LABEL: Record<StepType, string> = {
  start: '開始',
  task: '作業',
  decision: '判断',
  system: 'システム',
  wait: '待ち',
  end: '完了',
};

const STEP_TYPE_STYLE: Record<StepType, string> = {
  start: 'bg-emerald-100 border-emerald-400 text-emerald-900',
  task: 'bg-white border-gray-300 text-gray-900',
  decision: 'bg-amber-100 border-amber-400 text-amber-900',
  system: 'bg-sky-100 border-sky-400 text-sky-900',
  wait: 'bg-gray-100 border-gray-400 text-gray-700',
  end: 'bg-rose-100 border-rose-400 text-rose-900',
};

const SAMPLE: State = {
  asIs: {
    title: '受注〜出荷業務',
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
        label: 'メール／FAXで注文',
        durationMin: 0,
        tool: 'メール／FAX',
        pain: '',
        improvement: '',
      },
      {
        id: 's2',
        type: 'task',
        laneId: 'l2',
        label: '内容を確認し営業が転記',
        durationMin: 15,
        tool: 'Excel',
        pain: '転記ミスが月3〜5件',
        improvement: '',
      },
      {
        id: 's3',
        type: 'task',
        laneId: 'l3',
        label: '事務が在庫を電話で確認',
        durationMin: 20,
        tool: '電話',
        pain: '倉庫が忙しいと折返し待ち',
        improvement: '',
      },
      {
        id: 's4',
        type: 'decision',
        laneId: 'l3',
        label: '在庫あり？',
        durationMin: 5,
        tool: '',
        pain: '',
        improvement: '',
      },
      {
        id: 's5',
        type: 'task',
        laneId: 'l3',
        label: '注文書を紙で印刷',
        durationMin: 10,
        tool: 'プリンタ',
        pain: '紙の行き来で半日ロス',
        improvement: '',
      },
      {
        id: 's6',
        type: 'task',
        laneId: 'l4',
        label: 'ピッキング・出荷準備',
        durationMin: 60,
        tool: '紙の指示書',
        pain: '指示書の紛失あり',
        improvement: '',
      },
      {
        id: 's7',
        type: 'task',
        laneId: 'l3',
        label: '送り状を手書き',
        durationMin: 15,
        tool: 'ペン／伝票',
        pain: '宛名ミス',
        improvement: '',
      },
      {
        id: 's8',
        type: 'end',
        laneId: 'l4',
        label: '集荷・出荷',
        durationMin: 10,
        tool: '',
        pain: '',
        improvement: '',
      },
    ],
  },
  toBe: {
    title: '受注〜出荷業務（DX後）',
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
        label: 'Webフォームで注文',
        durationMin: 0,
        tool: '受注Webフォーム',
        pain: '',
        improvement: '入力規則で誤注文を未然防止',
      },
      {
        id: 's2',
        type: 'system',
        laneId: 'l5',
        label: '在庫を自動引当',
        durationMin: 0,
        tool: '在庫API',
        pain: '',
        improvement: '電話確認を撤廃',
      },
      {
        id: 's3',
        type: 'decision',
        laneId: 'l5',
        label: '在庫あり？',
        durationMin: 0,
        tool: '',
        pain: '',
        improvement: '',
      },
      {
        id: 's4',
        type: 'task',
        laneId: 'l2',
        label: '営業は通知のみ確認',
        durationMin: 2,
        tool: 'Slack通知',
        pain: '',
        improvement: '転記作業ゼロ',
      },
      {
        id: 's5',
        type: 'system',
        laneId: 'l5',
        label: 'ピッキング指示を自動生成',
        durationMin: 0,
        tool: 'WMS',
        pain: '',
        improvement: '紙の指示書を廃止',
      },
      {
        id: 's6',
        type: 'task',
        laneId: 'l4',
        label: 'ハンディでピッキング',
        durationMin: 40,
        tool: 'ハンディ端末',
        pain: '',
        improvement: '誤出荷を検知',
      },
      {
        id: 's7',
        type: 'system',
        laneId: 'l5',
        label: '送り状を自動発行',
        durationMin: 0,
        tool: '配送API',
        pain: '',
        improvement: '宛名ミスを撲滅',
      },
      {
        id: 's8',
        type: 'end',
        laneId: 'l4',
        label: '集荷・出荷',
        durationMin: 5,
        tool: '',
        pain: '',
        improvement: '',
      },
    ],
  },
};

const EMPTY: State = {
  asIs: { title: '現状の業務フロー', lanes: [{ id: 'l1', name: '担当者A' }], steps: [] },
  toBe: { title: '改善後の業務フロー', lanes: [{ id: 'l1', name: '担当者A' }], steps: [] },
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
    if (parsed?.asIs?.lanes && parsed?.toBe?.lanes) return parsed;
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
  lines.push(`- 担当者数: ${d.lanes.length}名／部署`);
  lines.push(`- ステップ数: ${d.steps.length}`);
  lines.push(`- 想定リードタイム合計: ${fmtMin(totalMinutes(d))}`);
  lines.push('');
  lines.push('| # | 担当 | 種別 | 内容 | 時間 | 使用ツール | 課題／改善 |');
  lines.push('|---|------|------|------|------|------------|------------|');
  for (let i = 0; i < d.steps.length; i++) {
    const s = d.steps[i];
    const lane = d.lanes.find((l) => l.id === s.laneId)?.name ?? '-';
    const note = s.pain || s.improvement || '';
    lines.push(
      `| ${i + 1} | ${lane} | ${STEP_TYPE_LABEL[s.type]} | ${s.label} | ${s.durationMin || 0}分 | ${s.tool || '-'} | ${note.replace(/\|/g, '/').replace(/\n/g, ' ') || '-'} |`
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

function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

  const activeDiagram: FlowDiagram | null = view === 'compare' ? null : state[view];

  function updateDiagram(target: 'asIs' | 'toBe', mutator: (d: FlowDiagram) => FlowDiagram) {
    setState((prev) => ({ ...prev, [target]: mutator(prev[target]) }));
  }

  function addLane(target: 'asIs' | 'toBe') {
    updateDiagram(target, (d) => ({
      ...d,
      lanes: [...d.lanes, { id: uid(), name: `担当者${d.lanes.length + 1}` }],
    }));
  }

  function renameLane(target: 'asIs' | 'toBe', laneId: string, name: string) {
    updateDiagram(target, (d) => ({
      ...d,
      lanes: d.lanes.map((l) => (l.id === laneId ? { ...l, name } : l)),
    }));
  }

  function deleteLane(target: 'asIs' | 'toBe', laneId: string) {
    updateDiagram(target, (d) => {
      if (d.lanes.length <= 1) return d;
      const remaining = d.lanes.filter((l) => l.id !== laneId);
      return {
        ...d,
        lanes: remaining,
        steps: d.steps.filter((s) => s.laneId !== laneId),
      };
    });
  }

  function addStep(target: 'asIs' | 'toBe', laneId?: string) {
    const newStep: FlowStep = {
      id: uid(),
      type: 'task',
      laneId: laneId ?? state[target].lanes[0]?.id ?? '',
      label: '新しいステップ',
      durationMin: 10,
      tool: '',
      pain: '',
      improvement: '',
    };
    updateDiagram(target, (d) => ({ ...d, steps: [...d.steps, newStep] }));
    setEditingId(newStep.id);
  }

  function updateStep(target: 'asIs' | 'toBe', stepId: string, patch: Partial<FlowStep>) {
    updateDiagram(target, (d) => ({
      ...d,
      steps: d.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    }));
  }

  function deleteStep(target: 'asIs' | 'toBe', stepId: string) {
    updateDiagram(target, (d) => ({ ...d, steps: d.steps.filter((s) => s.id !== stepId) }));
    if (editingId === stepId) setEditingId(null);
  }

  function moveStep(target: 'asIs' | 'toBe', stepId: string, dir: -1 | 1) {
    updateDiagram(target, (d) => {
      const idx = d.steps.findIndex((s) => s.id === stepId);
      if (idx < 0) return d;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= d.steps.length) return d;
      const next = [...d.steps];
      const [moved] = next.splice(idx, 1);
      next.splice(newIdx, 0, moved);
      return { ...d, steps: next };
    });
  }

  function loadSample() {
    setState(SAMPLE);
    setView('asIs');
  }

  function resetAll() {
    if (!confirm('現在のフローを破棄して空の状態に戻します。よろしいですか？')) return;
    setState(EMPTY);
    setEditingId(null);
  }

  function copyToBeFromAsIs() {
    if (!confirm('As-Isの内容をTo-Beにコピーします（既存のTo-Beは上書きされます）。続行しますか？'))
      return;
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

  const target: 'asIs' | 'toBe' = view === 'toBe' ? 'toBe' : 'asIs';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setView('asIs')}
            className={cn(
              'px-4 py-2 font-medium transition-colors',
              view === 'asIs' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            As-Is（現状）
          </button>
          <button
            type="button"
            onClick={() => setView('toBe')}
            className={cn(
              'px-4 py-2 font-medium border-l border-gray-300 transition-colors',
              view === 'toBe' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            To-Be（改善後）
          </button>
          <button
            type="button"
            onClick={() => setView('compare')}
            className={cn(
              'px-4 py-2 font-medium border-l border-gray-300 transition-colors',
              view === 'compare' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            比較
          </button>
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
          <ExportMenu state={state} />
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
        <div className="grid lg:grid-cols-[1fr_320px] gap-0">
          <div className="p-4 md:p-6 overflow-x-auto">
            <input
              type="text"
              value={activeDiagram.title}
              onChange={(e) => updateDiagram(target, (d) => ({ ...d, title: e.target.value }))}
              className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-primary-400 focus:outline-none w-full mb-4"
              placeholder="フロー名を入力"
            />
            <SwimlaneCanvas
              diagram={activeDiagram}
              editingId={editingId}
              onSelect={setEditingId}
              onMove={(id, dir) => moveStep(target, id, dir)}
              onAddStep={(laneId) => addStep(target, laneId)}
              onAddLane={() => addLane(target)}
              onRenameLane={(id, name) => renameLane(target, id, name)}
              onDeleteLane={(id) => deleteLane(target, id)}
            />
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
            {editingStep ? (
              <StepEditor
                key={editingStep.id}
                step={editingStep}
                lanes={activeDiagram.lanes}
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

function SwimlaneCanvas({
  diagram,
  editingId,
  onSelect,
  onMove,
  onAddStep,
  onAddLane,
  onRenameLane,
  onDeleteLane,
}: {
  diagram: FlowDiagram;
  editingId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onAddStep: (laneId: string) => void;
  onAddLane: () => void;
  onRenameLane: (id: string, name: string) => void;
  onDeleteLane: (id: string) => void;
}) {
  const stepRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([]);

  const stepsByLane = useMemo(() => {
    const map: Record<string, FlowStep[]> = {};
    for (const l of diagram.lanes) {
      map[l.id] = [];
    }
    for (const s of diagram.steps) {
      if (!map[s.laneId]) map[s.laneId] = [];
      map[s.laneId].push(s);
    }
    return map;
  }, [diagram]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    function recompute() {
      const rect = container.getBoundingClientRect();
      const next: { d: string; key: string }[] = [];
      for (let i = 0; i < diagram.steps.length - 1; i++) {
        const a = stepRefs.current.get(diagram.steps[i].id);
        const b = stepRefs.current.get(diagram.steps[i + 1].id);
        if (!a || !b) continue;
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        const x1 = ar.left - rect.left + ar.width / 2;
        const y1 = ar.top - rect.top + ar.height;
        const x2 = br.left - rect.left + br.width / 2;
        const y2 = br.top - rect.top;
        const cy = (y1 + y2) / 2;
        next.push({
          key: `${diagram.steps[i].id}->${diagram.steps[i + 1].id}`,
          d: `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2 - 8}`,
        });
      }
      setPaths(next);
    }
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [diagram]);

  const minColWidth = 200;

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${diagram.lanes.length}, minmax(${minColWidth}px, 1fr)) auto`,
        }}
      >
        {/* Lane headers */}
        {diagram.lanes.map((lane) => (
          <LaneHeader
            key={`h-${lane.id}`}
            lane={lane}
            canDelete={diagram.lanes.length > 1}
            onRename={(name) => onRenameLane(lane.id, name)}
            onDelete={() => onDeleteLane(lane.id)}
          />
        ))}
        <button
          type="button"
          onClick={onAddLane}
          className="self-start px-3 py-2 text-xs font-medium text-primary-700 border border-dashed border-primary-300 rounded-lg hover:bg-primary-50 whitespace-nowrap"
        >
          ＋ 担当を追加
        </button>

        {/* Lane bodies */}
        {diagram.lanes.map((lane) => (
          <div
            key={`b-${lane.id}`}
            className="flex flex-col gap-3 min-h-[200px] border-l-2 border-dashed border-gray-200 pl-3"
          >
            {(stepsByLane[lane.id] ?? []).map((step) => (
              <StepCard
                key={step.id}
                step={step}
                selected={editingId === step.id}
                onSelect={() => onSelect(step.id)}
                onMoveUp={() => onMove(step.id, -1)}
                onMoveDown={() => onMove(step.id, 1)}
                refCallback={(el) => {
                  if (el) stepRefs.current.set(step.id, el);
                  else stepRefs.current.delete(step.id);
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => onAddStep(lane.id)}
              className="px-3 py-2 text-xs text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors"
            >
              ＋ ステップを追加
            </button>
          </div>
        ))}
        <div />
      </div>

      {/* Arrows overlay */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <marker
            id="fm-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
          </marker>
        </defs>
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            markerEnd="url(#fm-arrow)"
          />
        ))}
      </svg>
    </div>
  );
}

function LaneHeader({
  lane,
  canDelete,
  onRename,
  onDelete,
}: {
  lane: FlowLane;
  canDelete: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="px-3 py-2 bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-lg flex items-center justify-between gap-2">
      <input
        type="text"
        value={lane.name}
        onChange={(e) => onRename(e.target.value)}
        className="bg-transparent text-sm font-bold text-primary-900 focus:outline-none w-full"
      />
      {canDelete ? (
        <button
          type="button"
          onClick={() => {
            if (confirm(`担当「${lane.name}」とそのステップを削除しますか？`)) onDelete();
          }}
          className="text-xs text-gray-400 hover:text-red-500 px-1"
          aria-label="担当を削除"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

function StepCard({
  step,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  refCallback,
}: {
  step: FlowStep;
  selected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  refCallback: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={refCallback}
      className={cn(
        'group relative border-2 rounded-xl shadow-sm transition-all hover:shadow-md',
        STEP_TYPE_STYLE[step.type],
        selected && 'ring-2 ring-primary-400 ring-offset-1'
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left px-3 py-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-xl"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white/70 border border-current/20">
            {STEP_TYPE_LABEL[step.type]}
          </span>
          {step.durationMin > 0 ? (
            <span className="text-[10px] text-gray-500">{fmtMin(step.durationMin)}</span>
          ) : null}
        </div>
        <p className="text-sm font-semibold leading-snug">{step.label}</p>
        {step.tool ? <p className="mt-1 text-[11px] text-gray-500">🔧 {step.tool}</p> : null}
        {step.pain ? <p className="mt-1 text-[11px] text-red-700">⚠ {step.pain}</p> : null}
        {step.improvement ? (
          <p className="mt-1 text-[11px] text-emerald-700">✓ {step.improvement}</p>
        ) : null}
      </button>
      <div className="absolute top-1.5 right-1.5 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded">
        <button
          type="button"
          onClick={onMoveUp}
          className="text-gray-400 hover:text-gray-700 px-1 text-xs"
          aria-label="上へ"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          className="text-gray-400 hover:text-gray-700 px-1 text-xs"
          aria-label="下へ"
        >
          ↓
        </button>
      </div>
    </div>
  );
}

function StepEditor({
  step,
  lanes,
  view,
  onChange,
  onDelete,
  onClose,
}: {
  step: FlowStep;
  lanes: FlowLane[];
  view: View;
  onChange: (patch: Partial<FlowStep>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-4 sticky top-4">
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

        <Field label="担当">
          <select
            value={step.laneId}
            onChange={(e) => onChange({ laneId: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
          >
            {lanes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="所要時間（分）">
            <input
              type="number"
              min={0}
              value={step.durationMin}
              onChange={(e) => onChange({ durationMin: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
            />
          </Field>
          <Field label="使用ツール">
            <input
              type="text"
              value={step.tool}
              onChange={(e) => onChange({ tool: e.target.value })}
              placeholder="例: Excel"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
            />
          </Field>
        </div>

        {view === 'asIs' ? (
          <Field label="課題・痛み">
            <textarea
              value={step.pain}
              onChange={(e) => onChange({ pain: e.target.value })}
              rows={3}
              placeholder="例: 転記ミスが月3〜5件"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        ) : (
          <Field label="改善ポイント">
            <textarea
              value={step.improvement}
              onChange={(e) => onChange({ improvement: e.target.value })}
              rows={3}
              placeholder="例: 自動化で転記ゼロ"
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 resize-none"
            />
          </Field>
        )}

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
    // biome-ignore lint/a11y/noLabelWithoutControl: input is passed as children
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function EmptyEditor({ onAddStep }: { onAddStep: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-gray-500 mb-3">
        ステップをクリックすると右側で詳細を編集できます。
      </p>
      <button
        type="button"
        onClick={onAddStep}
        className="px-4 py-2 text-xs font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600"
      >
        ＋ 最初のステップを追加
      </button>
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

      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">並べて比較</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <MiniDiagram label="As-Is" diagram={state.asIs} />
          <MiniDiagram label="To-Be" diagram={state.toBe} />
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

function MiniDiagram({ label, diagram }: { label: string; diagram: FlowDiagram }) {
  const stepsByLane = useMemo(() => {
    const map: Record<string, FlowStep[]> = {};
    for (const l of diagram.lanes) {
      map[l.id] = [];
    }
    for (const s of diagram.steps) {
      if (!map[s.laneId]) map[s.laneId] = [];
      map[s.laneId].push(s);
    }
    return map;
  }, [diagram]);

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-xs font-bold text-gray-500 mb-2">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mb-3">{diagram.title}</p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${diagram.lanes.length}, minmax(0, 1fr))` }}
      >
        {diagram.lanes.map((l) => (
          <div
            key={l.id}
            className="px-2 py-1 bg-primary-50 border border-primary-200 rounded text-[10px] font-bold text-primary-900 truncate"
          >
            {l.name}
          </div>
        ))}
        {diagram.lanes.map((l) => (
          <div
            key={`b-${l.id}`}
            className="flex flex-col gap-1 border-l border-dashed border-gray-300 pl-1"
          >
            {(stepsByLane[l.id] ?? []).map((s) => (
              <div
                key={s.id}
                className={cn(
                  'px-2 py-1 text-[10px] border rounded truncate',
                  STEP_TYPE_STYLE[s.type]
                )}
                title={s.label}
              >
                {s.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportMenu({ state }: { state: State }) {
  const [open, setOpen] = useState(false);

  function exportJson() {
    const ts = new Date().toISOString().slice(0, 10);
    download(`flow-mapper-${ts}.json`, JSON.stringify(state, null, 2), 'application/json');
    setOpen(false);
  }

  function exportMd() {
    const ts = new Date().toISOString().slice(0, 10);
    download(`flow-mapper-${ts}.md`, exportMarkdown(state), 'text/markdown');
    setOpen(false);
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as State;
        if (!parsed?.asIs?.lanes || !parsed?.toBe?.lanes) throw new Error('invalid');
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
          <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-medium z-20 overflow-hidden">
            <button
              type="button"
              onClick={exportMd}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
            >
              Markdownでダウンロード
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
