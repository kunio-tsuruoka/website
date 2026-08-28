import type { APIRoute } from 'astro';
import { createClient } from 'microcms-js-sdk';
import publisherSource from '../../../../scripts/publish-ai-agent-gherkin-evidence.mjs?raw';

export const prerender = false;

const EXPECTED_TOKEN_SHA256 = 'dffd51600a22a8cfdc084f0784b3ec9878867b0b04b9acb444a9540f9d53b7d1';

type RuntimeEnv = {
  MICROCMS_SERVICE_DOMAIN?: string;
  MICROCMS_API_KEY?: string;
};

type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  content: string;
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function extractQuotedConstant(name: string): string {
  const pattern = new RegExp(`const ${name} =\\s*'([^']+)';`);
  const value = publisherSource.match(pattern)?.[1];
  if (!value) throw new Error(`Article constant not found: ${name}`);
  return value;
}

function extractArticle(): Article {
  const contentStartMarker = 'const CONTENT = `';
  const contentEndMarker = '\n`.trim();';
  const contentStart = publisherSource.indexOf(contentStartMarker);
  const contentEnd = publisherSource.indexOf(contentEndMarker, contentStart + contentStartMarker.length);

  if (contentStart < 0 || contentEnd < 0) {
    throw new Error('Article content was not found');
  }

  const content = publisherSource
    .slice(contentStart + contentStartMarker.length, contentEnd)
    .trim();

  const article = {
    slug: extractQuotedConstant('SLUG'),
    category: extractQuotedConstant('CATEGORY'),
    title: extractQuotedConstant('TITLE'),
    description: extractQuotedConstant('DESCRIPTION'),
    content,
  };

  if (article.content.length < 1000 || !article.content.includes('{{CONTACT_CTA}}')) {
    throw new Error('Article content validation failed');
  }

  return article;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function isNotFound(error: unknown): boolean {
  const candidate = error as {
    status?: number;
    response?: { status?: number };
    message?: string;
  };
  return (
    candidate?.status === 404 ||
    candidate?.response?.status === 404 ||
    String(candidate?.message ?? '').includes('404')
  );
}

export const GET: APIRoute = async ({ locals, url }) => {
  const token = url.searchParams.get('token') ?? '';
  const confirmed = url.searchParams.get('confirm') === 'publish';

  if (!confirmed || !token || (await sha256Hex(token)) !== EXPECTED_TOKEN_SHA256) {
    return json({ ok: false, error: 'not_found' }, 404);
  }

  const runtime = (locals as { runtime?: { env?: RuntimeEnv } }).runtime;
  const env = runtime?.env ?? {};
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN ?? '';
  const apiKey = env.MICROCMS_API_KEY ?? '';

  if (!serviceDomain || !apiKey) {
    return json(
      {
        ok: false,
        error: 'microcms_credentials_unavailable',
        hasServiceDomain: Boolean(serviceDomain),
        hasApiKey: Boolean(apiKey),
      },
      503
    );
  }

  try {
    const article = extractArticle();
    const client = createClient({ serviceDomain, apiKey });
    let exists = false;

    try {
      await client.get({
        endpoint: 'columns',
        contentId: article.slug,
        queries: { fields: 'id' },
      });
      exists = true;
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }

    const content = {
      title: article.title,
      description: article.description,
      category: article.category,
      content: article.content,
    };

    if (exists) {
      await client.update({
        endpoint: 'columns',
        contentId: article.slug,
        content,
      });
    } else {
      await client.create({
        endpoint: 'columns',
        contentId: article.slug,
        content,
      });
    }

    const verified = await client.get({
      endpoint: 'columns',
      contentId: article.slug,
      queries: { fields: 'id,title,category,publishedAt,updatedAt' },
    });

    const categoryId =
      typeof verified.category === 'string' ? verified.category : verified.category?.id;

    if (
      verified.title !== article.title ||
      categoryId !== article.category ||
      !verified.publishedAt
    ) {
      throw new Error('Published article verification failed');
    }

    return json(
      {
        ok: true,
        action: exists ? 'updated' : 'created',
        id: verified.id,
        slug: article.slug,
        title: verified.title,
        category: categoryId,
        publishedAt: verified.publishedAt,
        updatedAt: verified.updatedAt,
      },
      200
    );
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
      500
    );
  }
};
