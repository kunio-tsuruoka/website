import { getAiEnv } from '@/lib/ai-guards';
import { readSession } from '@/lib/flow-interview/session';
import { limitByIp, rateLimitResponse } from '@/lib/rate-limit';
import type { APIRoute } from 'astro';

export const prerender = false;

const WHISPER_MODEL = '@cf/openai/whisper-large-v3-turbo';
const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8MB（数十秒の発話を想定）

// env.AI の whisper 呼び出しは ai-guards の embeddings 型と異なるため局所的に型付けする。
type WhisperBinding = {
  run(
    model: string,
    input: { audio: string; language?: string; task?: string }
  ): Promise<{ text?: string }>;
};

function jsonError(status: number, code: string, detail?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(detail ? { detail } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

export const POST: APIRoute = async ({ locals, request }) => {
  const env = getAiEnv(locals);
  if (!env) return jsonError(500, 'runtime_unavailable');
  if (!env.RATE_LIMIT) return jsonError(503, 'binding_missing');

  // Turnstile は flow セッション開始時に通過済み。ここは IP レート制限のみ。
  const limit = await limitByIp(env.RATE_LIMIT, request, {
    endpoint: 'transcribe',
    perMin: 15,
    perDay: 150,
  });
  if (!limit.ok) return rateLimitResponse(limit);

  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data')) return jsonError(400, 'expected_multipart');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, 'invalid_form');
  }

  // 有効な flow セッションIDを必須にし、start (Turnstile通過) 済みの利用だけ許可する。
  const sessionId = typeof form.get('sessionId') === 'string' ? String(form.get('sessionId')) : '';
  if (!sessionId) return jsonError(400, 'session_id_missing');
  const session = await readSession(env.RATE_LIMIT, sessionId);
  if (!session) return jsonError(404, 'session_not_found');

  const file = form.get('audio');
  if (!(file instanceof File)) return jsonError(400, 'audio_missing');
  if (file.size === 0) return jsonError(400, 'audio_empty');
  if (file.size > MAX_AUDIO_BYTES) return jsonError(400, 'audio_too_large');

  const base64 = arrayBufferToBase64(await file.arrayBuffer());

  try {
    const text = await transcribe(env, base64);
    if (text === null) return jsonError(503, 'ai_unavailable');
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    return jsonError(502, 'transcribe_failed', err instanceof Error ? err.message : undefined);
  }
};

const AI_TIMEOUT_MS = 25000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timeout_${label}`)), ms)),
  ]);
}

async function transcribeViaRest(account: string, token: string, base64: string): Promise<string> {
  const res = await withTimeout(
    fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${WHISPER_MODEL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ audio: base64, language: 'ja', task: 'transcribe' }),
    }),
    AI_TIMEOUT_MS,
    'rest'
  );
  if (!res.ok) throw new Error(`workers_ai_rest_${res.status}`);
  const data = (await res.json()) as { result?: { text?: string }; text?: string };
  return (data.result?.text ?? data.text ?? '').trim();
}

/**
 * Workers AI Whisper で文字起こし。
 * - REST を優先する。CLOUDFLARE_API_TOKEN + ACCOUNT_ID があれば dev/本番とも安定して動くため
 *   （`env.AI` バインディングは local dev の platformProxy 経由だと whisper でハングする実績あり。
 *    2026-05-02 の音声断念と同根。.claude/rules/ai-demo-infrastructure.md 参照）。
 * - REST 不可（token 無し本番等）のときだけ env.AI バインディングを使う。無限ハング防止に
 *   タイムアウトを噛ませ、失敗時は呼び出し側が 502 を返す。
 * - どちらも無ければ null（呼び出し側が 503）。
 */
async function transcribe(
  env: { AI?: unknown; CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_ACCOUNT_ID?: string },
  base64: string
): Promise<string | null> {
  const token = env.CLOUDFLARE_API_TOKEN;
  const account = env.CLOUDFLARE_ACCOUNT_ID;
  if (token && account) {
    return transcribeViaRest(account, token, base64);
  }

  const ai = env.AI as WhisperBinding | undefined;
  if (ai && typeof ai.run === 'function') {
    const res = await withTimeout(
      ai.run(WHISPER_MODEL, { audio: base64, language: 'ja', task: 'transcribe' }),
      AI_TIMEOUT_MS,
      'binding'
    );
    return (res.text ?? '').trim();
  }

  return null;
}
