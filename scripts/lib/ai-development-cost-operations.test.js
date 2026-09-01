import { describe, expect, it } from 'vitest';
import {
  OPERATIONS_NOTE,
  OPERATIONS_ROW_LABEL,
  shouldApplyAiDevelopmentCostOperations,
  transformAiDevelopmentCostOperations,
} from './ai-development-cost-operations.mjs';

const currentContent = [
  '<p>intro</p>',
  '<h2>まず、生成AI開発の費用相場はどのくらいなのか</h2>',
  '<table><tbody>',
  '<tr><th colspan="1" rowspan="1"><p>段階</p></th><th colspan="1" rowspan="1"><p>費用の目安</p></th><th colspan="1" rowspan="1"><p>主に確認すること</p></th></tr>',
  '<tr><td colspan="1" rowspan="1"><p>小規模な実証実験</p></td><td colspan="1" rowspan="1"><p>50〜300万円程度</p></td><td colspan="1" rowspan="1"><p>技術的に成立するか、実データで利用できるか</p></td></tr>',
  '<tr><td colspan="1" rowspan="1"><p>試作品の開発</p></td><td colspan="1" rowspan="1"><p>200〜600万円程度</p></td><td colspan="1" rowspan="1"><p>実際の業務フローで利用できるか</p></td></tr>',
  '<tr><td colspan="1" rowspan="1"><p>本番開発</p></td><td colspan="1" rowspan="1"><p>500〜1,500万円以上</p></td><td colspan="1" rowspan="1"><p>安全性、性能、権限管理、運用体制を含めて継続利用できるか</p></td></tr>',
  '</tbody></table>',
  '<p>この金額は参考値です。</p>',
].join('');

describe('transformAiDevelopmentCostOperations', () => {
  it('現行の3列価格表へ運用費の行と上振れ条件の注記を追加する', () => {
    const result = transformAiDevelopmentCostOperations(currentContent);

    expect(result.changed).toBe(true);
    expect(result.content).toContain(`<p>${OPERATIONS_ROW_LABEL}</p>`);
    expect(result.content).toContain('<p>月20万〜100万円程度</p>');
    expect(result.content).toContain('監視、障害対応、データ更新、回答精度の改善');
    expect(result.content).toContain(`<p>${OPERATIONS_NOTE}</p>`);
    expect(OPERATIONS_NOTE).toContain('AIエンジニア');
    expect(OPERATIONS_NOTE).toContain('PM');
    expect(OPERATIONS_NOTE).toContain('月120万円以上');
    expect(result.content.indexOf(OPERATIONS_ROW_LABEL)).toBeLessThan(
      result.content.indexOf('</tbody>')
    );
  });

  it('同じ変換を再実行しても行と注記を重複させない', () => {
    const first = transformAiDevelopmentCostOperations(currentContent);
    const second = transformAiDevelopmentCostOperations(first.content);

    expect(second.changed).toBe(false);
    expect(second.content).toBe(first.content);
    expect(second.content.split(`<p>${OPERATIONS_ROW_LABEL}</p>`)).toHaveLength(2);
    expect(second.content.split(OPERATIONS_NOTE)).toHaveLength(2);
  });

  it('対象となる価格表がない場合は別の表を書き換えず失敗する', () => {
    expect(() => transformAiDevelopmentCostOperations('<table><tbody></tbody></table>')).toThrow(
      '費用の目安'
    );
  });

  it('運用費の行だけ存在する場合は注記だけを補う', () => {
    const withRowOnly = currentContent.replace(
      '</tbody>',
      '<tr><td colspan="1" rowspan="1"><p>運用・保守・継続改善</p></td><td colspan="1" rowspan="1"><p>月20万〜100万円程度</p></td><td colspan="1" rowspan="1"><p>監視、障害対応、データ更新、回答精度の改善、プロンプトや検索設定の調整など</p></td></tr></tbody>'
    );

    const result = transformAiDevelopmentCostOperations(withRowOnly);

    expect(result.changed).toBe(true);
    expect(result.content.split(`<p>${OPERATIONS_ROW_LABEL}</p>`)).toHaveLength(2);
    expect(result.content.split(OPERATIONS_NOTE)).toHaveLength(2);
  });

  it('同じ文言を含む別の表ではなく、費用表だけを更新する', () => {
    const withAnotherTable =
      `<table><tbody><tr><td><p>本番開発</p></td></tr></tbody></table>${currentContent}`;

    const result = transformAiDevelopmentCostOperations(withAnotherTable);
    const firstTableEnd = result.content.indexOf('</table>');

    expect(result.content.slice(0, firstTableEnd)).not.toContain(OPERATIONS_ROW_LABEL);
    expect(result.content.split(`<p>${OPERATIONS_ROW_LABEL}</p>`)).toHaveLength(2);
  });

  it('PRビルドでは書き込まず、mainへの反映時だけ適用する', () => {
    expect(
      shouldApplyAiDevelopmentCostOperations({
        apply: true,
        githubEventName: 'pull_request',
      })
    ).toBe(false);
    expect(shouldApplyAiDevelopmentCostOperations({ apply: true, githubEventName: 'push' })).toBe(
      true
    );
    expect(shouldApplyAiDevelopmentCostOperations({ apply: false, githubEventName: 'push' })).toBe(
      false
    );
  });
});
