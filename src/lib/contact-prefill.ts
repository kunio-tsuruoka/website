// ツールで作成した内容（As-Is/To-Be/RFP）を /contact のメッセージ欄へ引き継ぐための一時受け渡し。
// localStorage に短時間だけ置き、contact-form が読み取って message に流し込む（→ /api/contact 経由で Slack へ届く）。
// URL に乗せると長すぎ（RFPはキロ単位）になるため localStorage 方式。

const KEY = 'beekle-contact-prefill-v1';
const TTL_MS = 30 * 60 * 1000; // 30分

type Prefill = { text: string; expires: number };

export function writeContactPrefill(text: string): void {
  if (typeof window === 'undefined' || !text.trim()) return;
  try {
    const data: Prefill = { text, expires: Date.now() + TTL_MS };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* QuotaExceeded 等は致命的でない */
  }
}

export function consumeContactPrefill(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Prefill;
    localStorage.removeItem(KEY);
    if (!data.expires || data.expires < Date.now()) return null;
    return data.text || null;
  } catch {
    return null;
  }
}
