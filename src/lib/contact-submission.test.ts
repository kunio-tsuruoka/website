import { describe, expect, it } from 'vitest';
import {
  claimCrmInquirySync,
  createContactSubmissionId,
  crmSyncKvKey,
} from './contact-submission';

function createMemoryKV() {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
    _store: store,
  };
}

describe('createContactSubmissionId', () => {
  it('contact- で始まるIDを返す', () => {
    expect(createContactSubmissionId()).toMatch(/^contact-/);
  });
});

describe('claimCrmInquirySync', () => {
  it('KV未設定なら通す', async () => {
    expect(await claimCrmInquirySync(undefined, 'contact-abc')).toBe(true);
  });

  it('同じ送信IDの2回目は拒否する', async () => {
    const kv = createMemoryKV();
    const id = 'contact-same-id';

    expect(await claimCrmInquirySync(kv, id)).toBe(true);
    expect(await claimCrmInquirySync(kv, id)).toBe(false);
    expect(kv._store.get(crmSyncKvKey(id))).toBe('1');
  });

  it('別の送信IDは通す', async () => {
    const kv = createMemoryKV();

    expect(await claimCrmInquirySync(kv, 'contact-one')).toBe(true);
    expect(await claimCrmInquirySync(kv, 'contact-two')).toBe(true);
  });
});
