import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProcessSteps } from './process-steps';

describe('ProcessSteps', () => {
  it('renders steps visible in the initial HTML', () => {
    const html = renderToStaticMarkup(<ProcessSteps />);

    expect(html).toContain('お問い合わせ・業務理解');
    expect(html).toContain('投資条件の整理');
    expect(html).not.toContain('Go / No-Go');
    expect(html).not.toContain('進む/止める');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('translateY(30px)');
  });
});
