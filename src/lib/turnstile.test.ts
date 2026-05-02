import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readTurnstileToken, verifyTurnstile } from './turnstile';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

describe('verifyTurnstile', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('token空なら missing-input-response を返してネットワーク呼ばない', async () => {
    const r = await verifyTurnstile('s', '', '1.1.1.1');
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toContain('missing-input-response');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('secret空なら missing-input-secret', async () => {
    const r = await verifyTurnstile('', 'tok', '1.1.1.1');
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toContain('missing-input-secret');
  });

  it('siteverifyが success:true ならok', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ success: true, hostname: 'beekle.jp' }), { status: 200 })
    );
    const r = await verifyTurnstile('s', 'tok');
    expect(r.ok).toBe(true);
    expect(r.hostname).toBe('beekle.jp');
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe(SITEVERIFY_URL);
  });

  it('siteverifyが success:false なら error-codes を伝える', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ success: false, 'error-codes': ['timeout-or-duplicate'] }), {
        status: 200,
      })
    );
    const r = await verifyTurnstile('s', 'tok');
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toEqual(['timeout-or-duplicate']);
  });

  it('HTTPエラーは http-XXX コード', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('', { status: 502 })
    );
    const r = await verifyTurnstile('s', 'tok');
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toEqual(['http-502']);
  });

  it('fetch例外は network-error', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    const r = await verifyTurnstile('s', 'tok');
    expect(r.ok).toBe(false);
    expect(r.errorCodes).toEqual(['network-error']);
  });

  it('remoteIp指定時はFormDataに含まれる', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    await verifyTurnstile('s', 'tok', '9.9.9.9');
    const init = fetchMock.mock.calls[0][1] as { body: FormData };
    expect(init.body.get('secret')).toBe('s');
    expect(init.body.get('response')).toBe('tok');
    expect(init.body.get('remoteip')).toBe('9.9.9.9');
  });
});

describe('readTurnstileToken', () => {
  it('JSONボディの turnstileToken を取り出す', async () => {
    const req = new Request('https://x.com/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ turnstileToken: 'abc123' }),
    });
    expect(await readTurnstileToken(req)).toBe('abc123');
  });

  it('FormDataの cf-turnstile-response を優先で取り出す', async () => {
    const fd = new FormData();
    fd.set('cf-turnstile-response', 'fromform');
    const req = new Request('https://x.com/api', { method: 'POST', body: fd });
    expect(await readTurnstileToken(req)).toBe('fromform');
  });

  it('対応しないcontent-typeなら空文字', async () => {
    const req = new Request('https://x.com/api', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'hi',
    });
    expect(await readTurnstileToken(req)).toBe('');
  });

  it('壊れたJSONでも空文字でフォールバック', async () => {
    const req = new Request('https://x.com/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not json',
    });
    expect(await readTurnstileToken(req)).toBe('');
  });
});
