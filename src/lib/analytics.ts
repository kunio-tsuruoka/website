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
