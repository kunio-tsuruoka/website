// 目次（Table of Contents）ユーティリティ

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * HTMLから見出し（h2, h3）を抽出して目次データを生成
 */
export function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = [];
  // h2, h3タグからid属性とテキストを抽出
  const headingRegex = /<h([23])\s+id="([^"]+)"[^>]*>([^<]*)<\/h\1>/gi;
  let match = headingRegex.exec(html);

  while (match !== null) {
    toc.push({
      level: Number.parseInt(match[1], 10),
      id: match[2],
      text: match[3].trim(),
    });
    match = headingRegex.exec(html);
  }

  return toc;
}

/**
 * 日本語テキストをURLセーフなスラッグに変換
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, '-') // 空白をハイフンに
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF-]/g, '') // 英数字・日本語・ハイフン以外を削除
    .replace(/--+/g, '-') // 連続ハイフンを単一に
    .replace(/^-+|-+$/g, ''); // 先頭・末尾のハイフンを削除
}
