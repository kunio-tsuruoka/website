import { type ModelPricing, estimateCost, recordCost } from './ai-kill-switch';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'google/gemini-2.5-flash-lite': { inputPerMtok: 0.1, outputPerMtok: 0.4 },
  'google/gemini-2.5-flash': { inputPerMtok: 0.3, outputPerMtok: 2.5 },
  'openai/gpt-4o-mini': { inputPerMtok: 0.15, outputPerMtok: 0.6 },
  'anthropic/claude-haiku-4-5': { inputPerMtok: 1, outputPerMtok: 5 },
};

export type ChatMessageContent =
  | string
  | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: ChatMessageContent;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
};

export type ChatCompletionResult = {
  text: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  costUsd: number;
  model: string;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  model?: string;
  error?: { message?: string };
};

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export async function chatCompletion(
  apiKey: string,
  req: ChatCompletionRequest,
  opts?: { referer?: string; title?: string }
): Promise<ChatCompletionResult> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      ...(opts?.referer ? { 'http-referer': opts.referer } : {}),
      ...(opts?.title ? { 'x-title': opts.title } : {}),
    },
    body: JSON.stringify(req),
  });

  const data = (await res.json().catch(() => ({}))) as OpenRouterResponse;

  if (!res.ok) {
    throw new OpenRouterError(data.error?.message ?? `HTTP ${res.status}`, res.status);
  }

  const text = data.choices?.[0]?.message?.content ?? '';
  const promptTokens = data.usage?.prompt_tokens ?? 0;
  const completionTokens = data.usage?.completion_tokens ?? 0;
  const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens;

  const pricing = MODEL_PRICING[req.model];
  const costUsd = pricing ? estimateCost(pricing, promptTokens, completionTokens) : 0;

  return {
    text,
    usage: { promptTokens, completionTokens, totalTokens },
    costUsd,
    model: data.model ?? req.model,
  };
}

export async function chatCompletionWithBudget(
  kv: {
    get: (k: string) => Promise<string | null>;
    put: (k: string, v: string, opts?: { expirationTtl?: number }) => Promise<void>;
  },
  apiKey: string,
  req: ChatCompletionRequest,
  opts?: { referer?: string; title?: string }
): Promise<ChatCompletionResult> {
  const result = await chatCompletion(apiKey, req, opts);
  if (result.costUsd > 0) {
    await recordCost(kv, result.costUsd);
  }
  return result;
}
