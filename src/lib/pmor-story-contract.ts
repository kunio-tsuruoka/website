import type { StorySpec } from '@/lib/story-spec';

export type PmorContractIssue = {
  code: string;
  message: string;
  storyId?: string;
};

const CJK = /[\u3040-\u30ff\u3400-\u9fff]/;
const ENGLISH_STORY_LEAD = /\b(As a|I want|So that)\b/i;
const UI_LEAK = /ボタン|画面を|をクリック|をタップ|を押す/;

function hasJapanese(value: string): boolean {
  return CJK.test(value);
}

/** PM on Rails モデルプロジェクトの一括生成シナリオ Then に揃える */
export function evaluatePmorStoryContract(spec: StorySpec): PmorContractIssue[] {
  const issues: PmorContractIssue[] = [];

  if (spec.stories.length < 1 || spec.stories.length > 5) {
    issues.push({
      code: 'story-count',
      message: `ストーリーは1〜5件。いま ${spec.stories.length} 件`,
    });
  }

  for (const story of spec.stories) {
    const counts = { normal: 0, error: 0, boundary: 0 };
    for (const scenario of story.scenarios) {
      counts[scenario.type] += 1;
    }
    if (counts.normal < 2) {
      issues.push({
        code: 'normal-min',
        storyId: story.id,
        message: `${story.id} の正常系が${counts.normal}件（2件以上）`,
      });
    }
    if (counts.error < 1) {
      issues.push({
        code: 'error-min',
        storyId: story.id,
        message: `${story.id} の異常系が${counts.error}件（1件以上）`,
      });
    }
    if (counts.boundary < 1) {
      issues.push({
        code: 'boundary-min',
        storyId: story.id,
        message: `${story.id} の境界が${counts.boundary}件（1件以上）`,
      });
    }

    const storyText = [story.role, story.want, story.benefit].join('\n');
    if (ENGLISH_STORY_LEAD.test(storyText)) {
      issues.push({
        code: 'english-lead',
        storyId: story.id,
        message: `${story.id} に As a / I want / So that が残っている`,
      });
    }
    if (!hasJapanese(story.role) || !hasJapanese(story.want) || !hasJapanese(story.benefit)) {
      issues.push({
        code: 'story-ja',
        storyId: story.id,
        message: `${story.id} の誰が／何を／なぜが日本語ではない`,
      });
    }

    for (const scenario of story.scenarios) {
      const body = [scenario.given, scenario.when, scenario.outcome].join('\n');
      if (!hasJapanese(body)) {
        issues.push({
          code: 'scenario-ja',
          storyId: story.id,
          message: `${scenario.id} の前提／操作／結果が日本語ではない`,
        });
      }
      if (scenario.type !== 'ui' && UI_LEAK.test(body)) {
        issues.push({
          code: 'ui-leak',
          storyId: story.id,
          message: `${scenario.id} の業務シナリオに画面名・ボタン操作がある`,
        });
      }
    }
  }

  return issues;
}
