import { z } from 'zod';

export const SCENARIO_TYPES = ['normal', 'error', 'boundary'] as const;
export type ScenarioType = (typeof SCENARIO_TYPES)[number];

export const STORY_PRIORITIES = ['必須', '推奨', '任意'] as const;
export type StoryPriority = (typeof STORY_PRIORITIES)[number];

export const SCENARIO_TYPE_LABEL: Record<ScenarioType, string> = {
  normal: '正常系',
  error: '異常系',
  boundary: '境界',
};

export function liftScenarioOutcome(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const rec = value as Record<string, unknown>;
  const gherkinThen = Object.entries(rec).find(([key]) => key === 'then')?.[1];
  const outcome =
    typeof rec.outcome === 'string'
      ? rec.outcome
      : typeof gherkinThen === 'string'
        ? gherkinThen
        : '';
  return {
    ...Object.fromEntries(
      Object.entries(rec).filter(([key]) => key !== 'then' && key !== 'outcome')
    ),
    outcome,
  };
}

function liftSpecOutcomes(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const rec = value as Record<string, unknown>;
  if (!Array.isArray(rec.stories)) return value;
  return {
    ...rec,
    stories: rec.stories.map((story) => {
      if (!story || typeof story !== 'object') return story;
      const next = story as Record<string, unknown>;
      if (!Array.isArray(next.scenarios)) return story;
      return { ...next, scenarios: next.scenarios.map(liftScenarioOutcome) };
    }),
  };
}

const ScenarioSchema = z.object({
  id: z.string().default(''),
  title: z.string(),
  type: z.enum(SCENARIO_TYPES).default('normal'),
  given: z.string().default(''),
  when: z.string().default(''),
  outcome: z.string().default(''),
});

const UserStorySchema = z.object({
  id: z.string().default(''),
  role: z.string(),
  want: z.string(),
  benefit: z.string(),
  priority: z.enum(STORY_PRIORITIES).default('必須'),
  scenarios: z.array(ScenarioSchema).default([]),
});

const AsIsSchema = z.object({
  summary: z.string().default(''),
  actors: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  pains: z.array(z.string()).default([]),
});

const ToBeSchema = z.object({
  summary: z.string().default(''),
  outcomes: z.array(z.string()).default([]),
});

export const StorySpecSchema = z.object({
  title: z.string(),
  background: z.string().default(''),
  asIs: AsIsSchema,
  toBe: ToBeSchema,
  stories: z.array(UserStorySchema).min(1),
  nonFunctional: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  proposalRequests: z.array(z.string()).default([]),
});

export type StoryScenario = z.infer<typeof ScenarioSchema>;
export type UserStory = z.infer<typeof UserStorySchema>;
export type AsIs = z.infer<typeof AsIsSchema>;
export type ToBe = z.infer<typeof ToBeSchema>;
export type StorySpec = z.infer<typeof StorySpecSchema>;

const TYPE_PREFIX: Record<ScenarioType, string> = {
  normal: 'N',
  error: 'E',
  boundary: 'B',
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function normalizeStorySpec(input: unknown): StorySpec {
  const parsed = StorySpecSchema.parse(liftSpecOutcomes(input));
  const typeCount: Record<string, number> = {};

  const stories = parsed.stories.map((story, i) => {
    const id = story.id.trim() || `US-${pad(i + 1)}`;
    const scenarios = story.scenarios
      .filter((s) => s.title.trim() || s.when.trim() || s.outcome.trim())
      .map((scenario) => {
        const key = `${id}-${scenario.type}`;
        typeCount[key] = (typeCount[key] ?? 0) + 1;
        const generated = `SC-${id}-${TYPE_PREFIX[scenario.type]}${typeCount[key]}`;
        return {
          ...scenario,
          id: scenario.id.trim() || generated,
          title: scenario.title.trim(),
          given: stripKeywordPrefix(scenario.given, ['前提', 'Given']),
          when: stripKeywordPrefix(scenario.when, ['操作', 'When']),
          outcome: stripKeywordPrefix(scenario.outcome, ['結果', 'Then']),
        };
      });
    return {
      ...story,
      id,
      role: story.role.trim(),
      want: story.want.trim(),
      benefit: story.benefit.trim(),
      scenarios,
    };
  });

  return {
    ...parsed,
    title: parsed.title.trim(),
    background: parsed.background.trim(),
    asIs: {
      summary: parsed.asIs.summary.trim(),
      actors: parsed.asIs.actors.map((s) => s.trim()).filter(Boolean),
      tools: parsed.asIs.tools.map((s) => s.trim()).filter(Boolean),
      pains: parsed.asIs.pains.map((s) => s.trim()).filter(Boolean),
    },
    toBe: {
      summary: parsed.toBe.summary.trim(),
      outcomes: parsed.toBe.outcomes.map((s) => s.trim()).filter(Boolean),
    },
    stories,
    nonFunctional: parsed.nonFunctional.map((s) => s.trim()).filter(Boolean),
    constraints: parsed.constraints.map((s) => s.trim()).filter(Boolean),
    proposalRequests: parsed.proposalRequests.map((s) => s.trim()).filter(Boolean),
  };
}

export function parseStorySpecJson(text: string): StorySpec {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('JSON オブジェクトが見つかりません');
  }
  return normalizeStorySpec(JSON.parse(cleaned.slice(start, end + 1)));
}

export function isStorySpec(value: unknown): value is StorySpec {
  return StorySpecSchema.safeParse(liftSpecOutcomes(value)).success;
}

function stripKeywordPrefix(text: string, keywords: string[]): string {
  let next = text.trim();
  for (const keyword of keywords) {
    const re = new RegExp(`^${keyword}\\s*[:：]\\s*`, 'i');
    next = next.replace(re, '');
  }
  return next.trim();
}

function bullets(items: string[]): string[] {
  return items.map((item) => `- ${item}`);
}

function sectionOrConsult(title: string, items: string[]): string[] {
  const lines = [title, ''];
  if (items.length > 0) {
    lines.push(...bullets(items));
  } else {
    lines.push('- 要相談');
  }
  lines.push('');
  return lines;
}

function scenarioBody(scenario: StoryScenario): string {
  const parts = [scenario.when.trim(), scenario.outcome.trim()].filter(Boolean);
  return parts.join('と、');
}

export type GherkinSteps = {
  title: string;
  given?: string;
  when?: string;
  outcome?: string;
};

function gherkinThenLines(outcome: string): string[] {
  return outcome
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line, i) => {
      const body = line.replace(/^(And|Then|そして|かつ|ならば)\s+/, '');
      return i === 0 ? `Then ${body}` : `And ${body}`;
    });
}

/** 1シナリオ分の Gherkin（キーワードは Beekle の知識記事と同じ Given / When / Then） */
export function formatGherkin(scenario: GherkinSteps, indent = ''): string[] {
  const lines = [`${indent}Scenario: ${scenario.title}`];
  if (scenario.given) lines.push(`${indent}  Given ${scenario.given}`);
  if (scenario.when) lines.push(`${indent}  When ${scenario.when}`);
  if (scenario.outcome) {
    for (const line of gherkinThenLines(scenario.outcome)) {
      lines.push(`${indent}  ${line}`);
    }
  }
  return lines;
}

/** 仕様全体を .feature として書き出す */
export function formatGherkinFeature(spec: StorySpec): string {
  const lines: string[] = ['# language: ja', `Feature: ${spec.title}`];
  if (spec.background) {
    lines.push('  """');
    for (const para of spec.background.split('\n')) lines.push(`  ${para}`);
    lines.push('  """');
  }
  lines.push('');
  for (const story of spec.stories) {
    lines.push(`  Rule: ${story.id} ${story.role}が${story.want}`);
    if (story.benefit) lines.push(`    # なぜ: ${story.benefit}`);
    lines.push('');
    for (const scenario of story.scenarios) {
      lines.push(...formatGherkin(scenario, '    '));
      lines.push('');
    }
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export function formatStoryMarkdown(spec: StorySpec): string {
  const lines: string[] = [];
  lines.push(`# ${spec.title}`);
  lines.push('');
  if (spec.background) {
    lines.push('## 背景');
    lines.push('');
    lines.push(spec.background);
    lines.push('');
  }

  lines.push('## 現状（As-Is）');
  lines.push('');
  lines.push(spec.asIs.summary || '（未整理）');
  lines.push('');
  if (spec.asIs.actors.length > 0) {
    lines.push(`- **登場人物**: ${spec.asIs.actors.join('、')}`);
  }
  if (spec.asIs.tools.length > 0) {
    lines.push(`- **使っているもの**: ${spec.asIs.tools.join('、')}`);
  }
  if (spec.asIs.pains.length > 0) {
    lines.push('- **困りごと**:');
    for (const pain of spec.asIs.pains) lines.push(`  - ${pain}`);
  }
  lines.push('');

  lines.push('## 目指す姿（To-Be）');
  lines.push('');
  lines.push(spec.toBe.summary || '（未整理）');
  lines.push('');
  if (spec.toBe.outcomes.length > 0) {
    lines.push('- **実現したいこと**:');
    for (const outcome of spec.toBe.outcomes) lines.push(`  - ${outcome}`);
  }
  lines.push('');

  lines.push('## ユーザーストーリーとシナリオ');
  lines.push('');
  for (const story of spec.stories) {
    lines.push(`### ${story.id} ${story.role}が${story.want}`);
    lines.push('');
    lines.push(`- **誰が**: ${story.role}`);
    lines.push(`- **何をしたい**: ${story.want}`);
    lines.push(`- **なぜ**: ${story.benefit}`);
    lines.push(`- **優先度**: ${story.priority}`);
    lines.push('');
    for (const scenario of story.scenarios) {
      lines.push(`#### ${scenario.id} ${SCENARIO_TYPE_LABEL[scenario.type]}: ${scenario.title}`);
      lines.push('');
      lines.push('```gherkin');
      for (const line of formatGherkin(scenario)) lines.push(line);
      lines.push('```');
      lines.push('');
    }
  }

  lines.push(...sectionOrConsult('## 非機能要件', spec.nonFunctional));
  lines.push(...sectionOrConsult('## 制約・前提', spec.constraints));
  return `${lines.join('\n').trimEnd()}\n`;
}

export function formatRfpMarkdown(spec: StorySpec): string {
  const lines: string[] = [];
  lines.push(`# RFP（提案依頼書）ドラフト: ${spec.title}`);
  lines.push('');
  lines.push('## 1. 背景・目的');
  lines.push('');
  lines.push(spec.background || '（未整理）');
  lines.push('');
  lines.push('## 2. 現状業務（As-Is）');
  lines.push('');
  lines.push(spec.asIs.summary || '（未整理）');
  lines.push('');
  if (spec.asIs.actors.length > 0) {
    lines.push(`- **登場人物**: ${spec.asIs.actors.join('、')}`);
  }
  if (spec.asIs.tools.length > 0) {
    lines.push(`- **使っているもの**: ${spec.asIs.tools.join('、')}`);
  }
  if (spec.asIs.pains.length > 0) {
    lines.push('- **困りごと**:');
    for (const pain of spec.asIs.pains) lines.push(`  - ${pain}`);
  }
  lines.push('');
  lines.push('## 3. 目指す姿（To-Be）');
  lines.push('');
  lines.push(spec.toBe.summary || '（未整理）');
  lines.push('');
  if (spec.toBe.outcomes.length > 0) {
    lines.push('- **実現したいこと**:');
    for (const outcome of spec.toBe.outcomes) lines.push(`  - ${outcome}`);
  }
  lines.push('');
  lines.push('## 4. 機能要件（ユーザーストーリーとシナリオ）');
  lines.push('');
  for (const story of spec.stories) {
    lines.push(`### ${story.id}`);
    lines.push('');
    lines.push(`- **誰が（As a）**: ${story.role}`);
    lines.push(`- **何をしたい（I want）**: ${story.want}`);
    lines.push(`- **なぜ（So that）**: ${story.benefit}`);
    lines.push(`- **優先度**: ${story.priority}`);
    lines.push('');
    for (const scenario of story.scenarios) {
      lines.push(`#### ${scenario.id} ${SCENARIO_TYPE_LABEL[scenario.type]}: ${scenario.title}`);
      lines.push('');
      lines.push('```gherkin');
      for (const line of formatGherkin(scenario)) lines.push(line);
      lines.push('```');
      lines.push('');
    }
  }
  lines.push(...sectionOrConsult('## 5. 非機能要件', spec.nonFunctional));
  lines.push(...sectionOrConsult('## 6. 制約・前提', spec.constraints));
  lines.push(...sectionOrConsult('## 7. ご提案いただきたい事項', spec.proposalRequests));
  lines.push('---');
  lines.push('');
  lines.push(
    'このRFPドラフトは Beekle 発注準備キットで生成されました。内容の具体化や開発の相談は https://beekle.jp/contact まで。'
  );
  return lines.join('\n');
}

/** スコープ管理ツールが読み取れる互換行を含む Markdown */
export function formatScopeMarkdown(spec: StorySpec): string {
  const lines: string[] = [];
  lines.push(`# ${spec.title}`);
  lines.push('');
  lines.push('## ユーザーストーリーとシナリオ');
  lines.push('');
  for (const story of spec.stories) {
    lines.push(`### ${story.id} ${story.role}が${story.want}`);
    lines.push('');
    for (const scenario of story.scenarios) {
      const label = SCENARIO_TYPE_LABEL[scenario.type];
      lines.push(`- **${scenario.id}**（${label}・${story.priority}・由来:AI整理）`);
      lines.push(`  ${scenarioBody(scenario) || scenario.title}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function storyCountSummary(spec: StorySpec): { stories: number; scenarios: number } {
  return {
    stories: spec.stories.length,
    scenarios: spec.stories.reduce((sum, story) => sum + story.scenarios.length, 0),
  };
}

export function createBlankStory(existingCount: number): UserStory {
  const id = `US-${pad(existingCount + 1)}`;
  return {
    id,
    role: '',
    want: '',
    benefit: '',
    priority: '必須',
    scenarios: [createBlankScenario(id, [], 'normal')],
  };
}

export function createBlankScenario(
  storyId: string,
  existing: StoryScenario[],
  type: ScenarioType = 'normal'
): StoryScenario {
  const count = existing.filter((item) => item.type === type).length + 1;
  return {
    id: `SC-${storyId}-${TYPE_PREFIX[type]}${count}`,
    title: '',
    type,
    given: '',
    when: '',
    outcome: '',
  };
}
