import { STEP_TYPE_LABEL } from '../constants';
import type { FlowDiagram, FlowStep } from '../types';

export function mermaidNodeId(id: string): string {
  return `n_${id}`;
}

export function escapeMermaidLabel(s: string): string {
  return s
    .replace(/"/g, '#quot;')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

export function mermaidNode(step: FlowStep): string {
  const id = mermaidNodeId(step.id);
  const label = `"${escapeMermaidLabel(step.label || STEP_TYPE_LABEL[step.type])}"`;
  switch (step.type) {
    case 'start':
    case 'end':
      return `${id}([${label}])`;
    case 'decision':
      return `${id}{${label}}`;
    case 'system':
      return `${id}[[${label}]]`;
    case 'wait':
      return `${id}[/${label}/]`;
    default:
      return `${id}[${label}]`;
  }
}

export function diagramToMermaid(d: FlowDiagram, label: string): string {
  const lines: string[] = [];
  lines.push(`%% ${escapeMermaidLabel(label)}: ${escapeMermaidLabel(d.title || '')}`);
  lines.push('flowchart LR');
  lines.push('  classDef cls_start fill:#d1fae5,stroke:#10b981,color:#064e3b');
  lines.push('  classDef cls_task fill:#ffffff,stroke:#9ca3af,color:#111827');
  lines.push('  classDef cls_decision fill:#fef3c7,stroke:#f59e0b,color:#78350f');
  lines.push('  classDef cls_system fill:#e0f2fe,stroke:#0ea5e9,color:#0c4a6e');
  lines.push('  classDef cls_wait fill:#f3f4f6,stroke:#9ca3af,color:#374151');
  lines.push('  classDef cls_end fill:#ffe4e6,stroke:#f43f5e,color:#881337');

  const byLane = new Map<string, FlowStep[]>();
  for (const lane of d.lanes) byLane.set(lane.id, []);
  for (const s of d.steps) {
    if (!byLane.has(s.laneId)) byLane.set(s.laneId, []);
    byLane.get(s.laneId)?.push(s);
  }

  for (const lane of d.lanes) {
    const steps = byLane.get(lane.id) ?? [];
    if (!steps.length) continue;
    const safeName = escapeMermaidLabel(lane.name || '担当');
    lines.push(`  subgraph lane_${lane.id}["${safeName}"]`);
    for (const s of steps) {
      lines.push(`    ${mermaidNode(s)}`);
    }
    lines.push('  end');
  }

  const stepIds = new Set(d.steps.map((s) => s.id));
  for (const s of d.steps) {
    for (const nid of s.next) {
      if (!stepIds.has(nid)) continue;
      lines.push(`  ${mermaidNodeId(s.id)} --> ${mermaidNodeId(nid)}`);
    }
  }

  for (const s of d.steps) {
    lines.push(`  class ${mermaidNodeId(s.id)} cls_${s.type}`);
  }

  return lines.join('\n');
}
