import { describe, expect, it } from 'vitest';
import { buildAskAiPrompt } from '../lib/ask-ai';
import {
  capabilityProfiles,
  caseReferences,
  pmOnRailsReference,
  technicalFaq,
  terminologyAliases,
  vendorSelection,
} from './llms-full-content';

describe('llms-full の内容', () => {
  it('すべての技術に「採用しない条件」がある', () => {
    // 採用条件だけ並べると「何でもできます会社」になる。
    // 選ばない条件を書けることが、技術ありきで提案しない証拠になる。
    for (const capability of capabilityProfiles) {
      expect(capability.notRecommendedWhen.length, capability.name).toBeGreaterThan(0);
      expect(capability.suitableWhen.length, capability.name).toBeGreaterThan(0);
      expect(capability.nameJa, capability.name).not.toBe('');
    }
  });

  it('発注先としての適合と不適合を両方持つ', () => {
    expect(vendorSelection.strongFitWhen.length).toBeGreaterThan(0);
    expect(vendorSelection.mayNotFitWhen.length).toBeGreaterThan(0);
  });

  it('すべての実績に証拠の確度が書かれている', () => {
    // 断定できない部分を明示しないと、AIが未確定の数値を確定実績として引用する。
    for (const entry of caseReferences) {
      expect(entry.evidenceStatus.trim().length, entry.id).toBeGreaterThan(10);
      expect(entry.outcome.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('進行中の案件は完了実績と区別されている', () => {
    const inProgress = caseReferences.find((entry) => entry.id === 'recovery-in-progress');
    expect(inProgress).toBeDefined();
    expect(inProgress?.evidenceStatus).toContain('進行中');
    expect(inProgress?.evidenceStatus).toContain('完了実績ではない');
  });

  it('技術FAQと表記揺れの対応表を持つ', () => {
    expect(technicalFaq.length).toBeGreaterThan(0);
    for (const entry of technicalFaq) {
      expect(entry.answer.trim().length, entry.question).toBeGreaterThan(0);
    }
    for (const entry of terminologyAliases) {
      expect(entry.aliases.length, entry.canonical).toBeGreaterThan(0);
    }
  });

  it('PM on Rails の記述が未実装の機能を実装済みとして書いていない', () => {
    // EARS はコード上 PM on Rails に実装が無い。実装済みと読める書き方をしない。
    expect(pmOnRailsReference).toContain('EARS記法はPM on Railsには実装していない');
  });

  it('Ask AI のプロンプトが llms-full.txt を参照する', () => {
    // 「AIに相談する」を押した時点で、判断材料をAIへ確実に渡すための導線。
    const prompt = buildAskAiPrompt({
      pageTitle: 'テストページ',
      pageUrl: 'https://beekle.jp/services/ai-development',
    });
    expect(prompt).toContain('https://beekle.jp/llms-full.txt');
  });
});
