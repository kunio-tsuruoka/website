import { aiGuards } from '@/lib/ai-guards';
import { INITIAL_QUESTION } from '@/lib/flow-interview/agent';
import { createSession, writeSession } from '@/lib/flow-interview/session';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  const guard = await aiGuards(locals, request, { endpoint: 'flow-start', perMin: 3, perDay: 20 });
  if (guard instanceof Response) return guard;
  const { env } = guard;

  const session = createSession();
  session.messages = [{ role: 'assistant', content: INITIAL_QUESTION }];
  await writeSession(env.RATE_LIMIT, session);

  return new Response(
    JSON.stringify({
      sessionId: session.sessionId,
      assistantMessage: INITIAL_QUESTION,
      diagram: session.diagram,
      stepCount: 0,
      isReady: false,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
};
