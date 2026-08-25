import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('renders navigation controls that work without React hydration', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('<header');
    expect(html).toContain('発注前に相談する');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });

  it('keeps desktop dropdown menus in a native exclusive group', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html.match(/相談が始まる場面一覧/g)).toHaveLength(2);
    expect(html.match(/要件が固まらず発注できない/g)).toHaveLength(2);
    expect(html.match(/動くもので判断するゼロスタート/g)).toHaveLength(2);
    expect(html.match(/RAGシステム構築/g)).toHaveLength(2);
    expect(html.match(/資料・判断材料/g)).toHaveLength(2);
    expect(html.match(/進め方/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('uses customer-facing labels in the global navigation', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).not.toContain('PM on Rails');
    expect(html).not.toContain('pmonrails.com');
    expect(html).not.toContain('開発方法');
    expect(html).toContain('進行管理と仕様の見える化');
  });

  it('keeps the desktop dropdown hover path connected to the trigger', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('top-full z-50 w-72 pt-2');
    expect(html).not.toContain('top-full z-50 mt-2');
  });
});
