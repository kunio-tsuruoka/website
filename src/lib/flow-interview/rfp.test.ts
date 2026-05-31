import { describe, expect, test } from 'vitest';
import { type FlowRfp, formatRfpMarkdown } from './rfp';

const rfp: FlowRfp = {
  title: '請求業務システムのRFP',
  background: '手作業が多くミスが発生しやすい。',
  asIsSummary: '営業がExcel入力、経理が請求書作成。',
  toBeSummary: '自動化で転記をなくす。',
  userStories: [
    {
      role: '経理担当',
      want: '請求書を自動生成したい',
      benefit: '手作業を減らせる',
      acceptance: ['売上データから自動生成される', '誤りがない'],
    },
    { role: '営業', want: '売上を一度だけ入力したい', benefit: '二重入力をなくす', acceptance: [] },
  ],
  nonFunctional: ['可用性を確保する'],
  constraints: [],
  proposalRequests: ['概算費用を提示してほしい'],
};

describe('formatRfpMarkdown', () => {
  const md = formatRfpMarkdown(rfp);

  test('章立てが順に並ぶ', () => {
    const order = [
      '# 請求業務システムのRFP',
      '## 1. 背景・目的',
      '## 2. 現状業務（As-Is）',
      '## 3. 目指す姿（To-Be）',
      '## 4. 機能要件（ユーザーストーリー）',
      '## 5. 非機能要件',
      '## 6. 制約・前提',
      '## 7. ご提案いただきたい事項',
    ];
    let prev = -1;
    for (const h of order) {
      const idx = md.indexOf(h);
      expect(idx, `見出し「${h}」が存在`).toBeGreaterThan(-1);
      expect(idx, `「${h}」が順序通り`).toBeGreaterThan(prev);
      prev = idx;
    }
  });

  test('ユーザーストーリーが As a/I want/So that + 受け入れ条件で出る', () => {
    expect(md).toContain('### US-01');
    expect(md).toContain('**誰が（As a）**: 経理担当');
    expect(md).toContain('**何をしたい（I want）**: 請求書を自動生成したい');
    expect(md).toContain('**なぜ（So that）**: 手作業を減らせる');
    expect(md).toContain('  - 売上データから自動生成される');
    expect(md).toContain('### US-02');
  });

  test('受け入れ条件が空なら受け入れ条件行を出さない', () => {
    const us02 = md.slice(md.indexOf('### US-02'));
    expect(us02).not.toContain('受け入れ条件');
  });

  test('空セクションは「要相談」を出す', () => {
    // constraints は空 → 6章に「要相談」
    const sec6 = md.slice(md.indexOf('## 6. 制約・前提'), md.indexOf('## 7.'));
    expect(sec6).toContain('- 要相談');
  });
});
