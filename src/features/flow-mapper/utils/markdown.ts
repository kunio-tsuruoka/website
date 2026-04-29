import { STEP_TYPE_LABEL } from '../constants';
import type { FlowDiagram, State } from '../types';
import { totalMinutes } from './cost';
import { fmtMin } from './format';

export function diagramToMarkdown(label: string, d: FlowDiagram): string {
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

export function diffSummary(asIs: FlowDiagram, toBe: FlowDiagram): string {
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

export function exportMarkdown(state: State): string {
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

export function downloadFile(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
