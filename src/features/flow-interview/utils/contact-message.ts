import type { FlowDiagram } from '@/features/flow-mapper/types';
import type { FlowSuggestion } from '@/lib/flow-interview/suggest';

type Args = {
  diagram: FlowDiagram;
  suggestions?: FlowSuggestion[] | null;
  suggestSummary?: string | null;
  rfpMarkdown?: string | null;
};

// 「話すだけ発注準備」で作成した As-Is / To-Be / RFP を、問い合わせメッセージ用テキストに整形する。
// /contact の message 欄に流し込まれ、/api/contact 経由で Slack に届く（リード情報の取りこぼし防止）。
export function buildContactMessage({
  diagram,
  suggestions,
  suggestSummary,
  rfpMarkdown,
}: Args): string {
  const lines: string[] = ['【「話すだけ発注準備」で作成した内容】', ''];

  lines.push(`■ 現状業務（As-Is）: ${diagram.title}`);
  const laneName = new Map(diagram.lanes.map((l) => [l.id, l.name]));
  let i = 1;
  for (const s of diagram.steps) {
    const lane = laneName.get(s.laneId) ?? '担当';
    const extra = [s.tool && `ツール:${s.tool}`, s.pain && `課題:${s.pain}`]
      .filter(Boolean)
      .join(' / ');
    lines.push(`${i}. [${lane}] ${s.label}${extra ? `（${extra}）` : ''}`);
    i += 1;
  }

  if (suggestions && suggestions.length > 0) {
    lines.push('', '■ AI改善案（To-Be）');
    if (suggestSummary) lines.push(suggestSummary);
    for (const s of suggestions) lines.push(`- [${s.kind}] ${s.title}: ${s.effect}`);
  }

  if (rfpMarkdown) {
    lines.push('', '■ RFPドラフト', rfpMarkdown);
  }

  return lines.join('\n');
}
