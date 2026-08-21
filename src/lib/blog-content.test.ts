import { describe, expect, it } from 'vitest';
import { renderBlogContentVisuals } from './blog-content';

describe('renderBlogContentVisuals', () => {
  it('expands blog CTA markers with a blog-specific tracking source', () => {
    const result = renderBlogContentVisuals(
      '<p>{{AI_DEV_SERVICE_BRIDGE}}</p><p>{{CONTACT_CTA}}</p>',
      'dto3f38226f'
    );

    expect(result).not.toContain('{{AI_DEV_SERVICE_BRIDGE}}');
    expect(result).not.toContain('{{CONTACT_CTA}}');
    expect(result).toContain(
      '/services/ai-development?source=blog-dto3f38226f&intent=service-bridge'
    );
    expect(result).toContain('/contact?source=blog-dto3f38226f&intent=article-final');
    expect(result).toContain('data-cta-source="blog-dto3f38226f"');
  });
});
