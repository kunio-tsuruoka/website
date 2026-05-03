// 4ツールの localStorage 状態を一元管理する。
// 各ツールはこの関数を呼んで「最終保存時刻」をメタキーに記録する。
// /tools index の DataHousekeeping から保存状況一覧 + 削除に使う。

const META_KEY = 'beekle-tool-meta-v1';

export type ToolKey = 'flow-mapper' | 'story-builder' | 'scope-manager' | 'rfp-builder';

export const TOOL_STORAGE_KEYS: Record<ToolKey, string> = {
  'flow-mapper': 'beekle-flow-mapper-v2',
  'story-builder': 'beekle-story-builder-v1',
  'scope-manager': 'beekle-scope-manager-v1',
  'rfp-builder': 'beekle-rfp-builder-v1',
};

export const TOOL_LABELS: Record<ToolKey, string> = {
  'flow-mapper': '業務フロー可視化ツール',
  'story-builder': 'ユーザーストーリー作成ツール',
  'scope-manager': 'スコープ管理ツール',
  'rfp-builder': 'RFPドラフト自動生成',
};

type Meta = { [key in ToolKey]?: { savedAt: number } };

function readMeta(): Meta {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Meta;
  } catch {
    return {};
  }
}

function writeMeta(meta: Meta): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn('[tool-storage] meta 書き込み失敗:', err);
  }
}

/** ツール側の setItem 後に呼んで最終保存時刻を更新する */
export function markToolSaved(tool: ToolKey): void {
  const meta = readMeta();
  meta[tool] = { savedAt: Date.now() };
  writeMeta(meta);
}

export type ToolSnapshot = {
  tool: ToolKey;
  label: string;
  storageKey: string;
  hasData: boolean;
  savedAt: number | null;
  byteLength: number;
};

/** すべてのツールの保存状況スナップショット */
export function listToolSnapshots(): ToolSnapshot[] {
  if (typeof window === 'undefined') return [];
  const meta = readMeta();
  return (Object.keys(TOOL_STORAGE_KEYS) as ToolKey[]).map((tool) => {
    const storageKey = TOOL_STORAGE_KEYS[tool];
    const raw = localStorage.getItem(storageKey);
    return {
      tool,
      label: TOOL_LABELS[tool],
      storageKey,
      hasData: raw !== null && raw.length > 2,
      savedAt: meta[tool]?.savedAt ?? null,
      byteLength: raw ? new Blob([raw]).size : 0,
    };
  });
}

/** 1ツール分のデータを削除 */
export function clearTool(tool: ToolKey): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOOL_STORAGE_KEYS[tool]);
    const meta = readMeta();
    delete meta[tool];
    writeMeta(meta);
  } catch (err) {
    console.warn(`[tool-storage] ${tool} 削除失敗:`, err);
  }
}

/** すべてのツールデータ + メタを削除 */
export function clearAllTools(): void {
  if (typeof window === 'undefined') return;
  for (const tool of Object.keys(TOOL_STORAGE_KEYS) as ToolKey[]) {
    try {
      localStorage.removeItem(TOOL_STORAGE_KEYS[tool]);
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.removeItem(META_KEY);
  } catch {
    /* ignore */
  }
}

/** N日以上経過したデータを古いと判定 */
export const STALE_THRESHOLD_DAYS = 90;

export function isStale(savedAt: number | null): boolean {
  if (savedAt == null) return false;
  return Date.now() - savedAt > STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

export function formatSavedAt(savedAt: number | null): string {
  if (savedAt == null) return '保存日時不明';
  const d = new Date(savedAt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
