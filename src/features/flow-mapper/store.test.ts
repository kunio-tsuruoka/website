import { describe, expect, test } from 'vitest';
import { unwrapPersistedValue } from './store';

describe('unwrapPersistedValue', () => {
  test('null はそのまま null', () => {
    expect(unwrapPersistedValue(null)).toBeNull();
  });

  test('壊れた JSON は null に倒して初期値にフォールバック', () => {
    expect(unwrapPersistedValue('{not-json')).toBeNull();
  });

  test('zustand 形状 ({ state, version }) はそのまま素通し', () => {
    const wrapped = JSON.stringify({
      state: {
        asIs: { title: 'a', phases: [], lanes: [{ id: 'l1', name: 'A' }], steps: [] },
        toBe: { title: 'b', phases: [], lanes: [{ id: 'l1', name: 'A' }], steps: [] },
      },
      version: 0,
    });
    expect(unwrapPersistedValue(wrapped)).toBe(wrapped);
  });

  test('旧形状 (bare { asIs, toBe }) は { state, version } に詰め替えられる', () => {
    const legacy = JSON.stringify({
      asIs: {
        title: '現状',
        phases: [{ id: 'p1', name: '①' }],
        lanes: [{ id: 'l1', name: '担当者A' }],
        steps: [],
      },
      toBe: {
        title: '改善後',
        phases: [{ id: 'p1', name: '①' }],
        lanes: [{ id: 'l1', name: '担当者A' }],
        steps: [],
      },
    });
    const out = unwrapPersistedValue(legacy);
    expect(out).not.toBeNull();
    const parsed = JSON.parse(out as string);
    expect(parsed.version).toBe(0);
    expect(parsed.state.asIs.title).toBe('現状');
    expect(parsed.state.toBe.title).toBe('改善後');
    expect(parsed.state.asIs.lanes[0].name).toBe('担当者A');
  });

  test('lanes が無い空オブジェクトは旧形状とは判定されず素通し', () => {
    const raw = JSON.stringify({ asIs: {}, toBe: {} });
    expect(unwrapPersistedValue(raw)).toBe(raw);
  });
});
