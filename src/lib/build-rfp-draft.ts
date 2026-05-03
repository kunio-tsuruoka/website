// 3ツールの localStorage を読み、RFPドラフトの Markdown を生成する。
// 読めない/空のセクションは「（未入力）」プレースホルダで残す。

const FLOW_KEY = 'beekle-flow-mapper-v2';
const SCOPE_KEY = 'beekle-scope-manager-v1';
const STORY_KEY = 'beekle-story-builder-v1';

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

type StoryReq = { id: string; text: string; tag?: string };
type StoryUsecase = {
  id?: string;
  title?: string;
  actor?: string;
  goal?: string;
  motivation?: string;
  happy?: StoryReq[];
  unwanted?: StoryReq[];
  boundary?: StoryReq[];
};
type StoryState = {
  description?: string;
  result?: {
    story?: { actor?: string; goal?: string; why?: string };
    usecase?: StoryUsecase;
  } | null;
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

function buildStorySection(story: StoryState | null): string {
  if (!story?.result?.usecase) return '（ユーザーストーリー作成ツール未入力）';
  const u = story.result.usecase;
  const lines: string[] = [];
  if (u.title) lines.push(`### ユースケース: ${u.title}`);
  if (u.actor) lines.push(`- 利用者: ${u.actor}`);
  if (u.goal) lines.push(`- やりたいこと: ${u.goal}`);
  if (u.motivation) lines.push(`- 背景・動機: ${u.motivation}`);
  if (Array.isArray(u.happy) && u.happy.length > 0) {
    lines.push('');
    lines.push('#### 正常系シナリオ（うまくいくケース）');
    for (const r of u.happy) lines.push(`- **${r.id}**${r.tag ? ` [${r.tag}]` : ''}: ${r.text}`);
  }
  if (Array.isArray(u.unwanted) && u.unwanted.length > 0) {
    lines.push('');
    lines.push('#### 異常系シナリオ（見落としやすい失敗パターン）');
    for (const r of u.unwanted) lines.push(`- **${r.id}**${r.tag ? ` [${r.tag}]` : ''}: ${r.text}`);
  }
  if (Array.isArray(u.boundary) && u.boundary.length > 0) {
    lines.push('');
    lines.push('#### 境界値シナリオ');
    for (const r of u.boundary) lines.push(`- **${r.id}**${r.tag ? ` [${r.tag}]` : ''}: ${r.text}`);
  }
  return lines.length > 0 ? lines.join('\n') : '（ユーザーストーリー未生成）';
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
  const story = readJson<StoryState>(STORY_KEY);
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

  sections.push('## 5. ユーザーストーリーとシナリオ');
  sections.push(buildStorySection(story));
  sections.push('');

  sections.push('## 6. 要件一覧と優先度');
  sections.push(buildScopeTable(scope));
  sections.push('');

  sections.push('## 7. 提案いただきたい内容');
  sections.push('- 上記スコープに対する技術選定・概算見積もり');
  sections.push('- 推奨アーキテクチャと採用理由');
  sections.push('- 開発体制・スケジュール案');
  sections.push('- 想定リスクと対策');
  sections.push('');

  sections.push('## 8. 連絡先・提案期日');
  sections.push('- 提案受付期日: （ご相談）');
  sections.push(`- 連絡先: ${placeholder(inputs.contactEmail)}`);
  sections.push('');

  sections.push('---');
  sections.push(
    '本RFPは Beekle 発注準備キット（業務フロー可視化／ユーザーストーリー／スコープ管理）の出力を統合して生成しました。'
  );

  return sections.join('\n');
}

// ───────────────────────────────────────
// プレーンテキスト形式: Markdown 記号を剥がして社内共有しやすい体裁に
// ───────────────────────────────────────
export function buildRfpPlainText(inputs: RfpInputs): string {
  const md = buildRfpMarkdown(inputs);
  const lines: string[] = [];
  for (const raw of md.split('\n')) {
    let line = raw;
    // 見出しは記号を外して全角スペースで段差表現
    if (/^# /.test(line)) {
      lines.push('');
      lines.push('========================================');
      lines.push(line.replace(/^# /, ''));
      lines.push('========================================');
      continue;
    }
    if (/^## /.test(line)) {
      lines.push('');
      lines.push(`■ ${line.replace(/^## /, '')}`);
      lines.push('----------------------------------------');
      continue;
    }
    if (/^### /.test(line)) {
      lines.push('');
      lines.push(`◆ ${line.replace(/^### /, '')}`);
      continue;
    }
    if (/^#### /.test(line)) {
      lines.push(`▸ ${line.replace(/^#### /, '')}`);
      continue;
    }
    // 強調マーク・打ち消し線・引用記号を除去
    line = line.replace(/\*\*(.+?)\*\*/g, '$1');
    line = line.replace(/~~(.+?)~~/g, '$1（除外）');
    line = line.replace(/^>\s*/, '');
    line = line.replace(/^---\s*$/, '----------------------------------------');
    lines.push(line);
  }
  return lines.join('\n').trimStart();
}

// ───────────────────────────────────────
// HTML 形式: 印刷ダイアログから PDF 化するための簡素なスタイル付きHTML
// ───────────────────────────────────────
export function buildRfpHtml(inputs: RfpInputs): string {
  const md = buildRfpMarkdown(inputs);
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const body: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      body.push('</ul>');
      inList = false;
    }
  };

  for (const raw of md.split('\n')) {
    const line = raw;
    if (/^# /.test(line)) {
      closeList();
      body.push(`<h1>${escapeHtml(line.replace(/^# /, ''))}</h1>`);
    } else if (/^## /.test(line)) {
      closeList();
      body.push(`<h2>${escapeHtml(line.replace(/^## /, ''))}</h2>`);
    } else if (/^### /.test(line)) {
      closeList();
      body.push(`<h3>${escapeHtml(line.replace(/^### /, ''))}</h3>`);
    } else if (/^#### /.test(line)) {
      closeList();
      body.push(`<h4>${escapeHtml(line.replace(/^#### /, ''))}</h4>`);
    } else if (/^- /.test(line)) {
      if (!inList) {
        body.push('<ul>');
        inList = true;
      }
      let html = escapeHtml(line.replace(/^- /, ''));
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');
      body.push(`<li>${html}</li>`);
    } else if (/^>/.test(line)) {
      closeList();
      body.push(`<blockquote>${escapeHtml(line.replace(/^>\s*/, ''))}</blockquote>`);
    } else if (/^---\s*$/.test(line)) {
      closeList();
      body.push('<hr/>');
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      let html = escapeHtml(line);
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      body.push(`<p>${html}</p>`);
    }
  }
  closeList();

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>RFPドラフト: ${escapeHtml(placeholder(inputs.projectName))}</title>
<style>
  body { font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif; max-width: 800px; margin: 2em auto; padding: 0 1.5em; color: #1a202c; line-height: 1.7; }
  h1 { border-bottom: 3px solid #3D4DB7; padding-bottom: 0.4em; margin-top: 1em; }
  h2 { color: #001738; border-left: 4px solid #3D4DB7; padding-left: 0.6em; margin-top: 2em; }
  h3 { color: #3D4DB7; margin-top: 1.5em; }
  h4 { color: #555; margin-top: 1.2em; font-size: 1em; }
  ul { padding-left: 1.5em; }
  li { margin: 0.3em 0; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #666; margin: 1em 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  strong { color: #001738; }
  @media print {
    body { margin: 0; max-width: none; font-size: 10.5pt; }
    h1, h2, h3 { page-break-after: avoid; }
    li { page-break-inside: avoid; }
  }
</style>
</head>
<body>
${body.join('\n')}
</body>
</html>`;
}
