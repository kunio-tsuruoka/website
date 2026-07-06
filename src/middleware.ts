import { defineMiddleware } from 'astro:middleware';

// SSR HTML をエッジ（Cloudflare PoP 単位）でキャッシュする。
// cf-cache-status: DYNAMIC で毎リクエスト MicroCMS を叩いていた TTFB 対策。
// 注意: MicroCMS の更新は最大 TTL 秒遅れて反映される。
const EDGE_TTL_SECONDS = 300;

function isCacheablePath(pathname: string): boolean {
  // API は絶対にキャッシュしない。その他の GET ページは匿名コンテンツのみ。
  return !pathname.startsWith('/api/');
}

type RuntimeLocals = {
  runtime?: {
    caches?: { default?: Cache };
    ctx?: { waitUntil?: (p: Promise<unknown>) => void };
  };
};

function resolveCache(locals: RuntimeLocals): Cache | undefined {
  const fromRuntime = locals.runtime?.caches?.default;
  if (fromRuntime) return fromRuntime;
  // Workers ランタイムの caches.default は DOM の型定義に無いため any 経由で参照
  const globalCaches = (globalThis as { caches?: { default?: Cache } }).caches;
  return globalCaches?.default;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !isCacheablePath(url.pathname)) {
    return next();
  }

  const cache = resolveCache(context.locals as RuntimeLocals);
  if (!cache) return next();

  const cacheKey = new Request(url.toString(), { method: 'GET' });

  try {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const response = new Response(hit.body, hit);
      response.headers.set('x-edge-cache', 'hit');
      return response;
    }
  } catch {
    // ローカル dev 等で Cache API が使えない場合はそのまま SSR
    return next();
  }

  const response = await next();
  const contentType = response.headers.get('content-type') ?? '';
  const shouldStore =
    response.status === 200 &&
    !response.headers.has('set-cookie') &&
    (contentType.includes('text/html') || contentType.includes('xml'));

  if (!shouldStore) return response;

  const headers = new Headers(response.headers);
  // ブラウザにはキャッシュさせず（max-age=0）、エッジのみ s-maxage で保持
  headers.set('cache-control', `public, max-age=0, s-maxage=${EDGE_TTL_SECONDS}`);
  headers.set('x-edge-cache', 'miss');

  const outgoing = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  const putPromise = cache.put(cacheKey, outgoing.clone()).catch(() => {
    // cache.put 失敗（プレビュー環境等）はレスポンス配信に影響させない
  });
  const waitUntil = (context.locals as RuntimeLocals).runtime?.ctx?.waitUntil;
  if (waitUntil) {
    waitUntil(putPromise);
  } else {
    await putPromise;
  }

  return outgoing;
});
