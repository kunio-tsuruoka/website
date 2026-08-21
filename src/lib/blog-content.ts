import { renderColumnVisuals } from './column-visuals';

export function renderBlogContentVisuals(html: string, blogId: string): string {
  return renderColumnVisuals(html, { source: `blog-${blogId}` });
}
