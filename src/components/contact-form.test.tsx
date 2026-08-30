import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ContactForm, { intentToType } from './contact-form';

describe('ContactForm', () => {
  it('sets expectations for the free initial demo without promising free PoC', () => {
    const html = renderToStaticMarkup(<ContactForm />);

    expect(html).toContain('初回相談・簡易デモは費用をいただきません');
    expect(html).toContain('実データ連携や個別業務に合わせたPoCは別途範囲を定義します');
    expect(html).not.toContain('初期費用0円');
    expect(html).not.toContain('無料相談');
  });

  it('依頼と協業を別々の選択肢として出す', () => {
    const html = renderToStaticMarkup(<ContactForm />);

    expect(html).toContain('<option value="partner_request">');
    expect(html).toContain('開発の依頼・外注のご相談（開発会社・SIer様）');
    expect(html).toContain('<option value="partner">');
    expect(html).toContain('協業・提携のご相談');
  });
});

describe('intentToType', () => {
  it('協業LP・記事CTAからの流入は依頼側を初期値にする', () => {
    expect(intentToType('partner')).toBe('partner_request');
    expect(intentToType('partner-mid')).toBe('partner_request');
  });

  it('既存のマッピングは変えない', () => {
    expect(intentToType('rfp')).toBe('requirements');
    expect(intentToType('cdp-selection')).toBe('cdp');
    expect(intentToType('unknown-intent')).toBe('');
  });
});
