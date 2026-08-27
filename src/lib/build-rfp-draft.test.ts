import { afterEach, describe, expect, test } from 'vitest';
import { EMPTY_INPUTS, buildRfpMarkdown } from './build-rfp-draft';
import { normalizeStorySpec } from './story-spec';

const spec = normalizeStorySpec({
  title: '経費精算システムの要件整理',
  background: '紙の精算が月末に集中している。',
  asIs: {
    summary: '出張後に紙の領収書をまとめて申請している。',
    actors: ['営業担当'],
    tools: ['紙'],
    pains: ['なくす'],
  },
  toBe: {
    summary: '出張先からその場で申請できる。',
    outcomes: ['紛失がなくなる'],
  },
  stories: [
    {
      role: '営業担当',
      want: '出張先で申請したい',
      benefit: 'まとめる手間をなくしたい',
      priority: '必須',
      scenarios: [
        {
          title: '撮影して申請する',
          type: 'normal',
          given: '出張中である',
          when: '領収書を撮影して申請する',
          outcome: '上長に承認依頼が届く',
        },
      ],
    },
  ],
  nonFunctional: [],
  constraints: [],
  proposalRequests: [],
});

afterEach(() => {
  localStorage.clear();
});

describe('buildRfpMarkdown', () => {
  test('ストーリー作成ツールの As-Is / シナリオを拾う', () => {
    localStorage.setItem('beekle-story-builder-v2', JSON.stringify({ spec }));
    const md = buildRfpMarkdown({ ...EMPTY_INPUTS, projectName: '' });
    expect(md).toContain('# RFP（提案依頼書）ドラフト: 経費精算システムの要件整理');
    expect(md).toContain('出張後に紙の領収書をまとめて申請している。');
    expect(md).toContain('出張先からその場で申請できる。');
    expect(md).toContain('**誰が（As a）**: 営業担当');
    expect(md).toContain('**前提**: 出張中である');
    expect(md).toContain('**操作**: 領収書を撮影して申請する');
  });

  test('入力した背景とプロジェクト名を優先する', () => {
    localStorage.setItem('beekle-story-builder-v2', JSON.stringify({ spec }));
    const md = buildRfpMarkdown({
      ...EMPTY_INPUTS,
      projectName: '社内精算刷新',
      background: 'リモート勤務で承認が滞る',
    });
    expect(md).toContain('# RFP（提案依頼書）ドラフト: 社内精算刷新');
    expect(md).toContain('リモート勤務で承認が滞る');
    expect(md).not.toContain('紙の精算が月末に集中している。');
  });
});
