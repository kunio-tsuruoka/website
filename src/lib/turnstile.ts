const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileVerifyResult = {
  ok: boolean;
  errorCodes: string[];
  hostname?: string;
  action?: string;
  cdata?: string;
};

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResult> {
  if (!token) return { ok: false, errorCodes: ['missing-input-response'] };
  if (!secret) return { ok: false, errorCodes: ['missing-input-secret'] };

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  let res: Response;
  try {
    res = await fetch(SITEVERIFY_URL, { method: 'POST', body });
  } catch {
    return { ok: false, errorCodes: ['network-error'] };
  }

  if (!res.ok) return { ok: false, errorCodes: [`http-${res.status}`] };

  const data = (await res.json()) as {
    success: boolean;
    'error-codes'?: string[];
    hostname?: string;
    action?: string;
    cdata?: string;
  };

  return {
    ok: data.success === true,
    errorCodes: data['error-codes'] ?? [],
    hostname: data.hostname,
    action: data.action,
    cdata: data.cdata,
  };
}

export function turnstileFailureResponse(result: TurnstileVerifyResult): Response {
  return new Response(JSON.stringify({ error: 'turnstile_failed', codes: result.errorCodes }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}

export async function readTurnstileToken(request: Request): Promise<string> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const clone = request.clone();
    const body = (await clone.json().catch(() => ({}))) as { turnstileToken?: string };
    return body.turnstileToken ?? '';
  }
  if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
    const clone = request.clone();
    const form = await clone.formData().catch(() => null);
    const v = form?.get('cf-turnstile-response') ?? form?.get('turnstileToken');
    return typeof v === 'string' ? v : '';
  }
  return '';
}
