import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type LeadInput,
  buildUserPrompt,
  classifyInquiry,
  parseClassification,
} from './lead-classifier';

const BASE_INPUT: LeadInput = {
  name: '川口 優奈',
  company: '',
  email: 'kawaguti@example.jp',
  phone: '',
  typeLabel: 'その他',
  message: '取材のご相談です。無料で記事化いたします。',
  source: 'header-mobile',
  landingPage: '/',
  referrer: 'https://sales-crowd.jp/',
};

function mockResponse(content: string) {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 500, completion_tokens: 30 },
      model: 'openai/gpt-4o-mini',
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

describe('parseClassification', () => {
  it('lead を読み取る', () => {
    expect(parseClassification('{"verdict":"lead","reason":"開発の相談"}')).toEqual({
      verdict: 'lead',
      reason: '開発の相談',
    });
  });

  it('sales を読み取る', () => {
    expect(parseClassification('{"verdict":"sales","reason":"取材掲載の売り込み"}')).toEqual({
      verdict: 'sales',
      reason: '取材掲載の売り込み',
    });
  });

  it('partnership を読み取る', () => {
    expect(parseClassification('{"verdict":"partnership","reason":"業務提携の打診"}')).toEqual({
      verdict: 'partnership',
      reason: '業務提携の打診',
    });
  });

  it('コードフェンス付きでも読み取る', () => {
    const text = '```json\n{"verdict":"SALES","reason":"人材紹介の営業"}\n```';
    expect(parseClassification(text).verdict).toBe('sales');
  });

  it('reason 欠落でも verdict は生きる', () => {
    expect(parseClassification('{"verdict":"lead"}')).toEqual({
      verdict: 'lead',
      reason: '理由の記載なし',
    });
  });

  it('JSON でなければ unknown', () => {
    expect(parseClassification('これは営業だと思います').verdict).toBe('unknown');
  });

  it('壊れた JSON は unknown', () => {
    expect(parseClassification('{"verdict":"lead"').verdict).toBe('unknown');
  });

  it('想定外の verdict は unknown', () => {
    expect(parseClassification('{"verdict":"maybe","reason":"微妙"}').verdict).toBe('unknown');
  });
});

describe('buildUserPrompt', () => {
  it('判定材料（参照元・種別・本文）を含む', () => {
    const prompt = buildUserPrompt(BASE_INPUT);
    expect(prompt).toContain('https://sales-crowd.jp/');
    expect(prompt).toContain('その他');
    expect(prompt).toContain('無料で記事化');
  });

  it('長文は切り詰める', () => {
    const prompt = buildUserPrompt({ ...BASE_INPUT, message: 'あ'.repeat(5000) });
    expect(prompt).toContain('以下省略');
    expect(prompt.length).toBeLessThan(2500);
  });
});

describe('classifyInquiry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('モデルの判定をそのまま返す', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse('{"verdict":"sales","reason":"メディア掲載の営業"}')
    );

    const result = await classifyInquiry('key', BASE_INPUT);
    expect(result).toEqual({ verdict: 'sales', reason: 'メディア掲載の営業' });
  });

  it('既定モデルと JSON モードで呼ぶ', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(mockResponse('{"verdict":"lead","reason":"開発相談"}'));

    await classifyInquiry('key', BASE_INPUT);

    const init = fetchMock.mock.calls[0][1] as { body: string; signal?: AbortSignal };
    const body = JSON.parse(init.body) as {
      model: string;
      response_format?: { type: string };
      temperature?: number;
    };
    expect(body.model).toBe('openai/gpt-4o-mini');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.temperature).toBe(0);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('モデルを差し替えられる', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(mockResponse('{"verdict":"lead","reason":"相談"}'));

    await classifyInquiry('key', BASE_INPUT, { model: 'google/gemini-2.5-flash' });

    const init = fetchMock.mock.calls[0][1] as { body: string };
    expect((JSON.parse(init.body) as { model: string }).model).toBe('google/gemini-2.5-flash');
  });

  it('API エラーは unknown で返す（例外を投げない）', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'rate limited' } }), { status: 429 })
    );

    const result = await classifyInquiry('key', BASE_INPUT);
    expect(result.verdict).toBe('unknown');
    expect(result.reason).toContain('rate limited');
  });

  it('ネットワーク断も unknown で返す', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'));

    const result = await classifyInquiry('key', BASE_INPUT);
    expect(result.verdict).toBe('unknown');
    expect(result.reason).toContain('network down');
  });

  it('タイムアウトで abort され unknown になる', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_url: string, init: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new Error('The operation was aborted'))
          );
        })
    );

    const result = await classifyInquiry('key', BASE_INPUT, { timeoutMs: 10 });
    expect(result.verdict).toBe('unknown');
  });
});
