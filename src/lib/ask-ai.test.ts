import { describe, expect, it } from 'vitest';
import {
  ASK_AI_SITE_ORIGIN,
  buildAskAiPrompt,
  buildAskAiProviderUrl,
  normalizeAskAiPageUrl,
} from './ask-ai';

describe('normalizeAskAiPageUrl', () => {
  it('本番URLはそのまま返す', () => {
    expect(normalizeAskAiPageUrl('https://beekle.jp/services/ai-development')).toBe(
      'https://beekle.jp/services/ai-development'
    );
  });

  it('localhostは本番オリジンに置き換える', () => {
    expect(normalizeAskAiPageUrl('http://localhost:4321/services/ai-development?x=1')).toBe(
      `${ASK_AI_SITE_ORIGIN}/services/ai-development?x=1`
    );
  });
});

describe('buildAskAiPrompt', () => {
  it('ページ情報と中立な評価依頼を含める', () => {
    const prompt = buildAskAiPrompt({
      pageTitle: '生成AI受託開発',
      pageUrl: 'https://beekle.jp/services/ai-development',
      pageSummary: '要件定義からAI開発まで一気通貫で支援する',
      serviceName: '生成AI受託開発',
    });

    expect(prompt).toContain('中立に評価');
    expect(prompt).toContain('生成AI受託開発');
    expect(prompt).toContain('https://beekle.jp/services/ai-development');
    expect(prompt).toContain('要件定義からAI開発まで一気通貫で支援する');
    expect(prompt).toContain('合う理由と、合わない理由');
    expect(prompt).toContain('Beekle株式会社');
    expect(prompt).not.toContain('localhost');
  });

  it('開発中のURLでもプロンプトには本番URLを載せる', () => {
    const prompt = buildAskAiPrompt({
      pageTitle: 'Beekle',
      pageUrl: 'http://127.0.0.1:4321/',
    });
    expect(prompt).toContain(`${ASK_AI_SITE_ORIGIN}/`);
  });
});

describe('buildAskAiProviderUrl', () => {
  const prompt = 'Beekleは合うか';

  it('ChatGPT / Claude / Perplexity はプロンプトを載せる', () => {
    const encoded = encodeURIComponent(prompt);
    expect(buildAskAiProviderUrl('chatgpt', prompt)).toBe(`https://chatgpt.com/?q=${encoded}`);
    expect(buildAskAiProviderUrl('claude', prompt)).toBe(`https://claude.ai/new?q=${encoded}`);
    expect(buildAskAiProviderUrl('perplexity', prompt)).toBe(
      `https://www.perplexity.ai/search?q=${encoded}`
    );
  });

  it('Geminiは入力欄へ渡せないのでアプリを開くだけ', () => {
    expect(buildAskAiProviderUrl('gemini', prompt)).toBe('https://gemini.google.com/app');
  });
});
