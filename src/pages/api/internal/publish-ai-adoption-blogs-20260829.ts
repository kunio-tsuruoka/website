import type { APIRoute } from 'astro';
import { AI_ADOPTION_POSTS } from '../../../../data/ai-adoption-blogs.mjs';

export const prerender = false;

const POSTS = AI_ADOPTION_POSTS;
const TRIGGER_HEADER = 'x-beekle-publication-trigger';
const TRIGGER_VALUE = 'ai-adoption-20260829-7f4c2e91';
const RESPONSE_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-robots-tag': 'noindex, nofollow',
};

type PublicationEnvironment = {
  MICROCMS_SERVICE_DOMAIN?: string;
  MICROCMS_API_KEY?: string;
};

type RuntimeLocals = {
  runtime?: {
    env?: PublicationEnvironment;
  };
};

type PublicationPost = (typeof POSTS)[number];

type MicrocmsEnvironment = {
  serviceDomain: string;
  apiKey: string;
};

type MicrocmsResponse = {
  response: Response;
  data: unknown;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function contentUrl(serviceDomain: string, contentId: string): string {
  return `https://${serviceDomain}.microcms.io/api/v1/blogs/${encodeURIComponent(contentId)}`;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestMicrocms(
  url: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<MicrocmsResponse> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  return {
    response,
    data: await readResponse(response),
  };
}

function errorDetail(data: unknown): string {
  return typeof data === 'string' ? data : JSON.stringify(data);
}

async function upsertPost(post: PublicationPost, env: MicrocmsEnvironment) {
  const url = contentUrl(env.serviceDomain, post.id);
  const current = await requestMicrocms(url, env.apiKey);

  let method: 'PUT' | 'PATCH' = 'PATCH';
  if (current.response.status === 404) {
    method = 'PUT';
  } else if (!current.response.ok) {
    throw new Error(
      `Failed to inspect ${post.id}: ${current.response.status} ${errorDetail(current.data)}`
    );
  }

  const body = JSON.stringify({
    title: post.title,
    description: post.description,
    content: post.content,
  });
  let written = await requestMicrocms(url, env.apiKey, { method, body });

  if (!written.response.ok && method === 'PUT' && written.response.status === 409) {
    method = 'PATCH';
    written = await requestMicrocms(url, env.apiKey, { method, body });
  }

  if (!written.response.ok) {
    throw new Error(
      `Failed to publish ${post.id}: ${written.response.status} ${errorDetail(written.data)}`
    );
  }

  const verified = await requestMicrocms(url, env.apiKey);
  if (!verified.response.ok) {
    throw new Error(
      `Failed to verify ${post.id}: ${verified.response.status} ${errorDetail(verified.data)}`
    );
  }

  const data = verified.data as {
    id?: string;
    title?: string;
    content?: string;
    publishedAt?: string;
    updatedAt?: string;
  };
  if (data.id !== post.id || data.title !== post.title || data.content !== post.content) {
    throw new Error(`Published content verification failed for ${post.id}.`);
  }

  return {
    id: post.id,
    method,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
  };
}

async function publishPosts(posts: typeof POSTS, env: MicrocmsEnvironment) {
  const results = [];
  for (const post of posts) {
    results.push(await upsertPost(post, env));
  }
  return results;
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (request.headers.get(TRIGGER_HEADER) !== TRIGGER_VALUE) {
    return json({ error: 'not_found' }, 404);
  }

  const runtimeEnv = (locals as RuntimeLocals).runtime?.env;
  const serviceDomain = runtimeEnv?.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = runtimeEnv?.MICROCMS_API_KEY?.trim();

  if (!serviceDomain || !apiKey) {
    return json(
      {
        error: 'publication_environment_unavailable',
        missing: [
          ...(!serviceDomain ? ['MICROCMS_SERVICE_DOMAIN'] : []),
          ...(!apiKey ? ['MICROCMS_API_KEY'] : []),
        ],
      },
      503
    );
  }

  try {
    const results = await publishPosts(POSTS, { serviceDomain, apiKey });
    return json({ ok: true, results });
  } catch (error) {
    console.error('AI adoption blog publication failed:', error);
    return json(
      {
        error: 'publication_failed',
        message: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
};
