import { pathToFileURL } from 'node:url';
import { AI_ADOPTION_POSTS } from '../src/data/ai-adoption-blogs.mjs';

export const POSTS = AI_ADOPTION_POSTS;

const REQUIRED_IDS = ['ai-adoption-management-led', 'ai-adoption-person-in-charge'];

export function validatePosts(posts) {
  if (!Array.isArray(posts) || posts.length !== REQUIRED_IDS.length) {
    throw new Error('Exactly two blog posts are required.');
  }

  const ids = posts.map((post) => post.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Blog content IDs must be unique.');
  }
  if (ids.some((id, index) => id !== REQUIRED_IDS[index])) {
    throw new Error(`Unexpected blog content IDs: ${ids.join(', ')}`);
  }

  for (const post of posts) {
    for (const field of ['id', 'title', 'description', 'content']) {
      if (typeof post[field] !== 'string' || post[field].trim() === '') {
        throw new Error(`${post.id || 'unknown'} is missing ${field}.`);
      }
    }
    if (post.description.length < 70 || post.description.length > 130) {
      throw new Error(`${post.id} description must be 70-130 characters.`);
    }
    if (post.content.length <= 3000) {
      throw new Error(`${post.id} content must be longer than 3,000 characters.`);
    }
    if (/<h1\b/i.test(post.content)) {
      throw new Error(`${post.id} content must not contain an h1.`);
    }
  }

  const [managementPost, operatorPost] = posts;
  if (!managementPost.content.includes('/blog/ai-adoption-person-in-charge')) {
    throw new Error('Management post must link to the person-in-charge post.');
  }
  if (!operatorPost.content.includes('/blog/ai-adoption-management-led')) {
    throw new Error('Person-in-charge post must link to the management post.');
  }
}

function requireEnvironment() {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();

  if (!serviceDomain || !apiKey) {
    throw new Error('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
  }

  return { serviceDomain, apiKey };
}

function contentUrl(serviceDomain, contentId) {
  return `https://${serviceDomain}.microcms.io/api/v1/blogs/${encodeURIComponent(contentId)}`;
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestMicrocms(url, apiKey, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await readResponse(response);
  return { response, data };
}

async function upsertPost(post, env) {
  const url = contentUrl(env.serviceDomain, post.id);
  const current = await requestMicrocms(url, env.apiKey);

  let method = 'PATCH';
  if (current.response.status === 404) {
    method = 'PUT';
  } else if (!current.response.ok) {
    throw new Error(
      `Failed to inspect ${post.id}: ${current.response.status} ${JSON.stringify(current.data)}`
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
      `Failed to publish ${post.id}: ${written.response.status} ${JSON.stringify(written.data)}`
    );
  }

  const verified = await requestMicrocms(url, env.apiKey);
  if (!verified.response.ok) {
    throw new Error(
      `Failed to verify ${post.id}: ${verified.response.status} ${JSON.stringify(verified.data)}`
    );
  }
  if (
    verified.data?.id !== post.id ||
    verified.data?.title !== post.title ||
    verified.data?.content !== post.content
  ) {
    throw new Error(`Published content verification failed for ${post.id}.`);
  }

  return {
    id: post.id,
    method,
    publishedAt: verified.data.publishedAt,
    updatedAt: verified.data.updatedAt,
  };
}

export async function publishPosts(posts = POSTS) {
  validatePosts(posts);
  const env = requireEnvironment();
  const results = [];

  for (const post of posts) {
    results.push(await upsertPost(post, env));
  }

  return results;
}

async function main() {
  validatePosts(POSTS);

  if (!process.argv.includes('--apply')) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          posts: POSTS.map((post) => ({
            id: post.id,
            title: post.title,
            descriptionLength: post.description.length,
            contentLength: post.content.length,
          })),
        },
        null,
        2
      )
    );
    return;
  }

  const results = await publishPosts();
  console.log(JSON.stringify({ mode: 'published', results }, null, 2));
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
