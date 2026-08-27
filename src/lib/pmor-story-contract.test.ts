import { describe, expect, test } from 'vitest';
import { evaluatePmorStoryContract } from './pmor-story-contract';
import { buildFullPrompt, buildStoryPrompt } from './story-revise';
import { normalizeStorySpec } from './story-spec';

function scenario(type: 'normal' | 'error' | 'boundary', n: number) {
  return {
    title: `${type}${n}`,
    type,
    given: '会員がログインしている',
    when: '空き枠を予約する',
    outcome: '予約が残る',
  };
}

describe('evaluatePmorStoryContract', () => {
  test('モデルプロジェクトの件数を満たす整理は通る', () => {
    const spec = normalizeStorySpec({
      title: 'オンライン予約',
      background: '電話予約をやめたい。',
      asIs: {
        summary: '電話で予約している。',
        actors: ['会員'],
        tools: ['電話'],
        pains: ['繋がらない'],
      },
      toBe: { summary: '自分で予約できる。', outcomes: ['空きが見える'] },
      stories: [
        {
          role: '会員',
          want: '空き枠を予約する',
          benefit: '電話しなくてよくなる',
          priority: '必須',
          scenarios: [
            scenario('normal', 1),
            scenario('normal', 2),
            scenario('error', 1),
            scenario('boundary', 1),
          ],
        },
      ],
    });
    expect(evaluatePmorStoryContract(spec)).toEqual([]);
  });

  test('正常系が1件、境界が無いと落ちる', () => {
    const spec = normalizeStorySpec({
      title: 'オンライン予約',
      background: '電話予約をやめたい。',
      asIs: {
        summary: '電話で予約している。',
        actors: ['会員'],
        tools: ['電話'],
        pains: ['繋がらない'],
      },
      toBe: { summary: '自分で予約できる。', outcomes: ['空きが見える'] },
      stories: [
        {
          role: '会員',
          want: '空き枠を予約する',
          benefit: '電話しなくてよくなる',
          priority: '必須',
          scenarios: [scenario('normal', 1), scenario('error', 1)],
        },
      ],
    });
    const codes = evaluatePmorStoryContract(spec).map((issue) => issue.code);
    expect(codes).toContain('normal-min');
    expect(codes).toContain('boundary-min');
  });

  test('画面操作と英語の誰が／何をは落ちる', () => {
    const spec = normalizeStorySpec({
      title: 'オンライン予約',
      background: '電話予約をやめたい。',
      asIs: {
        summary: '電話で予約している。',
        actors: ['会員'],
        tools: ['電話'],
        pains: ['繋がらない'],
      },
      toBe: { summary: '自分で予約できる。', outcomes: ['空きが見える'] },
      stories: [
        {
          role: 'Member',
          want: 'book a slot',
          benefit: 'no phone',
          priority: '必須',
          scenarios: [
            scenario('normal', 1),
            scenario('normal', 2),
            {
              title: 'ボタン',
              type: 'error',
              given: '会員が予約画面を開いている',
              when: '予約ボタンをクリックする',
              outcome: 'エラーが出る',
            },
            scenario('boundary', 1),
          ],
        },
      ],
    });
    const codes = evaluatePmorStoryContract(spec).map((issue) => issue.code);
    expect(codes).toContain('ui-leak');
    expect(codes).toContain('story-ja');
  });
});

describe('生成プロンプト', () => {
  test('モデルプロジェクトの件数を指示する', () => {
    const prompt = buildFullPrompt('会員がオンラインで予約できるようにしたい');
    expect(prompt).toContain('1〜5件');
    expect(prompt).toContain('正常系2');
    expect(prompt).toContain('異常系1');
    expect(prompt).toContain('境界1');
    expect(prompt).not.toContain('必要なら境界');

    const storyPrompt = buildStoryPrompt(
      '会員がオンラインで予約できるようにしたい',
      normalizeStorySpec({
        title: 'オンライン予約',
        background: '電話予約をやめたい。',
        asIs: {
          summary: '電話で予約している。',
          actors: ['会員'],
          tools: ['電話'],
          pains: ['繋がらない'],
        },
        toBe: { summary: '自分で予約できる。', outcomes: ['空きが見える'] },
        stories: [
          {
            id: 'US-01',
            role: '会員',
            want: '空き枠を予約する',
            benefit: '電話しなくてよくなる',
            priority: '必須',
            scenarios: [scenario('normal', 1)],
          },
        ],
      }),
      'US-01'
    );
    expect(storyPrompt).toContain('正常系2');
    expect(storyPrompt).toContain('境界1');
  });
});
