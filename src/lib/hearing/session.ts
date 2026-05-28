import { type SessionState, SessionStateSchema } from '@/features/ai-hearing/types';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const KEY_PREFIX = 'hearing:session:';
const TTL_SEC = 60 * 30; // 30分

export function sessionKey(sessionId: string): string {
  return KEY_PREFIX + sessionId;
}

export function newSessionId(): string {
  // crypto.randomUUID は Workers / 最近のブラウザで利用可。Astro SSR でも Workers ランタイム前提なので使える
  const uuid = (globalThis.crypto as Crypto | undefined)?.randomUUID?.();
  if (uuid) return uuid;
  // フォールバック (テスト環境用)
  return `h_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function readSession(
  kv: KVNamespaceLike,
  sessionId: string
): Promise<SessionState | null> {
  const raw = await kv.get(sessionKey(sessionId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = SessionStateSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export async function writeSession(kv: KVNamespaceLike, state: SessionState): Promise<void> {
  await kv.put(sessionKey(state.sessionId), JSON.stringify(state), {
    expirationTtl: TTL_SEC,
  });
}

export function createSession(now: number = Date.now()): SessionState {
  return {
    sessionId: newSessionId(),
    createdAt: now,
    updatedAt: now,
    messages: [],
    profile: {
      industry: null,
      companySize: null,
      phase: null,
      painPoints: [],
      currentWorkaround: null,
      impact: null,
      existingSystems: [],
      dataSources: [],
      budgetRange: null,
      timeline: null,
      decisionMakers: [],
      priorAttempts: [],
      successCriteria: [],
      contactEmail: null,
      contactName: null,
      contactCompany: null,
    },
    status: 'active',
  };
}
