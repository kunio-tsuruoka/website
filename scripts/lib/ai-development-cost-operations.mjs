export const OPERATIONS_ROW_LABEL = '運用・保守・継続改善';
export const OPERATIONS_NOTE =
  '※複数システムとの連携、高頻度の改善、手厚い監視・サポートが必要な場合は、月120万円以上となることがあります。';

const TARGET_ROW_LABEL = '本番運用するシステム';
const OPERATIONS_ROW_MARKER = `<strong>${OPERATIONS_ROW_LABEL}</strong>`;
const TARGET_ROW_MARKER = `<strong>${TARGET_ROW_LABEL}</strong>`;

const OPERATIONS_ROW =
  '<tr><td><strong>運用・保守・継続改善</strong></td><td><strong>毎月</strong></td><td><strong>月20万〜100万円程度</strong></td><td>監視、障害対応、データ更新、回答精度の改善、プロンプトや検索設定の調整など</td></tr>';

const OPERATIONS_NOTE_HTML = `<p><small>${OPERATIONS_NOTE}</small></p>`;

function occurrenceCount(content, value) {
  return content.split(value).length - 1;
}

export function transformAiDevelopmentCostOperations(content) {
  if (typeof content !== 'string' || content.length === 0) {
    throw new TypeError('記事本文は空でない文字列である必要があります');
  }

  let nextContent = content;
  let changed = false;

  const operationsRowCount = occurrenceCount(nextContent, OPERATIONS_ROW_MARKER);
  if (operationsRowCount > 1) {
    throw new Error(`${OPERATIONS_ROW_LABEL}の行が複数あります`);
  }

  if (operationsRowCount === 0) {
    const targetCount = occurrenceCount(nextContent, TARGET_ROW_MARKER);
    if (targetCount !== 1) {
      throw new Error(
        `${TARGET_ROW_LABEL}の行を一意に特定できません（検出数: ${targetCount}）`
      );
    }

    const targetLabelIndex = nextContent.indexOf(TARGET_ROW_MARKER);
    const targetRowStart = nextContent.lastIndexOf('<tr', targetLabelIndex);
    const targetRowEnd = nextContent.indexOf('</tr>', targetLabelIndex);
    const targetTableBodyEnd = nextContent.indexOf('</tbody>', targetLabelIndex);

    if (
      targetRowStart === -1 ||
      targetRowEnd === -1 ||
      targetTableBodyEnd === -1 ||
      targetRowEnd > targetTableBodyEnd
    ) {
      throw new Error(`${TARGET_ROW_LABEL}を含む価格表の構造を確認できません`);
    }

    const insertAt = targetRowEnd + '</tr>'.length;
    nextContent =
      nextContent.slice(0, insertAt) + OPERATIONS_ROW + nextContent.slice(insertAt);
    changed = true;
  }

  const noteCount = occurrenceCount(nextContent, OPERATIONS_NOTE);
  if (noteCount > 1) {
    throw new Error('運用費の注記が複数あります');
  }

  if (noteCount === 0) {
    const operationsRowIndex = nextContent.indexOf(OPERATIONS_ROW_MARKER);
    const tableEnd = nextContent.indexOf('</table>', operationsRowIndex);

    if (operationsRowIndex === -1 || tableEnd === -1) {
      throw new Error(`${OPERATIONS_ROW_LABEL}を含む価格表の終了位置を確認できません`);
    }

    const insertAt = tableEnd + '</table>'.length;
    nextContent =
      nextContent.slice(0, insertAt) + OPERATIONS_NOTE_HTML + nextContent.slice(insertAt);
    changed = true;
  }

  return { content: nextContent, changed };
}
