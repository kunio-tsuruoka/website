declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type CtaClickParams = {
  source: string;
  cta: string;
  meta?: Record<string, string | undefined>;
};

export function trackCtaClick({ source, cta, meta }: CtaClickParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const payload: Record<string, string> = { source, cta };
  if (meta) {
    for (const [k, v] of Object.entries(meta)) {
      if (typeof v === 'string' && v.length > 0) payload[k] = v;
    }
  }
  window.gtag('event', 'cta_click', payload);
}

type ToolEventName =
  | 'tool_start'
  | 'tool_save'
  | 'tool_export'
  | 'tool_load_sample'
  | 'tool_load_template'
  | 'tool_complete';

type ToolEventParams = {
  tool: 'flow-mapper' | 'story-builder' | 'scope-manager';
  meta?: Record<string, string | number | undefined>;
};

export function trackToolEvent(event: ToolEventName, { tool, meta }: ToolEventParams): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const payload: Record<string, string | number> = { tool };
  if (meta) {
    for (const [k, v] of Object.entries(meta)) {
      if (v !== undefined && v !== '') payload[k] = v;
    }
  }
  window.gtag('event', event, payload);
}

// スクロール読了イベント。長尺ページ（コラム等）でのみ 25/50/75/100% の到達を計測し、
// エンゲージメントをカスタマージャーニーに乗せる。既存のカスタムディメンション
// `scroll_depth`（EVENT scope）を再利用する。
export function initEngagementTracking(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const milestones = [25, 50, 75, 100];
  const fired = new Set<number>();
  let scheduled = false;

  const evaluate = () => {
    scheduled = false;
    const docEl = document.documentElement;
    const scrollable = docEl.scrollHeight - window.innerHeight;
    // 短いページ（スクロール余地が画面高の半分未満）はノイズになるので計測しない。
    if (scrollable < window.innerHeight * 0.5) return;
    const percent = (window.scrollY / scrollable) * 100;
    for (const m of milestones) {
      if (percent >= m && !fired.has(m)) {
        fired.add(m);
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'scroll_depth', {
            scroll_depth: String(m),
            page_path: window.location.pathname,
            transport_type: 'beacon',
          });
        }
      }
    }
    if (fired.size === milestones.length) {
      window.removeEventListener('scroll', onScroll);
    }
  };

  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(evaluate);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // 初回評価（読み込み時点で既に下部にいる短いページ / リロード位置復元に対応）。
  onScroll();
}

export function buildContactUrl(params: {
  source: string;
  intent?: 'pre-tool' | 'tool-stuck' | 'review-request';
  phase?: string;
}): string {
  const sp = new URLSearchParams();
  sp.set('source', params.source);
  if (params.intent) sp.set('intent', params.intent);
  if (params.phase) sp.set('phase', params.phase);
  return `/contact?${sp.toString()}`;
}
