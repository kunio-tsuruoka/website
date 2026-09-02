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
      company: '株式会社テスト',
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

function crmBody(mock: FetchMock): Record<string, unknown> {
  const call = mock.mock.calls.find((c) => c[0] === CRM_URL);
  if (!call) throw new Error('crm was not called');
  return JSON.parse((call[1] as { body: string }).body) as Record<string, unknown>;
}

function crmHeaders(mock: FetchMock): Record<string, string> {
  const call = mock.mock.calls.find((c) => c[0] === CRM_URL);
  if (!call) throw new Error('crm was not called');
  return (call[1] as { headers: Record<string, string> }).headers;
}

function crmCallCount(mock: FetchMock): number {
  return mock.mock.calls.filter((c) => c[0] === CRM_URL).length;
}

function createMemoryKV(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  };
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

  it('submissionIdをCRM payloadと冪等性ヘッダーへ渡し、レスポンスにも返す', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '開発の相談'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        source: 'knowledge-gherkin',
        intent: 'requirements-template-mid',
        submissionId: 'contact-test-submission-123',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      submissionId: 'contact-test-submission-123',
    });

    const body = crmBody(fetchMock) as { meta: Record<string, unknown> };
    expect(body.submission_id).toBe('contact-test-submission-123');
    expect(body.meta.submission_id).toBe('contact-test-submission-123');
    expect(body.meta.source).toBe('knowledge-gherkin');
    expect(body.meta.intent).toBe('requirements-template-mid');
    expect(crmHeaders(fetchMock)).toMatchObject({
      'Idempotency-Key': 'contact-test-submission-123',
      'X-Submission-Id': 'contact-test-submission-123',
    });
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

  it('廃止済み資料DLフォームの送信はSlack/CRM/LLMへ送らない', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '資料ダウンロード'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'download_zero_start',
        source: 'download-zero-start',
        message: '【ゼロスタート開発 サービスデックDL】',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(410);
    expect(calledUrls(fetchMock)).toEqual([]);
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
    expect(await res.json()).toMatchObject({ success: true });
    expect(crmCallCount(fetchMock)).toBe(1);
  });

  it('CRMが失敗しても再送せず1回だけ呼ぶ', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '開発の相談'),
      crm: () => new Response('timeout', { status: 504 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await POST({
      request: contactRequest({ submissionId: 'contact-no-retry' }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(crmCallCount(fetchMock)).toBe(1);
  });

  it('同じsubmissionIdの2回目はCRMに送らない', async () => {
    const kv = createMemoryKV();
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '開発の相談'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await POST({
      request: contactRequest({ submissionId: 'contact-dup-1' }),
      locals: baseEnv({ RATE_LIMIT: kv }),
    } as never);
    const second = await POST({
      request: contactRequest({ submissionId: 'contact-dup-1' }),
      locals: baseEnv({ RATE_LIMIT: kv }),
    } as never);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(crmCallCount(fetchMock)).toBe(1);
    expect(calledUrls(fetchMock).filter((url) => url === SLACK_URL)).toHaveLength(2);
  });
});

describe('POST /api/contact のBuying Stage (tasks-v3 TASK-P0-03)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('buyingStage指定時、Slackに検討状況ラベル・CRM metaに値が載る', async () => {
    const fetchMock = routeFetch({ openrouter: () => llmVerdict('lead', '開発の相談') });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({ buyingStage: 'vendor_comparison' }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(slackBody(fetchMock)).toContain('複数社を比較している');
    const meta = (crmBody(fetchMock) as { meta: Record<string, unknown> }).meta;
    expect(meta.buying_stage).toBe('vendor_comparison');
  });

  it('未選択でも送信でき、Slackは未選択・CRM metaはnullになる', async () => {
    const fetchMock = routeFetch({ openrouter: () => llmVerdict('lead', '開発の相談') });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({ request: contactRequest(), locals: baseEnv() } as never);

    expect(res.status).toBe(200);
    expect(slackBody(fetchMock)).toContain('検討状況');
    const meta = (crmBody(fetchMock) as { meta: Record<string, unknown> }).meta;
    expect(meta.buying_stage).toBeNull();
  });
});

describe('POST /api/contact の会社名と採用仕分け', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('会社名が空の業務問い合わせは400にする', async () => {
    const fetchMock = routeFetch({
      openrouter: () => {
        throw new Error('should not call openrouter');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({ company: '' }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: '会社名を入力してください' });
    expect(calledUrls(fetchMock)).toEqual([]);
  });

  it('採用問い合わせは会社名なしで送れ、CRMには送らない', async () => {
    const fetchMock = routeFetch({
      openrouter: () => {
        throw new Error('should not call openrouter');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'recruitment_casual',
        company: '',
        message: 'カジュアル面談をお願いします。',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toEqual([SLACK_URL]);
    expect(slackBody(fetchMock)).toContain('採用のお問い合わせ');
    expect(slackBody(fetchMock)).toContain('対象外（採用）');
    expect(slackBody(fetchMock)).not.toContain('検討状況');
  });
});

describe('POST /api/contact の協業・パートナー仕分け', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('協業種別ならLLMを呼ばずCRMに送らず、Slackには通知する', async () => {
    const fetchMock = routeFetch({
      openrouter: () => {
        throw new Error('should not call openrouter');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'partner',
        message: '弊社と協業させていただけないかご相談です。',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toEqual([SLACK_URL]);
    expect(slackBody(fetchMock)).toContain(
      '見送り（協業・提携と判定: フォームで協業・パートナーを選択）'
    );
  });

  it('本文が協業提案ならCRMに送らない', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('partnership', '業務提携の打診'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'other',
        message: '業務提携のご相談です。案件を紹介し合える体制を作りたいです。',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).not.toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('見送り（協業・提携と判定: 業務提携の打診）');
  });

  it('開発の依頼・外注種別は発注側なのでCRMに送る', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '自社案件の外注先を探している'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'partner_request',
        message: '受注済み案件の実装をお願いできる先を探しています。',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('実施（問い合わせと判定）');
  });

  it('顧客からの見積もり依頼はCRMに送る', async () => {
    const fetchMock = routeFetch({
      openrouter: () => llmVerdict('lead', '見積もり依頼'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST({
      request: contactRequest({
        type: 'estimate',
        message: '社内システムの開発をお願いしたく、概算費用を伺いたいです。',
      }),
      locals: baseEnv(),
    } as never);

    expect(res.status).toBe(200);
    expect(calledUrls(fetchMock)).toContain(CRM_URL);
    expect(slackBody(fetchMock)).toContain('実施（問い合わせと判定）');
  });
});
