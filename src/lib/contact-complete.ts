const CONTACT_COMPLETE_KEY_PREFIX = 'beekle-contact-complete-v1:';

type ContactCompleteEventParams = {
  method: 'form';
  from: string;
  source?: string;
  intent?: string;
  phase?: string;
  submission_id: string;
  transport_type: 'beacon';
};

type ContactCompleteWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export function buildContactCompleteEventParams(search: string): ContactCompleteEventParams | null {
  const sp = new URLSearchParams(search);
  const from = sp.get('from') || '';
  const submissionId = sp.get('submission_id') || '';

  if (from === 'zero-start' || !submissionId) return null;

  const params: ContactCompleteEventParams = {
    method: 'form',
    from: from || 'contact',
    submission_id: submissionId,
    transport_type: 'beacon',
  };
  const source = sp.get('source') || '';
  const intent = sp.get('intent') || '';
  const phase = sp.get('phase') || '';
  if (source) params.source = source;
  if (intent) params.intent = intent;
  if (phase) params.phase = phase;
  return params;
}

export function claimContactCompleteSubmission(storage: Storage | undefined, submissionId: string) {
  if (!submissionId || !storage) return true;

  try {
    const key = `${CONTACT_COMPLETE_KEY_PREFIX}${submissionId}`;
    if (storage.getItem(key)) return false;
    storage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

export function fireContactCompleteFromLocation(win: ContactCompleteWindow = window): void {
  let fired = false;
  const fire = () => {
    if (fired || typeof win.gtag !== 'function') return;

    const params = buildContactCompleteEventParams(win.location.search);
    if (!params) return;
    if (!claimContactCompleteSubmission(win.sessionStorage, params.submission_id)) return;

    fired = true;
    win.gtag('event', 'contact_complete', params);
  };

  fire();
  if (win.document.readyState === 'complete') {
    win.setTimeout(fire, 0);
  } else {
    win.addEventListener('load', () => win.setTimeout(fire, 0));
  }
}
