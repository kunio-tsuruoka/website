import { aiGuards } from '@/lib/ai-guards';
import { OpenRouterError, chatCompletionWithBudget } from '@/lib/openrouter';
import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `あなたは領収書OCRの抽出器です。画像から以下のフィールドを抽出してJSONのみ返してください。
- vendor: 発行店舗・企業名 (string)
- date: 日付 YYYY-MM-DD (string、不明なら null)
- total: 合計金額 (number、税込円、不明なら null)
- subtotal: 小計 (number、不明なら null)
- tax: 消費税額 (number、不明なら null)
- items: 明細 [{name: string, price: number}] (なければ空配列)
- payment: 支払方法 (string、不明なら null)
- note: 備考やその他特記事項 (string、なければ null)

JSONのみ返し、説明文やマークダウンのコードフェンスは含めないこと。`;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const POST: APIRoute = async ({ locals, request }) => {
  const guard = await aiGuards(locals, request, {
    endpoint: 'ocr',
    perMin: 5,
    perDay: 30,
  });
  if (guard instanceof Response) return guard;
  const { env } = guard;

  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('multipart/form-data')) {
    return jsonError(400, 'expected_multipart');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, 'invalid_form');
  }

  const file = form.get('image');
  if (!(file instanceof File)) return jsonError(400, 'image_missing');
  if (file.size === 0) return jsonError(400, 'image_empty');
  if (file.size > MAX_IMAGE_BYTES) return jsonError(400, 'image_too_large');
  if (!ALLOWED_MIME.includes(file.type)) return jsonError(400, 'unsupported_mime');

  const dataUrl = await fileToDataUrl(file);
  const model = env.OPENROUTER_MODEL_OCR ?? 'google/gemini-2.5-flash';

  try {
    const result = await chatCompletionWithBudget(
      env.RATE_LIMIT,
      env.OPENROUTER_API_KEY,
      {
        model,
        max_tokens: 800,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '次の領収書から指定フィールドを抽出してJSONだけ返してください。',
              },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      },
      { referer: 'https://beekle.jp', title: 'Beekle AI OCR Demo' }
    );

    const parsed = parseJsonLoose(result.text);

    return new Response(
      JSON.stringify({
        data: parsed,
        rawText: parsed === null ? result.text : undefined,
        usage: result.usage,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    if (err instanceof OpenRouterError) {
      return jsonError(502, 'upstream_error', err.message);
    }
    return jsonError(500, 'internal_error');
  }
};

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const b64 = arrayBufferToBase64(buf);
  return `data:${file.type};base64,${b64}`;
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

function parseJsonLoose(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function jsonError(status: number, code: string, detail?: string): Response {
  return new Response(JSON.stringify({ error: code, ...(detail ? { detail } : {}) }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
