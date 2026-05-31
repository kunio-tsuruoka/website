import { describe, expect, test } from 'vitest';
import { LlmDiagramSchema, normalizeToFlowDiagram } from './diagram-schema';

describe('normalizeToFlowDiagram', () => {
  test('lane/phase 名を実IDにマップし、直列接続を補完する', () => {
    const d = normalizeToFlowDiagram({
      title: '請求業務',
      lanes: ['営業', '経理'],
      phases: ['フロー'],
      steps: [
        { label: '売上入力', type: 'start', lane: '営業', phase: 'フロー' },
        { label: '確認', type: 'task', lane: '経理', phase: 'フロー' },
        { label: '完了', type: 'end', lane: '経理', phase: 'フロー' },
      ],
    });

    expect(d.title).toBe('請求業務');
    expect(d.lanes.map((l) => l.name)).toEqual(['営業', '経理']);
    expect(d.steps).toHaveLength(3);
    // step.laneId は実在の lane id を指す
    const laneIds = new Set(d.lanes.map((l) => l.id));
    for (const s of d.steps) expect(laneIds.has(s.laneId)).toBe(true);
    // 直列接続: 1→2→3、end は next 空
    expect(d.steps[0].next).toEqual([d.steps[1].id]);
    expect(d.steps[1].next).toEqual([d.steps[2].id]);
    expect(d.steps[2].next).toEqual([]);
  });

  test('明示 next(index) を実 step id に解決し、自己参照は除去する', () => {
    const d = normalizeToFlowDiagram({
      title: 't',
      lanes: ['A'],
      phases: ['P'],
      steps: [
        { label: 's0', type: 'start', lane: 'A', phase: 'P', next: [2] },
        { label: 's1', type: 'task', lane: 'A', phase: 'P', next: [1] }, // 自己参照→除去
        { label: 's2', type: 'end', lane: 'A', phase: 'P' },
      ],
    });
    expect(d.steps[0].next).toEqual([d.steps[2].id]);
    expect(d.steps[1].next).toEqual([]); // 自己参照のみ→空
  });

  test('範囲外の next index は捨てる', () => {
    const d = normalizeToFlowDiagram({
      title: 't',
      lanes: ['A'],
      phases: ['P'],
      steps: [{ label: 's0', type: 'task', lane: 'A', phase: 'P', next: [99] }],
    });
    expect(d.steps[0].next).toEqual([]);
  });

  test('lane/phase 未宣言でも step 参照名から補い、空なら既定値を入れる', () => {
    const d = normalizeToFlowDiagram({
      title: '',
      lanes: [],
      phases: [],
      steps: [{ label: '作業', type: 'task', lane: '担当X', phase: '工程Y' }],
    });
    expect(d.title).toBe('業務フロー'); // 空タイトルの既定
    expect(d.lanes.map((l) => l.name)).toContain('担当X');
    expect(d.phases.map((p) => p.name)).toContain('工程Y');
  });

  test('未宣言の lane 名は新しいレーンとして追加され、step はそこを指す', () => {
    const d = normalizeToFlowDiagram({
      title: 't',
      lanes: ['A', 'B'],
      phases: ['P'],
      steps: [{ label: '作業', type: 'task', lane: '追加担当', phase: 'P' }],
    });
    // 未宣言名は宣言漏れ補完として追加される
    expect(d.lanes.map((l) => l.name)).toEqual(['A', 'B', '追加担当']);
    const added = d.lanes.find((l) => l.name === '追加担当');
    expect(d.steps[0].laneId).toBe(added?.id);
  });

  test('lane が空文字の step は先頭レーンにフォールバックする', () => {
    const d = normalizeToFlowDiagram({
      title: 't',
      lanes: ['A', 'B'],
      phases: ['P'],
      steps: [{ label: '作業', type: 'task', lane: '', phase: 'P' }],
    });
    expect(d.steps[0].laneId).toBe(d.lanes[0].id);
  });

  test('LlmDiagramSchema は欠損フィールドを既定で補完する', () => {
    const parsed = LlmDiagramSchema.parse({ steps: [{ label: 'x' }] });
    expect(parsed.title).toBe('業務フロー');
    expect(parsed.lanes).toEqual([]);
    expect(parsed.steps[0].type).toBe('task'); // type 既定
  });
});
