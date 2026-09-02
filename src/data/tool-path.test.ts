import { describe, expect, it } from 'vitest';
import { TOOL_PATH, getToolPathStep } from './tool-path';

describe('tool path', () => {
  it('見る → 書く → 切る → 出す の順', () => {
    expect(TOOL_PATH.map((step) => step.id)).toEqual([
      'flow-mapper',
      'story-builder',
      'scope-manager',
      'rfp-builder',
    ]);
    expect(TOOL_PATH.map((step) => step.verb)).toEqual(['見る', '書く', '切る', '出す']);
  });

  it('最後以外に次工程がある', () => {
    expect(getToolPathStep('flow-mapper').next?.id).toBe('story-builder');
    expect(getToolPathStep('story-builder').next?.id).toBe('scope-manager');
    expect(getToolPathStep('scope-manager').next?.id).toBe('rfp-builder');
    expect(getToolPathStep('rfp-builder').next).toBeUndefined();
  });
});
