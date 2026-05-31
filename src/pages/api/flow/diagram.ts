import { FlowDiagramSchema } from '@/features/flow-interview/types';
import { getAiEnv } from '@/lib/ai-guards';
import { readSession, writeSession } from '@/lib/flow-interview/session';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';

export const prerender = false;

function jsonError(status: number, code: string): Response {
  return new Response(JSON.stringify({ error: code }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// 画面内インライン編集で更新した As-Is 図をセッションに保存する。
// 以降のチャット・改善案・RFP が編集後の図を使えるようにするための同期。
export const POST: APIRoute = async ({ locals, request }) => {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) return jsonError(503, 'binding_missing');

  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'flow-diagram',
    perMin: 60,
    perDay: 600,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  let body: { sessionId?: unknown; diagram?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'invalid_json');
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
  if (!sessionId) return jsonError(400, 'session_id_missing');

  const parsed = FlowDiagramSchema.safeParse(body.diagram);
  if (!parsed.success) return jsonError(400, 'invalid_diagram');

  const session = await readSession(env.RATE_LIMIT, sessionId);
  if (!session) return jsonError(404, 'session_not_found');

  session.diagram = parsed.data;
  session.updatedAt = Date.now();
  await writeSession(env.RATE_LIMIT, session);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
