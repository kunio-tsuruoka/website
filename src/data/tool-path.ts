export const TOOL_PATH = [
  {
    id: 'flow-mapper',
    n: '01',
    verb: '見る',
    label: '業務を見る',
    href: '/tools/flow-mapper',
    name: '業務フロー可視化ツール',
    hint: '担当と手順で、いまのやり方を図にする',
    nextCta: '次は、誰が何をしたいかを書く',
  },
  {
    id: 'story-builder',
    n: '02',
    verb: '書く',
    label: '誰が何をしたいかを書く',
    href: '/tools/story-builder',
    name: 'ユーザーストーリー作成ツール',
    hint: '現状と目指す姿、ストーリー、うまくいく／いかない場合',
    nextCta: '次は、作る／作らないを決める',
  },
  {
    id: 'scope-manager',
    n: '03',
    verb: '切る',
    label: '作る／作らないを決める',
    href: '/tools/scope-manager',
    name: 'スコープ管理ツール',
    hint: '必須・後回し・やらないに分ける',
    nextCta: '次は、予算と連絡先を足して一枚にする',
  },
  {
    id: 'rfp-builder',
    n: '04',
    verb: '出す',
    label: '発注用の一枚にする',
    href: '/tools/rfp-builder',
    name: 'RFPドラフト自動生成',
    hint: '予算・時期・連絡先を足して渡す',
    nextCta: '',
  },
] as const;

export type ToolPathId = (typeof TOOL_PATH)[number]['id'];
export type ToolPathStep = (typeof TOOL_PATH)[number];

export function getToolPathStep(id: ToolPathId): {
  current: ToolPathStep;
  next?: ToolPathStep;
  prev?: ToolPathStep;
} {
  const index = TOOL_PATH.findIndex((step) => step.id === id);
  const current = TOOL_PATH[index];
  if (!current) {
    throw new Error(`unknown tool path: ${id}`);
  }
  return {
    current,
    next: TOOL_PATH[index + 1],
    prev: index > 0 ? TOOL_PATH[index - 1] : undefined,
  };
}
