import { completenessScore } from '@/features/ai-hearing/types';
import { getAiEnv } from '@/lib/ai-guards';
import { runAgentTurn } from '@/lib/hearing/agent';
import { readSession, writeSession } from '@/lib/hearing/session';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_INPUT_LEN = 800;
const MAX_TURNS = 25;

type AnswerRequestBody = {
  sessionId?: string;
  message?: string;
};

function jsonError(status: number, code: string, message?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(message ? { message } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ locals, request }) => {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) return jsonError(503, 'binding_missing', 'KV未注入');
  if (!env.OPENROUTER_API_KEY) return jsonError(503, 'openrouter_key_missing');

  // Turnstile はかけない (start で一度通過済み)。代わりに IP レート制限を強めに
  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'hearing-answer',
    perMin: 20,
    perDay: 300,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  let body: AnswerRequestBody;
  try {
    body = (await request.json()) as AnswerRequestBody;
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const sessionId = (body.sessionId ?? '').trim();
  const message = (body.message ?? '').trim();
  if (!sessionId) return jsonError(400, 'missing_session_id');
  if (!message) return jsonError(400, 'empty_message');
  if (message.length > MAX_INPUT_LEN) return jsonError(400, 'message_too_long');

  const session = await readSession(env.RATE_LIMIT, sessionId);
  if (!session)
    return jsonError(404, 'session_not_found', 'セッションが見つからないか、有効期限切れです。');
  if (session.status === 'submitted') {
    return jsonError(409, 'already_submitted', '送信済みのセッションです。');
  }
  if (session.messages.length >= MAX_TURNS * 2) {
    return jsonError(
      429,
      'too_many_turns',
      '対話ターン数の上限に達しました。サマリ確認に進んでください。'
    );
  }

  const userMessage = { role: 'user' as const, content: message };
  const history = [...session.messages, userMessage];

  const result = await runAgentTurn(
    {
      RATE_LIMIT: env.RATE_LIMIT,
      OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL_CHAT: env.OPENROUTER_MODEL_CHAT,
      OPENROUTER_MODEL_HEARING: env.OPENROUTER_MODEL_HEARING,
      SLACK_WEBHOOK_URL: env.SLACK_WEBHOOK_URL,
    },
    history,
    session.profile
  );

  const assistantMessage = { role: 'assistant' as const, content: result.assistantMessage };
  const updated = {
    ...session,
    messages: [...history, assistantMessage],
    profile: result.profile,
    status: result.isReady ? ('ready' as const) : session.status,
    updatedAt: Date.now(),
  };
  await writeSession(env.RATE_LIMIT, updated);

  const score = completenessScore(updated.profile);

  return new Response(
    JSON.stringify({
      sessionId: updated.sessionId,
      assistantMessage: result.assistantMessage,
      profile: updated.profile,
      progress: score,
      status: updated.status,
      summary: result.summary,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
};
