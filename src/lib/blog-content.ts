import { renderColumnVisuals } from './column-visuals';

const CTA_CARD_GROUP_PATTERN = /(?:<a class="cv-card cv-card-cta"[\s\S]*?<\/a>\s*)+/g;

export function renderBlogContentVisuals(html: string, blogId: string): string {
  const rendered = renderColumnVisuals(html, { source: `blog-${blogId}` });

  return rendered.replace(CTA_CARD_GROUP_PATTERN, (cards) => {
    const trimmedCards = cards.trim();
    if (!trimmedCards) return cards;
    return `<aside class="blog-cta-stack" aria-label="Beekleへの相談導線">
${trimmedCards}
</aside>`;
  });
}
