import { describe, expect, test } from 'vitest';
import { applyRevision, parseRevisionPayload } from './story-revise';
import { normalizeStorySpec } from './story-spec';

const current = normalizeStorySpec({
  title: '経費精算',
  background: '紙が残っている。',
  asIs: {
    summary: '紙で申請している。',
    actors: ['営業'],
    tools: ['紙'],
    pains: ['なくす'],
  },
  toBe: {
    summary: 'その場で申請できる。',
    outcomes: ['紛失がなくなる'],
  },
  stories: [
    {
      id: 'US-01',
      role: '営業',
      want: '領収書を申請したい',
      benefit: '手間をなくしたい',
      priority: '必須',
      scenarios: [
        {
          title: '申請する',
          type: 'normal',
          given: '出張中である',
          when: '領収書を申請する',
          outcome: '上長に届く',
        },
      ],
    },
    {
      id: 'US-02',
      role: '上長',
      want: '承認したい',
      benefit: '止めたい申請を止めたい',
      priority: '必須',
      scenarios: [
        {
          title: '承認する',
          type: 'normal',
          given: '申請がある',
          when: '承認する',
          outcome: '経理に届く',
        },
      ],
    },
  ],
});

const incoming = normalizeStorySpec({
  ...current,
  title: '経費精算アプリ',
  asIs: { ...current.asIs, summary: '月末にまとめて申請している。' },
  stories: [
    {
      ...current.stories[0],
      want: '写真で申請したい',
      scenarios: [
        {
          title: '写真で申請する',
          type: 'normal',
          given: '領収書がある',
          when: '写真で申請する',
          outcome: '申請が残る',
        },
      ],
    },
    current.stories[1],
  ],
});

describe('applyRevision', () => {
  test('asis は現状だけ差し替え、ストーリーは残す', () => {
    const next = applyRevision(current, incoming, 'asis');
    expect(next.asIs.summary).toBe('月末にまとめて申請している。');
    expect(next.title).toBe('経費精算アプリ');
    expect(next.stories[0].want).toBe('領収書を申請したい');
  });

  test('story は指定したストーリーだけ差し替える', () => {
    const next = applyRevision(current, incoming, 'story', 'US-01');
    expect(next.stories[0].want).toBe('写真で申請したい');
    expect(next.stories[1].want).toBe('承認したい');
    expect(next.asIs.summary).toBe('紙で申請している。');
  });

  test('revise は受け取った整理で置き換える', () => {
    const next = applyRevision(current, incoming, 'revise');
    expect(next).toEqual(incoming);
  });
});

describe('parseRevisionPayload', () => {
  test('spec と note を包んだ JSON を読む', () => {
    const parsed = parseRevisionPayload(
      JSON.stringify({ note: '上長の承認を任意にした。', spec: incoming })
    );
    expect(parsed.note).toBe('上長の承認を任意にした。');
    expect(parsed.spec.title).toBe('経費精算アプリ');
  });

  test('StorySpec そのものも読む', () => {
    const parsed = parseRevisionPayload(JSON.stringify(incoming));
    expect(parsed.note).toBe('直しました。');
    expect(parsed.spec.stories).toHaveLength(2);
  });
});
