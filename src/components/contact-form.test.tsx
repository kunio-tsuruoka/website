import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ContactForm from './contact-form';

describe('ContactForm', () => {
  it('sets expectations for the free initial demo without promising free PoC', () => {
    const html = renderToStaticMarkup(<ContactForm />);

    expect(html).toContain('初回相談・簡易デモは費用をいただきません');
    expect(html).toContain('実データ連携や個別業務に合わせたPoCは別途範囲を定義します');
    expect(html).not.toContain('初期費用0円');
    expect(html).not.toContain('無料相談');
  });
});
