import { describe, expect, it } from 'vitest';
import {
  ARTICLE_FIELDS,
  CONTENT_ID,
  ENDPOINT,
  publishDataCompanyLearningSensor,
} from './publish-data-company-learning-sensor';

const env = {
  MICROCMS_SERVICE_DOMAIN: 'example',
  MICROCMS_API_KEY: 'secret',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedPublished(overrides: Record<string, unknown> = {}) {
  return {
    id: CONTENT_ID,
    ...ARTICLE_FIELDS,
    publishedAt: '2026-08-31T00:00:00.000Z',
    revisedAt: '2026-08-31T00:00:00.000Z',
    ...overrides,
  };
}

describe('publishDataCompanyLearningSensor', () => {
  it('creates the fixed article with a custom id when it does not exist, then verifies publication', async () => {
    const calls: Array<{ url: string; method: string; body?: BodyInit | null }> = [];
    const responses = [
      jsonResponse({ message: 'not found' }, 404),
      jsonResponse({ id: CONTENT_ID }, 201),
      jsonResponse(expectedPublished()),
    ];
    const fetchImpl: typeof fetch = async (url, options = {}) => {
      calls.push({
        url: String(url),
        method: options.method ?? 'GET',
        body: options.body,
      });
      const response = responses.shift();
      if (!response) throw new Error('Unexpected fetch call');
      return response;
    };

    const result = await publishDataCompanyLearningSensor(env, fetchImpl);

    expect(result.operation).toBe('created');
    expect(result.id).toBe(CONTENT_ID);
    expect(calls.map((call) => call.method)).toEqual(['GET', 'PUT', 'GET']);
    expect(calls[1]?.url).toBe(`https://example.microcms.io/api/v1/${ENDPOINT}/${CONTENT_ID}`);
    expect(JSON.parse(String(calls[1]?.body))).toEqual(ARTICLE_FIELDS);
  });

  it('updates an existing article only when its title matches, then verifies publication', async () => {
    const calls: Array<{ method: string }> = [];
    const responses = [
      jsonResponse(expectedPublished({ content: '<p>old</p>' })),
      jsonResponse({ id: CONTENT_ID }),
      jsonResponse(expectedPublished()),
    ];
    const fetchImpl: typeof fetch = async (_url, options = {}) => {
      calls.push({ method: options.method ?? 'GET' });
      const response = responses.shift();
      if (!response) throw new Error('Unexpected fetch call');
      return response;
    };

    const result = await publishDataCompanyLearningSensor(env, fetchImpl);

    expect(result.operation).toBe('updated');
    expect(calls.map((call) => call.method)).toEqual(['GET', 'PATCH', 'GET']);
  });

  it('refuses to overwrite a different article that already uses the content id', async () => {
    const fetchImpl: typeof fetch = async () =>
      jsonResponse(expectedPublished({ title: '別の記事' }));

    await expect(publishDataCompanyLearningSensor(env, fetchImpl)).rejects.toThrow(
      'Refusing to overwrite content with another title'
    );
  });

  it('requires runtime microCMS credentials', async () => {
    await expect(
      publishDataCompanyLearningSensor({}, async () => jsonResponse({}))
    ).rejects.toThrow('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required');
  });
});
