/**
 * Build the external share destinations used on column detail pages.
 *
 * @param {{ title: string; url: string }} input
 * @returns {{ x: string; linkedin: string; line: string }}
 */
export function buildSocialShareLinks({ title, url }) {
  const articleUrl = new URL(url);
  if (!['http:', 'https:'].includes(articleUrl.protocol)) {
    throw new TypeError('Share URLs must use http or https.');
  }

  const normalizedTitle = title.trim();
  const trackedUrl = (source) => {
    const value = new URL(articleUrl);
    value.searchParams.set('utm_source', source);
    value.searchParams.set('utm_medium', 'social');
    value.searchParams.set('utm_campaign', 'column_share');
    return value.toString();
  };

  return {
    x: `https://x.com/intent/tweet?${new URLSearchParams({
      text: normalizedTitle,
      url: trackedUrl('x'),
    })}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({
      url: trackedUrl('linkedin'),
    })}`,
    line: `https://social-plugins.line.me/lineit/share?${new URLSearchParams({
      text: normalizedTitle,
      url: trackedUrl('line'),
    })}`,
  };
}
