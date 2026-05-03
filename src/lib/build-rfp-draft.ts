// 3ツールの localStorage を読み、RFPドラフトの Markdown を生成する。
// 読めない/空のセクションは「（未入力）」プレースホルダで残す。

const FLOW_KEY = 'beekle-flow-mapper-v2';
const SCOPE_KEY = 'beekle-scope-manager-v1';

type FlowState = {
  state?: {
    asIs?: {
      title?: string;
      phases?: { name: string }[];
      lanes?: { name: string }[];
      steps?: unknown[];
    };
    toBe?: {
      title?: string;
      phases?: { name: string }[];
      lanes?: { name: string }[];
      steps?: unknown[];
    };
  };
};

type ScopeState = {
  markdown?: string;
  requirements?: Array<{ id: string; body: string; verdict: string }>;
};

export type RfpInputs = {
  projectName: string;
  desiredStartDate: string;
  budgetRange: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string;
  background: string;
  goals: string;
};

export const EMPTY_INPUTS: RfpInputs = {
  projectName: '',
  desiredStartDate: '',
  budgetRange: '',
  contactName: '',
  contactEmail: '',
  contactCompany: '',
  background: '',
  goals: '',
};

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function placeholder(s: string): string {
  return s.trim() === '' ? '（未入力）' : s;
}

function summarizeDiagram(d?: FlowState['state']['asIs']): string {
  if (!d || !Array.isArray(d.steps) || d.steps.length === 0)
    return '（業務フロー可視化ツール未入力）';
  const phases = (d.phases ?? []).map((p) => p.name).join(' → ') || '（フェーズなし）';
  const lanes = (d.lanes ?? []).map((l) => l.name).join('・') || '（担当なし）';
  return `- 業務名: ${d.title || '未設定'}\n- 工程: ${phases}\n- 担当: ${lanes}\n- ステップ数: ${d.steps.length}`;
}

function buildScopeTable(scope: ScopeState | null): string {
  if (!scope || !Array.isArray(scope.requirements) || scope.requirements.length === 0) {
    return '（スコープ管理ツール未入力）';
  }
  const make = scope.requirements.filter((r) => r.verdict === '作る');
  const later = scope.requirements.filter((r) => r.verdict === '後回し');
  const skip = scope.requirements.filter((r) => r.verdict === '作らない');
  const lines: string[] = [];
  lines.push(`### 作る (${make.length} 件)`);
  for (const r of make) lines.push(`- **${r.id}**: ${r.body}`);
  if (later.length > 0) {
    lines.push('');
    lines.push(`### 後回し (${later.length} 件)`);
    for (const r of later) lines.push(`- **${r.id}**: ${r.body}`);
  }
  if (skip.length > 0) {
    lines.push('');
    lines.push(`### 今回作らない (${skip.length} 件)`);
    for (const r of skip) lines.push(`- ~~${r.id}~~: ${r.body}`);
  }
  return lines.join('\n');
}

export function buildRfpMarkdown(inputs: RfpInputs): string {
  const flow = readJson<FlowState>(FLOW_KEY);
  const scope = readJson<ScopeState>(SCOPE_KEY);
  const today = new Date().toISOString().slice(0, 10);

  const sections: string[] = [];
  sections.push(`# RFP（提案依頼書）ドラフト: ${placeholder(inputs.projectName)}`);
  sections.push('');
  sections.push(`> 作成日: ${today}　/　 Beekle 発注準備キットで自動生成`);
  sections.push('');

  sections.push('## 1. プロジェクト概要');
  sections.push(`- プロジェクト名: ${placeholder(inputs.projectName)}`);
  sections.push(`- 希望開始時期: ${placeholder(inputs.desiredStartDate)}`);
  sections.push(`- 想定予算レンジ: ${placeholder(inputs.budgetRange)}`);
  sections.push(`- 発注担当者: ${placeholder(inputs.contactName)}`);
  sections.push(`- 会社名: ${placeholder(inputs.contactCompany)}`);
  sections.push(`- 連絡先: ${placeholder(inputs.contactEmail)}`);
  sections.push('');

  sections.push('## 2. 背景・目的');
  sections.push('### 背景');
  sections.push(placeholder(inputs.background));
  sections.push('');
  sections.push('### 達成したいゴール');
  sections.push(placeholder(inputs.goals));
  sections.push('');

  sections.push('## 3. 現状業務（As-Is）');
  sections.push(summarizeDiagram(flow?.state?.asIs));
  sections.push('');

  sections.push('## 4. 改善後の姿（To-Be）');
  sections.push(summarizeDiagram(flow?.state?.toBe));
  sections.push('');

  sections.push('## 5. 要件一覧と優先度');
  sections.push(buildScopeTable(scope));
  sections.push('');

  sections.push('## 6. 提案いただきたい内容');
  sections.push('- 上記スコープに対する技術選定・概算見積もり');
  sections.push('- 推奨アーキテクチャと採用理由');
  sections.push('- 開発体制・スケジュール案');
  sections.push('- 想定リスクと対策');
  sections.push('');

  sections.push('## 7. 連絡先・提案期日');
  sections.push('- 提案受付期日: （ご相談）');
  sections.push(`- 連絡先: ${placeholder(inputs.contactEmail)}`);
  sections.push('');

  sections.push('---');
  sections.push(
    '本RFPは Beekle 発注準備キット（業務フロー可視化／ユーザーストーリー／スコープ管理）の出力を統合して生成しました。'
  );

  return sections.join('\n');
}
