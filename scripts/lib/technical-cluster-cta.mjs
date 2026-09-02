const BRIDGE_MARKER_PATTERN = /\{\{BRIDGE_CTA\}\}/;

export function buildPmOnRailsCta(slug) {
  const params = new URLSearchParams({
    utm_source: 'beekle.jp',
    utm_medium: 'column',
    utm_campaign: 'technical_cluster',
    utm_content: slug,
  });
  const href = `https://pmonrails.com/?${params.toString()}`;

  return [
    '<h2>GherkinやEARSを毎回自分で書くのは、正直かなり大変です</h2>',
    '<p>僕らも実案件でこれを全部手で書き続けるのが大変だったので、議事録や要望から、要求・ユーザーストーリー・受入条件・Gherkin・実装タスクまで生成してつなげる「PM on Rails」を作りました。自分たちが実際に困っていた作業を減らすために作ったもので、宣伝抜きでかなり良いものができたと思っています。</p>',
    '<p>現在はベータ版ですが、そろそろ一般公開する予定です。こういう仕様整理やGherkin作成を毎回手でやっているなら、一般公開の案内を受け取れるウェイティングリストに登録しておいてください。</p>',
    `<p><a href="${href}" target="_blank" rel="noopener noreferrer">PM on Railsのウェイティングリストに登録する</a></p>`,
  ].join('');
}

export function replaceTechnicalClusterCta(content, pattern, slug) {
  const replacement = buildPmOnRailsCta(slug);

  if (BRIDGE_MARKER_PATTERN.test(content)) {
    return {
      content: content.replace(BRIDGE_MARKER_PATTERN, replacement),
      status: 'bridge-marker',
    };
  }

  if (pattern.test(content)) {
    return {
      content: content.replace(pattern, replacement),
      status: 'hardcoded-cta',
    };
  }

  return { content, status: 'not-found' };
}
