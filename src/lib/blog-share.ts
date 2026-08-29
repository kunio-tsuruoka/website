import { trackEvent } from './analytics';

export type BlogShareTarget = 'x' | 'linkedin' | 'line' | 'copy' | 'native';
export type BlogSharePosition = 'header' | 'footer';

type BuildBlogShareLinksInput = {
  title: string;
  url: string;
};

type BuildBlogShareEventParamsInput = {
  slug: string;
  target: BlogShareTarget;
  position: BlogSharePosition;
};

export function buildBlogShareLinks({ title, url }: BuildBlogShareLinksInput) {
  const x = new URL('https://twitter.com/intent/tweet');
  x.searchParams.set('text', title);
  x.searchParams.set('url', url);

  const linkedin = new URL('https://www.linkedin.com/sharing/share-offsite/');
  linkedin.searchParams.set('url', url);

  const line = new URL('https://social-plugins.line.me/lineit/share');
  line.searchParams.set('url', url);
  line.searchParams.set('text', title);

  return {
    x: x.toString(),
    linkedin: linkedin.toString(),
    line: line.toString(),
  };
}

export function buildBlogShareEventParams({
  slug,
  target,
  position,
}: BuildBlogShareEventParamsInput): Record<string, string> {
  return {
    article_slug: slug,
    share_target: target,
    share_position: position,
  };
}

function trackBlogShare(root: HTMLElement, target: BlogShareTarget): void {
  const slug = root.dataset.articleSlug;
  const position = root.dataset.sharePosition as BlogSharePosition | undefined;
  if (!slug || !position) return;

  trackEvent(
    'blog_share',
    buildBlogShareEventParams({
      slug,
      target,
      position,
    })
  );
}

function announce(root: HTMLElement, message: string): void {
  const status = root.querySelector<HTMLElement>('[data-share-status]');
  if (status) status.textContent = message;
}

async function copyShareUrl(url: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = url;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) throw new Error('URLをコピーできませんでした');
}

export function initBlogShareButtons(root: ParentNode = document): void {
  if (typeof document === 'undefined') return;

  for (const shareRoot of root.querySelectorAll<HTMLElement>('[data-blog-share-root]')) {
    if (shareRoot.dataset.shareBound === 'true') continue;
    shareRoot.dataset.shareBound = 'true';

    for (const link of shareRoot.querySelectorAll<HTMLAnchorElement>('[data-share-link]')) {
      link.addEventListener('click', () => {
        const target = link.dataset.shareTarget as BlogShareTarget | undefined;
        if (target) trackBlogShare(shareRoot, target);
      });
    }

    const copyButton = shareRoot.querySelector<HTMLButtonElement>('[data-share-copy]');
    copyButton?.addEventListener('click', async () => {
      const url = copyButton.dataset.shareUrl;
      if (!url) return;

      try {
        await copyShareUrl(url);
        trackBlogShare(shareRoot, 'copy');
        announce(shareRoot, 'URLをコピーしました');
        const label = copyButton.querySelector<HTMLElement>('[data-share-label]');
        const original = label?.textContent ?? '';
        if (label) label.textContent = 'コピーしました';
        window.setTimeout(() => {
          if (label) label.textContent = original;
        }, 2000);
      } catch {
        announce(shareRoot, 'URLをコピーできませんでした');
      }
    });

    const nativeButton = shareRoot.querySelector<HTMLButtonElement>('[data-share-native]');
    if (nativeButton && typeof navigator.share === 'function') {
      nativeButton.hidden = false;
      nativeButton.addEventListener('click', async () => {
        const title = nativeButton.dataset.shareTitle;
        const url = nativeButton.dataset.shareUrl;
        if (!title || !url) return;

        try {
          await navigator.share({ title, url });
          trackBlogShare(shareRoot, 'native');
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          announce(shareRoot, '共有画面を開けませんでした');
        }
      });
    }
  }
}
