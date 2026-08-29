/**
 * Build the external share destinations used on blog detail pages.
 *
 * @param {{ title: string; url: string }} input
 * @returns {{ x: string; linkedin: string; facebook: string }}
 */
export function buildSocialShareLinks({ title, url }) {
  const articleUrl = new URL(url);
  if (!['http:', 'https:'].includes(articleUrl.protocol)) {
    throw new TypeError('Share URLs must use http or https.');
  }

  const normalizedUrl = articleUrl.toString();
  const normalizedTitle = title.trim();

  return {
    x: `https://twitter.com/intent/tweet?${new URLSearchParams({
      text: normalizedTitle,
      url: normalizedUrl,
    })}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({
      url: normalizedUrl,
    })}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({
      u: normalizedUrl,
    })}`,
  };
}
