import { describe, expect, test } from 'vitest';
import { fmtMin, fmtYen, uid } from './format';

describe('fmtMin', () => {
  test('60分未満は「N分」', () => {
    expect(fmtMin(0)).toBe('0分');
    expect(fmtMin(15)).toBe('15分');
    expect(fmtMin(59)).toBe('59分');
  });

  test('60分ちょうどは「N時間」', () => {
    expect(fmtMin(60)).toBe('1時間');
    expect(fmtMin(120)).toBe('2時間');
  });

  test('60分以上で余りがあれば「N時間M分」', () => {
    expect(fmtMin(75)).toBe('1時間15分');
    expect(fmtMin(135)).toBe('2時間15分');
  });
});

describe('fmtYen', () => {
  test('カンマ区切りの円表記', () => {
    expect(fmtYen(0)).toBe('¥0');
    expect(fmtYen(500)).toBe('¥500');
    expect(fmtYen(1000)).toBe('¥1,000');
    expect(fmtYen(1234567)).toBe('¥1,234,567');
  });

  test('小数は四捨五入される', () => {
    expect(fmtYen(99.4)).toBe('¥99');
    expect(fmtYen(99.5)).toBe('¥100');
    expect(fmtYen(123.45)).toBe('¥123');
  });
});

describe('uid', () => {
  test('8文字の英数字', () => {
    const id = uid();
    expect(id).toMatch(/^[a-z0-9]{8}$/);
  });

  test('連続呼び出しでユニーク（衝突確率は実用十分）', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(uid());
    expect(set.size).toBe(1000);
  });
});
