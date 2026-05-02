import {
  type BudgetStatus,
  budgetExceededResponse,
  checkBudget,
  notifyBudgetExceeded,
} from './ai-kill-switch';
import { type IpLimitProfile, getClientIp, limitByIp, rateLimitResponse } from './rate-limit';
import { readTurnstileToken, turnstileFailureResponse, verifyTurnstile } from './turnstile';

export type AiRuntimeEnv = {
  RATE_LIMIT: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  };
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY?: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL_CHAT?: string;
  OPENROUTER_MODEL_OCR?: string;
  AI_MONTHLY_BUDGET_USD?: string;
  SLACK_WEBHOOK_URL?: string;
  AI?: {
    run(model: string, input: { text: string[] }): Promise<{ data: number[][] }>;
  };
  // ローカル開発で AI バインディング不在時の REST API フォールバック用
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
};

export function getAiEnv(locals: unknown): AiRuntimeEnv | null {
  const runtime = (locals as { runtime?: { env?: AiRuntimeEnv } }).runtime;
  return runtime?.env ?? null;
}

function jsonError(status: number, code: string, message?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(message ? { message } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export type GuardSuccess = { env: AiRuntimeEnv; budget: BudgetStatus };

export async function aiGuards(
  locals: unknown,
  request: Request,
  profile: IpLimitProfile
): Promise<GuardSuccess | Response> {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) {
    return jsonError(
      503,
      'binding_missing',
      'KVバインディングが未注入です (ローカル開発では wrangler.toml + platformProxy が必要)。'
    );
  }
  if (!env.TURNSTILE_SECRET_KEY) {
    return jsonError(503, 'turnstile_secret_missing', 'Turnstile secret が未設定です。');
  }
  if (!env.OPENROUTER_API_KEY) {
    return jsonError(503, 'openrouter_key_missing', 'OPENROUTER_API_KEY が未設定です。');
  }

  const limit = await limitByIp(env.RATE_LIMIT, request, profile);
  if (!limit.ok) return rateLimitResponse(limit);

  const token = await readTurnstileToken(request);
  const verify = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, getClientIp(request));
  if (!verify.ok) return turnstileFailureResponse(verify);

  const budgetUsd = Number.parseFloat(env.AI_MONTHLY_BUDGET_USD ?? '10');
  const budget = await checkBudget(env.RATE_LIMIT, budgetUsd);
  if (!budget.ok) {
    await notifyBudgetExceeded(env.RATE_LIMIT, env.SLACK_WEBHOOK_URL, budget);
    return budgetExceededResponse(budget);
  }

  return { env, budget };
}
