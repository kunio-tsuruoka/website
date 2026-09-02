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
    '<h2>要件から実装・テストまでつなげたい方へ</h2>',
    '<p>GherkinやEARSを読むだけで終わらせず、要求・ユーザーストーリー・受入条件・実装タスク・テスト証跡まで一つにつなげるのがPM on Railsです。AIエージェントに実装させる場合も、何を作り、何をもって完成とするかを追える状態にできます。</p>',
    `<p><a href="${href}" target="_blank" rel="noopener noreferrer">PM on Railsを見る</a></p>`,
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
