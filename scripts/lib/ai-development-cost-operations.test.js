import { describe, expect, it } from 'vitest';
import {
  OPERATIONS_NOTE,
  OPERATIONS_ROW_LABEL,
  transformAiDevelopmentCostOperations,
} from './ai-development-cost-operations.mjs';

const currentContent = [
  '<p>intro</p>',
  '<table><thead><tr><th rowspan="2">開発段階</th><th colspan="2">費用の目安</th><th rowspan="2">できること</th></tr><tr><th>期間</th><th>金額</th></tr></thead><tbody>',
  '<tr><td><strong>小さく確かめる（小規模な実証実験）</strong></td><td><strong>2〜6週間</strong></td><td><strong>50万〜300万円</strong></td><td>小さく確認する</td></tr>',
  '<tr><td><strong>実際に操作できる試作品（プロトタイプ）</strong></td><td><strong>1〜3か月</strong></td><td><strong>200万〜600万円</strong></td><td>試作品を作る</td></tr>',
  '<tr><td><strong>本番運用するシステム</strong></td><td><strong>3〜6か月</strong></td><td><strong>500万〜1,500万円以上</strong></td><td>実際の業務で継続して使う</td></tr>',
  '</tbody></table>',
  '<p>after</p>',
].join('');

describe('transformAiDevelopmentCostOperations', () => {
  it('価格表へ運用費の行と上振れ条件の注記を追加する', () => {
    const result = transformAiDevelopmentCostOperations(currentContent);

    expect(result.changed).toBe(true);
    expect(result.content).toContain(OPERATIONS_ROW_LABEL);
    expect(result.content).toContain('月20万〜100万円程度');
    expect(result.content).toContain('監視、障害対応、データ更新、回答精度の改善');
    expect(result.content).toContain(OPERATIONS_NOTE);
    expect(result.content.indexOf(OPERATIONS_ROW_LABEL)).toBeLessThan(
      result.content.indexOf('</tbody>')
    );
  });

  it('同じ変換を再実行しても行と注記を重複させない', () => {
    const first = transformAiDevelopmentCostOperations(currentContent);
    const second = transformAiDevelopmentCostOperations(first.content);

    expect(second.changed).toBe(false);
    expect(second.content).toBe(first.content);
    expect(second.content.split(OPERATIONS_ROW_LABEL)).toHaveLength(2);
    expect(second.content.split(OPERATIONS_NOTE)).toHaveLength(2);
  });

  it('対象となる本番運用行がない場合は別の表を書き換えず失敗する', () => {
    expect(() =>
      transformAiDevelopmentCostOperations('<table><tbody></tbody></table>')
    ).toThrow('本番運用するシステム');
  });

  it('運用費の行だけ存在する場合は注記だけを補う', () => {
    const withRowOnly = currentContent.replace(
      '</tbody>',
      '<tr><td><strong>運用・保守・継続改善</strong></td><td><strong>毎月</strong></td><td><strong>月20万〜100万円程度</strong></td><td>監視、障害対応、データ更新、回答精度の改善、プロンプトや検索設定の調整など</td></tr></tbody>'
    );

    const result = transformAiDevelopmentCostOperations(withRowOnly);

    expect(result.changed).toBe(true);
    expect(result.content.split(OPERATIONS_ROW_LABEL)).toHaveLength(2);
    expect(result.content.split(OPERATIONS_NOTE)).toHaveLength(2);
  });
});
