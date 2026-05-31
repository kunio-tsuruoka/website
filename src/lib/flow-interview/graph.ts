import type { Message } from '@/features/flow-interview/types';
import type { FlowDiagram } from '@/features/flow-mapper/types';

// 会話を明示ノードのステートマシンで進める（LangGraph非依存の自前実装）。
// 各ノード = いま何を収集しているか。遷移は「現ノード + 更新後の図 + 完了意図 + 往復数」で決定論的に決まる。
export type FlowNode = 'overview' | 'steps' | 'actors' | 'duration' | 'done';

export const FLOW_NODES: FlowNode[] = ['overview', 'steps', 'actors', 'duration', 'done'];

// 質問が無駄に続かない上限。これを超えたら強制的に done。
export const MAX_USER_TURNS = 6;

// ユーザーが「もう質問せず作って」という意思を示したか。
const FINISH_PHRASES = [
  'そちらで',
  'で考えて',
  'おまかせ',
  'お任せ',
  '任せる',
  '任せます',
  'これで作',
  'これでいい',
  'もういい',
  '適当に',
  'いい感じ',
  'ループ',
  '作って',
];
export function wantsToFinish(history: Message[]): boolean {
  const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? '';
  return FINISH_PHRASES.some((p) => lastUser.includes(p));
}

export function userTurnCount(history: Message[]): number {
  return history.filter((m) => m.role === 'user').length;
}

function hasTitle(d: FlowDiagram): boolean {
  return !!d.title && d.title !== '業務フロー';
}

// 半数以上のステップに所要時間(durationMin>0)が入っていなければ「時間ヒアリングが必要」とみなす。
// 所要時間は To-Be 改善案のインパクト試算に必要なため、未入力ならざっくり1回だけ聞く。
function needsDuration(d: FlowDiagram): boolean {
  if (d.steps.length === 0) return false;
  const withTime = d.steps.filter((s) => (s.durationMin ?? 0) > 0).length;
  return withTime < Math.ceil(d.steps.length / 2);
}

// actors の後に行く先: 時間が未収集なら duration、揃っていれば done
function afterActors(d: FlowDiagram): FlowNode {
  return needsDuration(d) ? 'duration' : 'done';
}
// steps が揃った後に行く先: 担当が1つなら actors、複数なら afterActors へ
function afterSteps(d: FlowDiagram): FlowNode {
  return d.lanes.length >= 2 ? afterActors(d) : 'actors';
}

/**
 * 遷移関数: 現ノードと更新後の図から次ノードを決める。
 * - 完了意図あり or 往復上限 → 即 done
 * - overview: 業務名と最初の手順が出たら steps（既に3手順あれば actors へ飛ばす）
 * - steps: 手順が3つ以上そろったら actors
 * - actors: 担当が2つ以上なら done。1回聞いたら（このノードに来た時点で）done へ進め、ループさせない
 */
export function transition(
  node: FlowNode,
  diagram: FlowDiagram,
  opts: { finish: boolean; turns: number }
): FlowNode {
  if (node === 'done') return 'done';
  if (opts.finish || opts.turns >= MAX_USER_TURNS) return 'done';

  const steps = diagram.steps.length;

  switch (node) {
    case 'overview':
      if (steps >= 3) return afterSteps(diagram);
      if (steps >= 1 && hasTitle(diagram)) return 'steps';
      return 'overview';
    case 'steps':
      if (steps >= 3) return afterSteps(diagram);
      return 'steps';
    case 'actors':
      // actors を一度通過したら前進（無限ループ防止）。時間未収集なら duration へ
      return afterActors(diagram);
    case 'duration':
      // 時間を一度聞いたら完成（揃わなくても前進）
      return 'done';
    default:
      return 'done';
  }
}

// 各ノードでLLMに与える「次に聞く観点」。done は質問しない。
export function nodeDirective(node: FlowNode): string {
  switch (node) {
    case 'overview':
      return 'どんな業務を図にしたいか（業務名）と、最初から最後までの大まかな流れを1問で聞く。';
    case 'steps':
      return '開始から完了までで、まだ図に無い抜けている手順を1問で聞く（既に分かっている手順は聞き返さない）。';
    case 'actors':
      return '各手順を「誰（どの担当・部署）」がやるかを1問で聞く。担当が分かればレーンを分ける。';
    case 'duration':
      return 'それぞれの作業にだいたいどれくらい時間がかかるか（ざっくりでOK、分や時間単位）を1問で聞く。回答を各stepのdurationMin(分換算)に入れる。改善効果の試算に使う。';
    default:
      return '';
  }
}
