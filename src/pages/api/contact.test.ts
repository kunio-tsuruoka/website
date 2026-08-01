import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './contact';

const SLACK_URL = 'https://hooks.slack.test/services/x';
const CRM_URL = 'https://crm.test/api/inquiries';

type FetchMock = ReturnType<typeof vi.fn>;

function envelope(env: Record<string, unknown>) {
  return { runtime: { env } };
}

function baseEnv(overrides: Record<string, unknown> = {}) {
  return envelope({
    SLACK_WEBHOOK_URL: SLACK_URL,
    CRM_INQUIRY_WEBHOOK_URL: CRM_URL,
    CRM_INQUIRY_WEBHOOK_TOKEN: 'crm-token',
    OPENROUTER_API_KEY: 'or-key',
    ...overrides,
  });
}

function contactRequest(body: Record<string, unknown> = {}) {
  return new Request('https://beekle.jp/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: '山田太郎',
      email: 'yamada@example.co.jp',
      message: '開発の相談をしたいです。',
      type: 'consultation',
      ...body,
    }),
  });
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function llmVerdict(verdict: string, reason: string) {
  return ok({
    choices: [{ message: { content: JSON.stringify({ verdict, reason }) } }],
    usage: { prompt_tokens: 400, completion_tokens: 20 },
    model: 'openai/gpt-4o-mini',
  });
}

function routeFetch(handlers: {
  openrouter: () => Promise<Response> | Response;
  slack?: () => Promise<Response> | Response;
  crm?: () => Promise<Response> | Response;
}) {
  return vi.fn((url: string) => {
    if (url.includes('openrouter.ai')) return Promise.resolve(handlers.openrouter());
    if (url === SLACK_URL) return Promise.resolve(handlers.slack?.() ?? ok({}));
    if (url === CRM_URL) return Promise.resolve(handlers.crm?.() ?? ok({}));
    throw new Error(`unexpected fetch: ${url}`);
  });
}

function calledUrls(mock: FetchMock): string[] {
  return mock.mock.calls.map((c) => String(c[0]));
}

function slackBody(mock: FetchMock): string {
  const call = mock.mock.calls.find((c) => c[0] === SLACK_URL);
  if (!call) throw new Error('slack was not called');
  return (call[1] as { body: string }).body;
}

describe('POST /api/contact のCRM仕分け', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('営業判定ならCRMに送らず、Slackには通知して見送り理由を出す', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('sales', '特集記事掲載の勧誘'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({ request: contactRequest(), locals: baseEnv() } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toContain(SLACK_URL);
    expect(calledUrls(fetchMock)).not.toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('見送り（営業と判定: 特集記事掲載の勧誘）');
  });

  it('問い合わせ判定ならCRMにも送る', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '開発の相談'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({ request: contactRequest(), locals: baseEnv() } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('実施（問い合わせと判定）');
  });

  it('AI判定が失敗してもCRMに送る（本物のリードを落とさない）', async () => {
    const fetchMock = routeFetch({
      openrouter: () =>
        new Response(JSON.stringify({ error: { message: 'boom' } }), { status: 500 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({ request: contactRequest(), locals: baseEnv() } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('AI判定できず');
  });

  it('APIキー未設定ならLLMを呼ばずCRMに送る', async () => {
    const fetchMock = routeFetch({
      openrouter: () => {
        throw new Error('should not call openrouter');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest(),
      locals: baseEnv({ OPENROUTER_API_KEY: undefined }),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toEqual([SLACK_URL, CRM_URL]);
  });

  it('CRM未設定なら判定せずSlackだけに送る', async () => {
    const fetchMock = routeFetch({
      openrouter: () => {
        throw new Error('should not call openrouter');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest(),
      locals: envelope({ SLACK_WEBHOOK_URL: SLACK_URL, OPENROUTER_API_KEY: 'or-key' }),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toEqual([SLACK_URL]);
    expect(slackBody(fetchMock)).toContain('*CRM連携:* 未設定');
  });

  it('CRM送信が失敗しても問い合わせ自体は成功にする', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '開発の相談'),
      crm: () => new Response('nope', { status: 500 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST({ request: contactRequest(), locals: baseEnv() } as never);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
