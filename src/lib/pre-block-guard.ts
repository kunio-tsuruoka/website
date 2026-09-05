/**
 * MicroCMS の本文は1行のHTMLだが、<pre> の中だけは改行を含む。
 * marked は `<p...>` 始まりのHTMLブロックを空行で打ち切るため、空行を含む <pre> は
 * 途中から Markdown として再解析され、<p>/<br>/インデントコードブロックに割れる
 * （暗い pre 背景の上に本文色の <p> が乗り、文字が読めなくなる）。
 * marked に渡す前に <pre>…</pre> を退避し、全ての post-process 後に戻す。
 */
const TOKEN_PREFIX = 'BEEKLEPREBLOCK';
const TOKEN_SUFFIX = 'ENDBEEKLEPREBLOCK';

export function extractPreBlocks(content: string): { text: string; blocks: string[] } {
  const blocks: string[] = [];
  const text = content.replace(/<pre[\s\S]*?<\/pre>/g, (block) => {
    blocks.push(block);
    return `${TOKEN_PREFIX}${blocks.length - 1}${TOKEN_SUFFIX}`;
  });
  return { text, blocks };
}

export function restorePreBlocks(html: string, blocks: string[]): string {
  if (blocks.length === 0) return html;
  const token = `${TOKEN_PREFIX}(\\d+)${TOKEN_SUFFIX}`;
  return (
    html
      // marked が単独行のトークンを <p> で包んだ場合は <p> ごと差し戻す
      .replace(new RegExp(`<p>\\s*${token}\\s*</p>`, 'g'), (m, i) => blocks[Number(i)] ?? m)
      .replace(new RegExp(token, 'g'), (m, i) => blocks[Number(i)] ?? m)
  );
}
