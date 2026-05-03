// ツール間データ連携用の最小ハンドオフ。
// localStorage に短時間 (5分) だけ payload を置き、受け取り側が消費したら削除する。
// payload を URL に乗せると長すぎるケースが多い (flow-mapper 図などキロ単位)
// ためサーバーサイドストレージなしで安全に渡す方法として採用。

const HANDOFF_KEY = 'beekle-tool-handoff-v1';
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export type ToolId = 'flow-mapper' | 'story-builder' | 'scope-manager';

export type Handoff = {
  from: ToolId;
  target: ToolId;
  payload: string; // markdown / description テキスト
  expires: number; // epoch ms
};

export function writeHandoff(input: Omit<Handoff, 'expires'>): void {
  if (typeof window === 'undefined') return;
  try {
    const data: Handoff = { ...input, expires: Date.now() + TTL_MS };
    localStorage.setItem(HANDOFF_KEY, JSON.stringify(data));
  } catch (err) {
    // QuotaExceededError 等。ハンドオフは ephemeral なので失敗しても致命的ではないが警告は出す
    console.warn('[tool-handoff] localStorage 書き込み失敗:', err);
  }
}

export function consumeHandoff(target: ToolId): Handoff | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Handoff;
    if (data.target !== target) return null;
    if (data.expires < Date.now()) {
      localStorage.removeItem(HANDOFF_KEY);
      return null;
    }
    localStorage.removeItem(HANDOFF_KEY);
    return data;
  } catch {
    return null;
  }
}
