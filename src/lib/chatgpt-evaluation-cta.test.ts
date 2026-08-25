import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initChatGptEvaluationCtas } from './chatgpt-evaluation-cta';

function renderFixture() {
  document.body.innerHTML = `
    <section
      data-chatgpt-evaluation-cta
      data-cta-source="column-ai-vendor"
      data-evaluation-type="technical_skill"
      data-cta-location="article-body"
    >
      <button type="button" data-chatgpt-evaluation-button>ChatGPTでこの会社を判定する</button>
      <textarea data-chatgpt-evaluation-prompt>判定プロンプト本文</textarea>
      <p data-chatgpt-evaluation-status hidden></p>
      <details data-chatgpt-evaluation-fallback hidden>
        <summary>手動コピー</summary>
      </details>
    </section>
  `;
}

describe('initChatGptEvaluationCtas', () => {
  beforeEach(() => {
    renderFixture();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    vi.spyOn(window, 'open').mockImplementation(() => null);
    window.gtag = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    window.gtag = undefined;
  });

  it('copies the prompt, opens ChatGPT, and tracks the evaluation click', async () => {
    initChatGptEvaluationCtas();

    document.querySelector<HTMLButtonElement>('[data-chatgpt-evaluation-button]')?.click();
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('判定プロンプト本文');
    expect(window.open).toHaveBeenCalledWith(
      'https://chatgpt.com/',
      '_blank',
      'noopener,noreferrer'
    );
    expect(document.querySelector('[data-chatgpt-evaluation-status]')?.textContent).toContain(
      '判定用プロンプトをコピーしました'
    );
    expect(window.gtag).toHaveBeenCalledWith('event', 'chatgpt_evaluation_click', {
      article_slug: 'ai-vendor',
      article_source: 'column-ai-vendor',
      cta_location: 'article-body',
      evaluation_type: 'technical_skill',
      copy_result: 'success',
      page_path: '/',
    });
  });

  it('shows a manual-copy fallback when clipboard copy fails', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('denied'));

    initChatGptEvaluationCtas();

    document.querySelector<HTMLButtonElement>('[data-chatgpt-evaluation-button]')?.click();
    await Promise.resolve();

    expect(window.open).not.toHaveBeenCalled();
    expect(
      document.querySelector('[data-chatgpt-evaluation-fallback]')?.hasAttribute('hidden')
    ).toBe(false);
    expect(document.querySelector('[data-chatgpt-evaluation-status]')?.textContent).toContain(
      'コピーできませんでした'
    );
    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'chatgpt_evaluation_click',
      expect.objectContaining({
        article_source: 'column-ai-vendor',
        evaluation_type: 'technical_skill',
        copy_result: 'failure',
      })
    );
  });
});
