import { getAiEnv } from '@/lib/ai-guards';
import { formatRfpMarkdown, runRfp } from '@/lib/flow-interview/rfp';
import { readSession } from '@/lib/flow-interview/session';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';

export const prerender = false;

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

  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'flow-rfp',
    perMin: 4,
    perDay: 30,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  let body: { sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  if (!sessionId) return jsonError(400, 'session_id_missing');

  const session = await readSession(env.RATE_LIMIT, sessionId);
  if (!session) return jsonError(404, 'session_not_found');
  if (session.diagram.steps.length === 0) return jsonError(400, 'diagram_empty');

  const rfp = await runRfp(
    {
      RATE_LIMIT: env.RATE_LIMIT,
      OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL_CHAT: env.OPENROUTER_MODEL_CHAT,
      OPENROUTER_MODEL_HEARING: env.OPENROUTER_MODEL_HEARING,
      SLACK_WEBHOOK_URL: env.SLACK_WEBHOOK_URL,
    },
    session.diagram,
    session.suggestions,
    session.suggestSummary
  );

  if (!rfp) return jsonError(502, 'rfp_failed');

  return new Response(JSON.stringify({ rfp, markdown: formatRfpMarkdown(rfp) }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
