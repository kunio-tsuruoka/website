/**
 * EARS (Easy Approach to Requirements Syntax) 記法変換ユーティリティ
 *
 * ユーザーストーリー（As a / I want / So that）をEARS記法5パターンに変換する。
 * - Ubiquitous: 常に成立 → 「<システム名>は、<機能>すること」
 * - Event-driven: WHEN 条件 → 「<トリガー>のとき、<システム名>は、<機能>すること」
 * - State-driven: WHILE 状態 → 「<状態>の間、<システム名>は、<機能>すること」
 * - Optional: WHERE 条件 → 「<オプション条件>の場合、<システム名>は、<機能>すること」
 * - Unwanted: IF 異常 / THEN → 「もし<異常条件>の場合、<システム名>は、<対処>すること」
 */

export type EarsType = 'ubiquitous' | 'event' | 'state' | 'optional' | 'unwanted';

export type UserStory = {
  role: string;
  want: string;
  benefit: string;
};

export type EarsRequirement = {
  id: string;
  type: EarsType;
  systemName: string;
  trigger?: string;
  state?: string;
  optionalCondition?: string;
  unwantedCondition?: string;
  feature: string;
  text: string;
};

const TYPE_LABEL: Record<EarsType, string> = {
  ubiquitous: 'Ubiquitous（恒常）',
  event: 'Event-driven（イベント駆動）',
  state: 'State-driven（状態駆動）',
  optional: 'Optional（オプション）',
  unwanted: 'Unwanted（異常系）',
};

export function getEarsTypeLabel(type: EarsType): string {
  return TYPE_LABEL[type];
}

export function buildEarsText(req: Omit<EarsRequirement, 'text' | 'id'>): string {
  const sys = req.systemName.trim() || 'システム';
  const feat = req.feature.trim();
  switch (req.type) {
    case 'ubiquitous':
      return `${sys}は、${feat}すること。`;
    case 'event':
      return `${(req.trigger ?? '').trim() || '<トリガー>'}のとき、${sys}は、${feat}すること。`;
    case 'state':
      return `${(req.state ?? '').trim() || '<状態>'}の間、${sys}は、${feat}すること。`;
    case 'optional':
      return `${(req.optionalCondition ?? '').trim() || '<条件>'}の場合、${sys}は、${feat}すること。`;
    case 'unwanted':
      return `もし${(req.unwantedCondition ?? '').trim() || '<異常条件>'}の場合、${sys}は、${feat}すること。`;
  }
}

/**
 * ユーザーストーリーから正常系のEARS要求文をテンプレート展開で生成する。
 * - Ubiquitous: 常に提供する基本機能
 * - Event-driven: I want の動詞句をトリガー化
 * - State-driven: ロールが操作中の状態
 */
export function expandHappyPath(story: UserStory, systemName: string): EarsRequirement[] {
  const role = story.role.trim() || 'ユーザー';
  const want = story.want.trim() || '機能を利用';
  const sys = systemName.trim() || 'システム';
  const baseId = makeIdSeed(want);

  return [
    {
      id: `REQ-UBQ-${baseId}-001`,
      type: 'ubiquitous',
      systemName: sys,
      feature: want,
      text: buildEarsText({
        type: 'ubiquitous',
        systemName: sys,
        feature: want,
      }),
    },
    {
      id: `REQ-EVT-${baseId}-002`,
      type: 'event',
      systemName: sys,
      trigger: `${role}が${want}を要求した`,
      feature: '結果を返す',
      text: buildEarsText({
        type: 'event',
        systemName: sys,
        trigger: `${role}が${want}を要求した`,
        feature: '結果を返す',
      }),
    },
    {
      id: `REQ-STA-${baseId}-003`,
      type: 'state',
      systemName: sys,
      state: `${role}がログインしている`,
      feature: `${want}機能を利用可能にする`,
      text: buildEarsText({
        type: 'state',
        systemName: sys,
        state: `${role}がログインしている`,
        feature: `${want}機能を利用可能にする`,
      }),
    },
  ];
}

function makeIdSeed(text: string): string {
  const cleaned = text.replace(/\s+/g, '').slice(0, 6);
  let hash = 0;
  for (let i = 0; i < cleaned.length; i++) {
    hash = (hash * 31 + cleaned.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(4, '0').slice(0, 4);
}

export function toMarkdown(story: UserStory, systemName: string, reqs: EarsRequirement[]): string {
  const lines: string[] = [];
  lines.push('# ユーザーストーリー仕様書');
  lines.push('');
  lines.push('## ストーリー');
  lines.push('');
  lines.push(`- **As a** ${story.role}`);
  lines.push(`- **I want** ${story.want}`);
  lines.push(`- **So that** ${story.benefit}`);
  lines.push('');
  lines.push('## 対象システム');
  lines.push('');
  lines.push(`- ${systemName}`);
  lines.push('');
  lines.push('## EARS要求文');
  lines.push('');
  for (const r of reqs) {
    lines.push(`- **${r.id}**（${getEarsTypeLabel(r.type)}）`);
    lines.push(`  ${r.text}`);
  }
  lines.push('');
  return lines.join('\n');
}
