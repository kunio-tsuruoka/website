import { getAiEnv } from '@/lib/ai-guards';
import { runFlowAgentTurn } from '@/lib/flow-interview/agent';
import { readSession, writeSession } from '@/lib/flow-interview/session';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_TURNS = 30;
const MAX_MESSAGE_LEN = 2000;

function jsonError(status: number, code: string): Response {
  return new Response(JSON.stringify({ error: code }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ locals, request }) => {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) return jsonError(503, 'binding_missing');
  if (!env.OPENROUTER_API_KEY) return jsonError(503, 'openrouter_key_missing');

  // Turnstile は start で通過済み。ここは IP レート制限のみ。
  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'flow-answer',
    perMin: 20,
    perDay: 300,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  let body: { sessionId?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!sessionId) return jsonError(400, 'session_id_missing');
  if (!message) return jsonError(400, 'message_missing');
  if (message.length > MAX_MESSAGE_LEN) return jsonError(400, 'message_too_long');

  const session = await readSession(env.RATE_LIMIT, sessionId);
  if (!session) return jsonError(404, 'session_not_found');
  if (session.status === 'done') return jsonError(409, 'already_done');
  if (session.turns >= MAX_TURNS) return jsonError(429, 'too_many_turns');

  session.messages.push({ role: 'user', content: message });

  const result = await runFlowAgentTurn(
    {
      RATE_LIMIT: env.RATE_LIMIT,
      OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL_CHAT: env.OPENROUTER_MODEL_CHAT,
      OPENROUTER_MODEL_HEARING: env.OPENROUTER_MODEL_HEARING,
      SLACK_WEBHOOK_URL: env.SLACK_WEBHOOK_URL,
    },
    session.messages,
    session.diagram
  );

  session.messages.push({ role: 'assistant', content: result.assistantMessage });
  session.diagram = result.diagram;
  session.turns += 1;
  session.updatedAt = Date.now();
  if (result.isReady) session.status = 'done';
  await writeSession(env.RATE_LIMIT, session);

  return new Response(
    JSON.stringify({
      sessionId: session.sessionId,
      assistantMessage: result.assistantMessage,
      diagram: result.diagram,
      stepCount: result.diagram.steps.length,
      isReady: result.isReady,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
};
