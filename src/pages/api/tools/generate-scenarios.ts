import { chatCompletion } from '@/lib/openrouter';
import {
  type ReviseMode,
  type ReviseRequest,
  applyRevision,
  buildAsIsPrompt,
  buildFullPrompt,
  buildRevisePrompt,
  buildStoryPrompt,
  isReviseMode,
  parseRevisionPayload,
} from '@/lib/story-revise';
import { isStorySpec } from '@/lib/story-spec';
import type { APIRoute } from 'astro';

export const prerender = false;

// recommend-system の UNDERSTAND_MODEL（中村選定）。OpenRouter スラッグは同リポ wrangler.toml の記載どおり
const DEFAULT_MODEL = 'qwen/qwen3-30b-a3b';

function promptFor(body: ReviseRequest, mode: ReviseMode): string {
  const description = body.description?.trim() ?? '';
  if (mode === 'full') return buildFullPrompt(description);
  if (!body.spec) throw new Error('いまの整理がありません');
  if (mode === 'asis') return buildAsIsPrompt(description, body.spec);
  if (mode === 'story') {
    if (!body.storyId) throw new Error('対象のストーリーがありません');
    return buildStoryPrompt(description, body.spec, body.storyId);
  }
  const instruction = body.instruction?.trim() ?? '';
  if (!instruction) throw new Error('直してほしいことを書いてください');
  return buildRevisePrompt(description, body.spec, instruction);
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (
      locals as {
        runtime?: { env?: { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL_TOOLS?: string } };
      }
    ).runtime;
    const apiKey = runtime?.env?.OPENROUTER_API_KEY ?? import.meta.env.OPENROUTER_API_KEY;
    const model =
      runtime?.env?.OPENROUTER_MODEL_TOOLS ??
      import.meta.env.OPENROUTER_MODEL_TOOLS ??
      DEFAULT_MODEL;

    if (!apiKey) {
      return json(500, { success: false, error: 'OPENROUTER_API_KEY is not configured' });
    }

    const body = (await request.json()) as ReviseRequest;
    const mode: ReviseMode = isReviseMode(body.mode) ? body.mode : 'full';
    const description = body.description?.trim() ?? '';

    if (mode === 'full' && !description) {
      return json(400, { success: false, error: 'やりたいことを文章で書いてください' });
    }
    if (mode !== 'full' && (!body.spec || !isStorySpec(body.spec))) {
      return json(400, { success: false, error: 'いまの整理を渡してください' });
    }
    if (mode === 'story' && !body.storyId) {
      return json(400, { success: false, error: '対象のストーリーを指定してください' });
    }
    if (mode === 'revise' && !body.instruction?.trim()) {
      return json(400, { success: false, error: '直してほしいことを書いてください' });
    }

    const result = await chatCompletion(
      apiKey,
      {
        model,
        max_tokens: mode === 'asis' ? 8000 : 16000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        reasoning: { effort: 'low', exclude: true },
        messages: [{ role: 'user', content: promptFor(body, mode) }],
      },
      { referer: 'https://beekle.jp', title: 'Beekle Story Spec' }
    );

    const parsed = parseRevisionPayload(result.text);
    const spec =
      mode === 'full' || !body.spec
        ? parsed.spec
        : applyRevision(body.spec, parsed.spec, mode, body.storyId);
    return json(200, { success: true, spec, note: mode === 'full' ? undefined : parsed.note });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(500, { success: false, error: 'Failed to generate', detail: message });
  }
};

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
