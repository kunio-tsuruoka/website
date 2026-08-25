import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callMarketingTool } from '../workers/microcms-mcp/src/marketing';

describe('marketing_get_clarity_insights', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Clarityの空に近いHTTPエラーでも安全な診断情報を返す', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async () =>
        new Response('null', {
          status: 500,
          headers: {
            'content-type': 'application/json',
            'retry-after': '60',
          },
        })
    );

    const result = await callMarketingTool(
      'marketing_get_clarity_insights',
      { numOfDays: 3, dimensions: ['URL'] },
      { MICROSOFT_CLARITY_API_KEY: 'secret-token' }
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected Clarity call to fail');

    expect(result.error).toContain('Clarity API 500');
    expect(result.error).toContain('body=null');
    expect(result.error).toContain('numOfDays=3');
    expect(result.error).toContain('dimensions=URL');
    expect(result.error).toContain('contentType=application/json');
    expect(result.error).toContain('responseLength=4');
    expect(result.error).toContain('retryAfter=60');
    expect(result.error).not.toContain('secret-token');
  });

  it('Clarityの一時的な5xxは1回リトライして取得結果を返す', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response('null', {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              metricName: 'Traffic',
              information: [{ URL: 'https://beekle.jp/', totalSessionCount: '10' }],
            },
          ]),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        )
      );

    const result = await callMarketingTool(
      'marketing_get_clarity_insights',
      { numOfDays: 1, dimensions: ['URL'] },
      { MICROSOFT_CLARITY_API_KEY: 'secret-token' }
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);

    expect(result.data).toEqual([
      {
        metricName: 'Traffic',
        information: [{ URL: 'https://beekle.jp/', totalSessionCount: '10' }],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
