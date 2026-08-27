export const CRM_SYNC_KV_PREFIX = 'crm-sync:';
export const CRM_SYNC_TTL_SEC = 60 * 60 * 24 * 7;

export type ContactKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

export function createContactSubmissionId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `contact-${uuid}`;

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);
  return `contact-${timestamp}-${random}`;
}

export function crmSyncKvKey(submissionId: string): string {
  return `${CRM_SYNC_KV_PREFIX}${submissionId}`;
}

/**
 * 同じ送信IDのCRM登録を1回に制限する。
 * beekle-crm は Idempotency-Key を見ないため、サイト側で先に確保する。
 * KV未設定なら通す（単発送信側で再送しない前提）。
 */
export async function claimCrmInquirySync(
  kv: ContactKv | undefined,
  submissionId: string
): Promise<boolean> {
  if (!kv || !submissionId) return true;
  const key = crmSyncKvKey(submissionId);
  const existing = await kv.get(key);
  if (existing) return false;
  await kv.put(key, '1', { expirationTtl: CRM_SYNC_TTL_SEC });
  return true;
}
