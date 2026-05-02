type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

export type RateLimitOptions = {
  windowSec: number;
  max: number;
  prefix?: string;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

export async function checkRateLimit(
  kv: KVNamespaceLike,
  identity: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const { windowSec, max, prefix = 'rl' } = opts;
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSec);
  const key = `${prefix}:${identity}:${bucket}`;
  const resetAt = (bucket + 1) * windowSec;

  const raw = await kv.get(key);
  const count = raw ? Number.parseInt(raw, 10) : 0;

  if (count >= max) {
    return { ok: false, remaining: 0, resetAt, retryAfterSec: resetAt - now };
  }

  await kv.put(key, String(count + 1), { expirationTtl: windowSec * 2 });
  return { ok: true, remaining: max - count - 1, resetAt, retryAfterSec: 0 };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      retryAfterSec: result.retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(result.retryAfterSec),
        'x-ratelimit-reset': String(result.resetAt),
      },
    }
  );
}

export type IpLimitProfile = {
  endpoint: string;
  perMin?: number;
  perDay?: number;
};

const DEFAULT_PER_MIN = 10;
const DEFAULT_PER_DAY = 50;

export async function limitByIp(
  kv: KVNamespaceLike,
  request: Request,
  profile: IpLimitProfile
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const perMin = profile.perMin ?? DEFAULT_PER_MIN;
  const perDay = profile.perDay ?? DEFAULT_PER_DAY;

  const minResult = await checkRateLimit(kv, ip, {
    windowSec: 60,
    max: perMin,
    prefix: `${profile.endpoint}:m`,
  });
  if (!minResult.ok) return minResult;

  const dayResult = await checkRateLimit(kv, ip, {
    windowSec: 86400,
    max: perDay,
    prefix: `${profile.endpoint}:d`,
  });
  return dayResult;
}
