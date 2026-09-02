import { render } from '@testing-library/react';
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

  it('exposes the process, preparation kit, and company pages on desktop and mobile', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html.match(/href="\/process"/g)).toHaveLength(2);
    expect(html.match(/導入の流れ/g)).toHaveLength(2);
    expect(html.match(/href="\/tools"/g)).toHaveLength(2);
    expect(html.match(/発注準備キット/g)).toHaveLength(2);
    expect(html.match(/href="\/company"/g)).toHaveLength(2);
    expect(html.match(/href="\/partner"/g)).toHaveLength(2);
    expect(html.match(/会社情報/g)).toHaveLength(2);
  });

  it('collapses mobile navigation sections until the visitor opens one', () => {
    const { container } = render(<Header />);
    const mobileMenu = container.querySelector('header nav > details');
    const mobilePanel = mobileMenu?.querySelector(':scope > div');
    const sectionDetails = mobileMenu?.querySelectorAll(':scope > div > ul > li > details');
    const sectionLabels = Array.from(sectionDetails ?? []).map((details) =>
      details.querySelector('summary')?.textContent?.trim()
    );

    expect(sectionDetails).toHaveLength(5);
    expect(mobilePanel).toHaveClass('min-h-[calc(100vh-76px)]');
    expect(sectionLabels).toEqual(['課題から探す', '進め方', 'サービス', '判断材料', '会社情報']);
  });

  it('exposes AI agent development in both desktop and mobile service menus', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html.match(/AIエージェント開発/g)).toHaveLength(2);
    expect(html.match(/\/services\/ai-agent-development/g)).toHaveLength(2);
  });

  it('uses customer-facing labels in the global navigation', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).not.toContain('PM on Rails');
    expect(html).not.toContain('pmonrails.com');
    expect(html).not.toContain('開発方法');
    expect(html).not.toContain('進行管理と仕様の見える化');
    expect(html).toContain('導入の流れ');
  });

  it('keeps the desktop dropdown hover path connected to the trigger', () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('top-full z-50 w-72 pt-2');
    expect(html).not.toContain('top-full z-50 mt-2');
  });
});
