import { describe, expect, test } from 'vitest';
import { translateChatError } from './translate-error';

describe('translateChatError', () => {
  test('binding_missing 等の設定不足コードは message を優先返却', () => {
    expect(translateChatError(500, 'binding_missing', 'AI binding がありません')).toBe(
      'AI binding がありません'
    );
    expect(translateChatError(500, 'turnstile_secret_missing')).toBe(
      'デモ環境の設定が不足しています。'
    );
    expect(translateChatError(500, 'openrouter_key_missing')).toBe(
      'デモ環境の設定が不足しています。'
    );
  });

  test('budget_exceeded は固定メッセージ（status 無関係）', () => {
    expect(translateChatError(200, 'budget_exceeded')).toBe(
      '本日のデモ枠が上限に達しました。明日以降にお試しください。'
    );
    expect(translateChatError(429, 'budget_exceeded')).toBe(
      '本日のデモ枠が上限に達しました。明日以降にお試しください。'
    );
  });

  test('HTTP ステータスで分岐する', () => {
    expect(translateChatError(429)).toBe('リクエストが多すぎます。しばらく時間をおいてください。');
    expect(translateChatError(403)).toBe(
      'セキュリティチェックに失敗しました。ページを再読み込みしてください。'
    );
    expect(translateChatError(502)).toBe('AIサービスとの通信に失敗しました。');
    expect(translateChatError(503)).toBe('サービスが一時的に利用できません。');
  });

  test('未知のエラーは message → code → デフォルトの順でフォールバック', () => {
    expect(translateChatError(500, undefined, 'カスタム')).toBe('カスタム');
    expect(translateChatError(500, 'mystery_code')).toBe('mystery_code');
    expect(translateChatError(500)).toBe('予期しないエラーが発生しました。');
  });

  test('budget_exceeded は code 一致の優先度がステータス分岐より高い', () => {
    expect(translateChatError(503, 'budget_exceeded')).toBe(
      '本日のデモ枠が上限に達しました。明日以降にお試しください。'
    );
  });
});
