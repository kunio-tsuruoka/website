/**
 * `/api/ai/chat` から返るステータス + エラーコード/メッセージを
 * ユーザー向けの日本語メッセージに変換する純粋関数。
 *
 * 既存 `ai-it-advisor.tsx` 内のロジックをそのまま移植。テスト容易性のため切り出し。
 */
export function translateChatError(status: number, code?: string, message?: string): string {
  if (
    code === 'binding_missing' ||
    code === 'turnstile_secret_missing' ||
    code === 'openrouter_key_missing'
  ) {
    return message ?? 'デモ環境の設定が不足しています。';
  }
  if (code === 'budget_exceeded') {
    return '本日のデモ枠が上限に達しました。明日以降にお試しください。';
  }
  if (status === 429) return 'リクエストが多すぎます。しばらく時間をおいてください。';
  if (status === 403) {
    return 'セキュリティチェックに失敗しました。ページを再読み込みしてください。';
  }
  if (status === 502) return 'AIサービスとの通信に失敗しました。';
  if (status === 503) return 'サービスが一時的に利用できません。';
  return message ?? code ?? '予期しないエラーが発生しました。';
}
