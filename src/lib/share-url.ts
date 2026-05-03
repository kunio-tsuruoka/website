// ツールの保存データを URL ハッシュ経由で共有するための最小実装。
// localStorage の payload を JSON.stringify → UTF-8 安全な base64 にして
// `#share=...` に乗せる。サーバー保存なし、クライアント完結。
//
// URL 長制限: 通常ブラウザは 8KB 以上扱えるが、過大な diagram は警告を出す。
// 受信側は read-only として扱う想定 (編集UIはそのままだが「共有元のため別端末に保存される」旨を表示)。

const SHARE_PREFIX = 'share=';
const MAX_SAFE_LEN = 7000; // 概ね 7KB で警告

export function encodeShare<T>(payload: T): string {
  const json = JSON.stringify(payload);
  // UTF-8 → bytes → base64
  const utf8 = new TextEncoder().encode(json);
  let binary = '';
  for (const b of utf8) binary += String.fromCharCode(b);
  // URL 安全な base64 (=, +, / を置換)
  const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return base64;
}

export function decodeShare<T>(encoded: string): T | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function buildShareUrl<T>(basePath: string, payload: T): { url: string; tooLong: boolean } {
  const encoded = encodeShare(payload);
  const url = `${typeof window === 'undefined' ? '' : window.location.origin}${basePath}#${SHARE_PREFIX}${encoded}`;
  return { url, tooLong: encoded.length > MAX_SAFE_LEN };
}

export function readSharedFromHash<T>(): T | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash.startsWith(SHARE_PREFIX)) return null;
  const encoded = hash.slice(SHARE_PREFIX.length);
  return decodeShare<T>(encoded);
}

export function clearShareHash(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash.startsWith(`#${SHARE_PREFIX}`)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
