import { describe, expect, test } from 'vitest';
import { translateOcrError } from './translate-error';

describe('translateOcrError', () => {
  test('設定不足コードは message を優先返却', () => {
    expect(translateOcrError(500, 'binding_missing', 'AI binding がありません')).toBe(
      'AI binding がありません'
    );
    expect(translateOcrError(500, 'turnstile_secret_missing')).toBe(
      'デモ環境の設定が不足しています。'
    );
    expect(translateOcrError(500, 'openrouter_key_missing')).toBe(
      'デモ環境の設定が不足しています。'
    );
  });

  test('budget_exceeded は固定メッセージ', () => {
    expect(translateOcrError(200, 'budget_exceeded')).toBe(
      '本日のデモ枠が上限に達しました。明日以降にお試しください。'
    );
  });

  test('OCR 固有コードは専用メッセージ', () => {
    expect(translateOcrError(413, 'image_too_large')).toBe(
      'ファイルサイズが大きすぎます (最大5MB)。'
    );
    expect(translateOcrError(415, 'unsupported_mime')).toBe('対応していない画像形式です。');
  });

  test('HTTP ステータスで分岐する', () => {
    expect(translateOcrError(429)).toBe('リクエストが多すぎます。しばらく時間をおいてください。');
    expect(translateOcrError(403)).toBe(
      'セキュリティチェックに失敗しました。ページを再読み込みしてください。'
    );
    expect(translateOcrError(502)).toBe('AIサービスとの通信に失敗しました。');
    expect(translateOcrError(503)).toBe('サービスが一時的に利用できません。');
  });

  test('未知のエラーは message → code → デフォルトの順でフォールバック', () => {
    expect(translateOcrError(500, undefined, 'カスタム')).toBe('カスタム');
    expect(translateOcrError(500, 'mystery_code')).toBe('mystery_code');
    expect(translateOcrError(500)).toBe('予期しないエラーが発生しました。');
  });

  test('OCR コードはステータス分岐より優先される', () => {
    expect(translateOcrError(429, 'image_too_large')).toBe(
      'ファイルサイズが大きすぎます (最大5MB)。'
    );
  });
});
