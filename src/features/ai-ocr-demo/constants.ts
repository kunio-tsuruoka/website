/** アップロード可能な最大バイト数（5MB）。サーバ側 (`/api/ai/ocr`) の制限と同期。 */
export const MAX_BYTES = 5 * 1024 * 1024;

/** 受け付ける MIME タイプ。input[accept] にカンマ区切りで渡す。 */
export const ACCEPTED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export const ACCEPTED_MIMES_ATTR = ACCEPTED_MIMES.join(',');
