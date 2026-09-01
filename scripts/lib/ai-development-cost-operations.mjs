export const OPERATIONS_ROW_LABEL = '運用・保守・継続改善';
export const OPERATIONS_NOTE =
  '※複数システムとの連携、高頻度のAI改善、継続的な要件整理・プロジェクト管理が必要で、AIエンジニアとPM（プロジェクトマネージャー）が継続して参画する場合は、月120万円以上となることがあります。';

const PRICE_TABLE_HEADER_MARKER = '<p>費用の目安</p>';
const TARGET_ROW_LABEL = '本番開発';
const TARGET_ROW_MARKER = `<p>${TARGET_ROW_LABEL}</p>`;
const OPERATIONS_ROW_MARKER = `<p>${OPERATIONS_ROW_LABEL}</p>`;

const OPERATIONS_ROW =
  '<tr><td colspan="1" rowspan="1"><p>運用・保守・継続改善</p></td><td colspan="1" rowspan="1"><p>月20万〜100万円程度</p></td><td colspan="1" rowspan="1"><p>監視、障害対応、データ更新、回答精度の改善、プロンプトや検索設定の調整など</p></td></tr>';

const OPERATIONS_NOTE_HTML = `<p>${OPERATIONS_NOTE}</p>`;

export function shouldApplyAiDevelopmentCostOperations({ apply, githubEventName }) {
  return apply && githubEventName !== 'pull_request';
}

function occurrenceCount(content, value) {
  return content.split(value).length - 1;
}

function locatePricingTable(content) {
  const headerCount = occurrenceCount(content, PRICE_TABLE_HEADER_MARKER);
  if (headerCount !== 1) {
    throw new Error(`費用の目安を含む価格表を一意に特定できません（検出数: ${headerCount}）`);
  }

  const headerIndex = content.indexOf(PRICE_TABLE_HEADER_MARKER);
  const tableStart = content.lastIndexOf('<table', headerIndex);
  const tableEndStart = content.indexOf('</table>', headerIndex);

  if (tableStart === -1 || tableEndStart === -1 || tableStart > headerIndex) {
    throw new Error('費用の目安を含む価格表の構造を確認できません');
  }

  const tableEnd = tableEndStart + '</table>'.length;
  return {
    start: tableStart,
    end: tableEnd,
    content: content.slice(tableStart, tableEnd),
  };
}

export function transformAiDevelopmentCostOperations(content) {
  if (typeof content !== 'string' || content.length === 0) {
    throw new TypeError('記事本文は空でない文字列である必要があります');
  }

  let nextContent = content;
  let changed = false;
  let pricingTable = locatePricingTable(nextContent);

  const operationsRowCount = occurrenceCount(pricingTable.content, OPERATIONS_ROW_MARKER);
  if (operationsRowCount > 1) {
    throw new Error(`${OPERATIONS_ROW_LABEL}の行が価格表に複数あります`);
  }

  if (operationsRowCount === 0) {
    const targetCount = occurrenceCount(pricingTable.content, TARGET_ROW_MARKER);
    if (targetCount !== 1) {
      throw new Error(
        `${TARGET_ROW_LABEL}の行を価格表内で一意に特定できません（検出数: ${targetCount}）`
      );
    }

    const targetLabelIndex = pricingTable.content.indexOf(TARGET_ROW_MARKER);
    const targetRowStart = pricingTable.content.lastIndexOf('<tr', targetLabelIndex);
    const targetRowEnd = pricingTable.content.indexOf('</tr>', targetLabelIndex);
    const targetTableBodyEnd = pricingTable.content.indexOf('</tbody>', targetLabelIndex);

    if (
      targetRowStart === -1 ||
      targetRowEnd === -1 ||
      targetTableBodyEnd === -1 ||
      targetRowEnd > targetTableBodyEnd
    ) {
      throw new Error(`${TARGET_ROW_LABEL}を含む価格表の行構造を確認できません`);
    }

    const insertAt = targetRowEnd + '</tr>'.length;
    const updatedTable =
      pricingTable.content.slice(0, insertAt) +
      OPERATIONS_ROW +
      pricingTable.content.slice(insertAt);

    nextContent =
      nextContent.slice(0, pricingTable.start) + updatedTable + nextContent.slice(pricingTable.end);
    changed = true;
    pricingTable = locatePricingTable(nextContent);
  }

  const noteCount = occurrenceCount(nextContent, OPERATIONS_NOTE);
  if (noteCount > 1) {
    throw new Error('運用費の注記が複数あります');
  }

  if (noteCount === 0) {
    nextContent =
      nextContent.slice(0, pricingTable.end) +
      OPERATIONS_NOTE_HTML +
      nextContent.slice(pricingTable.end);
    changed = true;
  }

  return { content: nextContent, changed };
}
