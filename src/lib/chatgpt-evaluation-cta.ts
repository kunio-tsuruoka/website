declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const CHATGPT_URL = 'https://chatgpt.com/';

function setStatus(root: Element, message: string): void {
  const status = root.querySelector<HTMLElement>('[data-chatgpt-evaluation-status]');
  if (!status) return;
  status.textContent = message;
  status.hidden = false;
}

function setFallbackVisible(root: Element, visible: boolean): void {
  const fallback = root.querySelector<HTMLElement>('[data-chatgpt-evaluation-fallback]');
  if (!fallback) return;
  fallback.hidden = !visible;
}

function getPrompt(root: Element): string {
  return (
    root.querySelector<HTMLTextAreaElement>('[data-chatgpt-evaluation-prompt]')?.value.trim() ?? ''
  );
}

function getArticleSlug(source: string): string {
  return source.replace(/^(column|blog)-/, '');
}

function trackEvaluationClick(root: HTMLElement, copyResult: 'success' | 'failure'): void {
  if (typeof window.gtag !== 'function') return;
  const articleSource = root.dataset.ctaSource ?? 'unknown';
  window.gtag('event', 'chatgpt_evaluation_click', {
    article_slug: getArticleSlug(articleSource),
    article_source: articleSource,
    cta_location: root.dataset.ctaLocation ?? 'article-body',
    evaluation_type: root.dataset.evaluationType ?? 'unknown',
    copy_result: copyResult,
    page_path: window.location.pathname,
  });
}

async function handleEvaluationClick(root: HTMLElement): Promise<void> {
  const prompt = getPrompt(root);
  try {
    if (!prompt || typeof navigator.clipboard?.writeText !== 'function') {
      throw new Error('Clipboard API is not available.');
    }
    await navigator.clipboard.writeText(prompt);
    setFallbackVisible(root, false);
    setStatus(root, '判定用プロンプトをコピーしました。開発会社の回答を貼り付けてください。');
    trackEvaluationClick(root, 'success');
    window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer');
  } catch {
    setFallbackVisible(root, true);
    setStatus(root, 'コピーできませんでした。下の判定用プロンプトを手動でコピーしてください。');
    root.querySelector<HTMLTextAreaElement>('[data-chatgpt-evaluation-prompt]')?.focus();
    trackEvaluationClick(root, 'failure');
  }
}

export function initChatGptEvaluationCtas(root: ParentNode = document): void {
  const ctas = root.querySelectorAll<HTMLElement>('[data-chatgpt-evaluation-cta]');
  for (const cta of ctas) {
    const button = cta.querySelector<HTMLButtonElement>('[data-chatgpt-evaluation-button]');
    if (!button || button.dataset.chatgptEvaluationReady === 'true') continue;
    button.dataset.chatgptEvaluationReady = 'true';
    button.addEventListener('click', () => {
      void handleEvaluationClick(cta);
    });
  }
}
