import { describe, expect, test } from 'vitest';
import {
  formatGherkinFeature,
  formatRfpMarkdown,
  formatScopeMarkdown,
  formatStoryMarkdown,
  isStorySpec,
  normalizeStorySpec,
  parseStorySpecJson,
  storyCountSummary,
} from './story-spec';

const raw = {
  title: '経費精算システムの要件整理',
  background: '紙の精算が月末に集中している。',
  asIs: {
    summary: '出張後に紙の領収書をまとめて申請している。',
    actors: ['営業担当', '上長', '経理'],
    tools: ['紙', 'Excel'],
    pains: ['領収書をなくす', '承認が滞る'],
  },
  toBe: {
    summary: '出張先からその場で申請できる。',
    outcomes: ['紛失がなくなる', '月末のまとめ作業がなくなる'],
  },
  stories: [
    {
      role: '営業担当',
      want: '出張先で領収書を撮影して申請したい',
      benefit: '帰社後にまとめる手間をなくしたい',
      priority: '必須',
      scenarios: [
        {
          title: '撮影した領収書で申請する',
          type: 'normal',
          given: 'Given: 営業担当が出張中である',
          when: '操作: 領収書を撮影して申請する',
          outcome: '上長に承認依頼が届く\nAnd 申請内容が保存される',
        },
        {
          title: '通信できないときに下書きが残る',
          type: 'error',
          given: '申請の途中である',
          when: '送信中に通信できなくなる',
          outcome: '下書きが残り、あとから再送できる',
        },
      ],
    },
    {
      id: 'US-02',
      role: '上長',
      want: '申請をその場で承認したい',
      benefit: '承認待ちを短くしたい',
      priority: '推奨',
      scenarios: [],
    },
  ],
  nonFunctional: ['個人情報を暗号化して保存する'],
  constraints: [],
  proposalRequests: ['概算費用を出してほしい'],
};

describe('normalizeStorySpec', () => {
  const spec = normalizeStorySpec(raw);

  test('ストーリーとシナリオに ID を振る', () => {
    expect(spec.stories[0].id).toBe('US-01');
    expect(spec.stories[1].id).toBe('US-02');
    expect(spec.stories[0].scenarios[0].id).toBe('SC-US-01-N1');
    expect(spec.stories[0].scenarios[1].id).toBe('SC-US-01-E1');
  });

  test('Given/When の接頭辞を落とす', () => {
    expect(spec.stories[0].scenarios[0].given).toBe('営業担当が出張中である');
    expect(spec.stories[0].scenarios[0].when).toBe('領収書を撮影して申請する');
  });
});

describe('parseStorySpecJson', () => {
  test('コードフェンス付き JSON を読む', () => {
    const spec = parseStorySpecJson(`\`\`\`json\n${JSON.stringify(raw)}\n\`\`\``);
    expect(spec.title).toBe('経費精算システムの要件整理');
    expect(spec.stories).toHaveLength(2);
  });

  test('前後の説明文があってもオブジェクトだけ読む', () => {
    const spec = parseStorySpecJson(`了解しました。\n${JSON.stringify(raw)}\n以上です。`);
    expect(spec.stories[0].role).toBe('営業担当');
  });

  test('LLM が then キーで返しても outcome に取り込む', () => {
    const spec = parseStorySpecJson(
      '{"title":"経費精算","asIs":{"summary":"紙で申請している"},"toBe":{"summary":"その場で申請できる"},"stories":[{"role":"営業","want":"申請したい","benefit":"手間を減らしたい","scenarios":[{"title":"申請する","type":"normal","given":"出張中","when":"撮影して申請する","then":"承認依頼が届く"}]}]}'
    );
    expect(spec.stories[0].scenarios[0].outcome).toBe('承認依頼が届く');
  });
});

describe('isStorySpec', () => {
  test('旧 EARS 形式は false', () => {
    expect(
      isStorySpec({
        title: '旧形式',
        story: { role: '営業', want: '申請したい', benefit: '楽にしたい' },
        usecase: { happy: [] },
      })
    ).toBe(false);
  });

  test('正規化後の仕様は true', () => {
    expect(isStorySpec(normalizeStorySpec(raw))).toBe(true);
  });
});

describe('formatStoryMarkdown', () => {
  const md = formatStoryMarkdown(normalizeStorySpec(raw));

  test('As-Is / To-Be / ストーリーがこの順で出る', () => {
    const asIs = md.indexOf('## 現状（As-Is）');
    const toBe = md.indexOf('## 目指す姿（To-Be）');
    const stories = md.indexOf('## ユーザーストーリーとシナリオ');
    expect(asIs).toBeGreaterThan(-1);
    expect(toBe).toBeGreaterThan(asIs);
    expect(stories).toBeGreaterThan(toBe);
  });

  test('シナリオを Gherkin で書く', () => {
    expect(md).toContain('```gherkin');
    expect(md).toContain('Scenario: 撮影した領収書で申請する');
    expect(md).toContain('Given 営業担当が出張中である');
    expect(md).toContain('When 領収書を撮影して申請する');
    expect(md).toContain('Then 上長に承認依頼が届く');
    expect(md).toContain('And 申請内容が保存される');
  });
});

describe('formatGherkinFeature', () => {
  test('Feature / Rule / Scenario の .feature を出す', () => {
    const feature = formatGherkinFeature(normalizeStorySpec(raw));
    expect(feature).toContain('# language: ja');
    expect(feature).toContain('Feature: 経費精算システムの要件整理');
    expect(feature).toContain('Rule: US-01 営業担当が出張先で領収書を撮影して申請したい');
    expect(feature).toContain('Scenario: 撮影した領収書で申請する');
    expect(feature).toContain('Given 営業担当が出張中である');
    expect(feature).toContain('When 領収書を撮影して申請する');
    expect(feature).toContain('Then 上長に承認依頼が届く');
    expect(feature).toContain('And 申請内容が保存される');
  });
});

describe('formatRfpMarkdown', () => {
  const md = formatRfpMarkdown(normalizeStorySpec(raw));

  test('RFP の章立てが揃う', () => {
    expect(md).toContain('# RFP（提案依頼書）ドラフト: 経費精算システムの要件整理');
    expect(md).toContain('## 2. 現状業務（As-Is）');
    expect(md).toContain('## 3. 目指す姿（To-Be）');
    expect(md).toContain('## 4. 機能要件（ユーザーストーリーとシナリオ）');
    expect(md).toContain('### US-01');
    expect(md).toContain('**誰が（As a）**: 営業担当');
  });

  test('空の制約は要相談にする', () => {
    const sec = md.slice(md.indexOf('## 6. 制約・前提'), md.indexOf('## 7.'));
    expect(sec).toContain('- 要相談');
  });
});

describe('formatScopeMarkdown', () => {
  const md = formatScopeMarkdown(normalizeStorySpec(raw));

  test('スコープ管理が拾える互換行を出す', () => {
    expect(md).toContain('- **SC-US-01-N1**（正常系・必須・由来:AI整理）');
    expect(md).toContain('- **SC-US-01-E1**（異常系・必須・由来:AI整理）');
    expect(md).toContain('領収書を撮影して申請すると、上長に承認依頼が届く');
  });
});

describe('storyCountSummary', () => {
  test('件数を数える', () => {
    expect(storyCountSummary(normalizeStorySpec(raw))).toEqual({ stories: 2, scenarios: 2 });
  });
});
