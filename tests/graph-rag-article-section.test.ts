import { describe, expect, it } from 'vitest';
import {
  GRAPH_RAG_EXAMPLES_HEADING,
  GRAPH_RAG_EXAMPLES_SECTION,
  upsertGraphRagExamplesSection,
} from '../src/lib/content-updates/graph-rag-examples.mjs';

const PM_ON_RAILS_HEADING = '<h2 id="h188ee2fd52">PM on Railsでは、検索より関係の方が難しい</h2>';

function article(...parts: string[]): string {
  return parts.join('\n');
}

describe('upsertGraphRagExamplesSection', () => {
  it('inserts the GraphRAG examples immediately before the PM on Rails section', () => {
    const current = article('<p>既存本文</p>', PM_ON_RAILS_HEADING, '<p>PM on Rails本文</p>');

    const updated = upsertGraphRagExamplesSection(current);

    expect(updated).toContain(GRAPH_RAG_EXAMPLES_SECTION);
    expect(updated.indexOf(GRAPH_RAG_EXAMPLES_HEADING)).toBeLessThan(
      updated.indexOf(PM_ON_RAILS_HEADING),
    );
  });

  it('replaces an existing examples section instead of duplicating it', () => {
    const current = article(
      '<p>既存本文</p>',
      `<h2>${GRAPH_RAG_EXAMPLES_HEADING}</h2>`,
      '<p>古い説明</p>',
      PM_ON_RAILS_HEADING,
      '<p>PM on Rails本文</p>',
    );

    const updated = upsertGraphRagExamplesSection(current);

    expect(updated.split(GRAPH_RAG_EXAMPLES_HEADING)).toHaveLength(2);
    expect(updated).not.toContain('古い説明');
    expect(updated).toContain('不良部品の製造番号');
    expect(updated).toContain('法改正');
    expect(updated).toContain('不正利用');
  });

  it('fails safely when the insertion anchor is missing', () => {
    expect(() => upsertGraphRagExamplesSection('<p>本文だけ</p>')).toThrow(
      /PM on Rails section heading/i,
    );
  });
});
