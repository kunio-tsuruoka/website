const BRIDGE_MARKER_PATTERN = /\{\{BRIDGE_CTA\}\}/;

export function buildPmOnRailsCta(slug) {
  const params = new URLSearchParams({
    utm_source: 'beekle.jp',
    utm_medium: 'column',
    utm_campaign: 'technical_cluster',
    utm_content: slug,
  });
  const href = `https://pmonrails.com/waitlist?${params.toString()}`;

  return [
    '<h2>GherkinやEARSを自分で書くのは正直かなり大変です</h2>',
    '<p>私たちも、実案件でこれらを全部手書きしたり、レビューしたりするのが大変だったので、「PM on Rails」というシステムを作りました。</p>',
    '<p>お客さまの要望からコーディングまで自動でつなげられるように、要件やGherkinをベストプラクティスに沿って生成してくれます。</p>',
    '<p>宣伝抜きで、かなり良いものができたと思っています。現在はベータ版ですが、そろそろ一般公開する予定なので、興味があればウェイティングリストに登録しておいてください。</p>',
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
