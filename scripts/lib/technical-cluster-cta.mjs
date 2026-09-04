// マーカーは <p>{{BRIDGE_CTA}}</p> のように段落で包まれていることがある。
// 差し込むのは <h2> を含むブロック要素なので、<p> の内側に入れると
// MicroCMS のサニタイザに丸ごと弾かれる (PATCH は 200 を返すが本文が変わらない)。
// 包んでいる <p> ごと置き換える。
const BRIDGE_MARKER_PATTERN = /(?:<p>\s*)?\{\{BRIDGE_CTA\}\}(?:\s*<\/p>)?/;

export function buildPmOnRailsCta(slug) {
  const params = new URLSearchParams({
    utm_source: 'beekle.jp',
    utm_medium: 'column',
    utm_campaign: 'technical_cluster',
    utm_content: slug,
  });
  // 属性値の中の & は実体参照にする (生の & は不正なHTML)
  const href = `https://pmonrails.com/waitlist?${params.toString().replace(/&/g, '&amp;')}`;

  return [
    '<h2>GherkinやEARSを自分で書くのは正直かなり大変です</h2>',
    '<p>私たちも、実案件でこれらを全部手書きしたり、レビューしたりするのが大変だったので、「PM on Rails」というシステムを作りました。</p>',
    '<p>お客さまの要望からコーディングまで自動でつなげられるように、要件やGherkinをベストプラクティスに沿って生成してくれます。</p>',
    '<p>宣伝抜きで、かなり良いものができたと思っています。現在はベータ版ですが、そろそろ一般公開する予定なので、興味があればウェイティングリストに登録しておいてください。</p>',
    `<p><a href="${href}" target="_blank" rel="noopener noreferrer">PM on Railsのウェイティングリストに登録する</a></p>`,
    // 1行に詰めたHTMLを送るとブロック境界が壊れるので改行で区切る
  ].join('\n');
}

export function replaceTechnicalClusterCta(content, pattern, slug) {
  const replacement = `\n${buildPmOnRailsCta(slug)}\n`;

  if (BRIDGE_MARKER_PATTERN.test(content)) {
    return {
      content: content.replace(BRIDGE_MARKER_PATTERN, () => replacement),
      status: 'bridge-marker',
    };
  }

  if (pattern.test(content)) {
    return {
      content: content.replace(pattern, () => replacement),
      status: 'hardcoded-cta',
    };
  }

  return { content, status: 'not-found' };
}
