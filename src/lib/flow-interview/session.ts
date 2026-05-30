import {
  EMPTY_DIAGRAM,
  type SessionState,
  SessionStateSchema,
} from '@/features/flow-interview/types';

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

const KEY_PREFIX = 'flow:session:';
const TTL_SEC = 60 * 30; // 30分

export function sessionKey(sessionId: string): string {
  return KEY_PREFIX + sessionId;
}

export function newSessionId(): string {
  const uuid = (globalThis.crypto as Crypto | undefined)?.randomUUID?.();
  if (uuid) return uuid;
  return `f_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function readSession(
  kv: KVNamespaceLike,
  sessionId: string
): Promise<SessionState | null> {
  const raw = await kv.get(sessionKey(sessionId));
  if (!raw) return null;
  try {
    const result = SessionStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function writeSession(kv: KVNamespaceLike, state: SessionState): Promise<void> {
  await kv.put(sessionKey(state.sessionId), JSON.stringify(state), { expirationTtl: TTL_SEC });
}

export function createSession(now: number = Date.now()): SessionState {
  return {
    sessionId: newSessionId(),
    createdAt: now,
    updatedAt: now,
    messages: [],
    diagram: { ...EMPTY_DIAGRAM },
    turns: 0,
    status: 'active',
    suggestSummary: null,
    suggestions: [],
  };
}
