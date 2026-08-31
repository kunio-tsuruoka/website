import { companyPositioning } from '@/data/company';

export const ASK_AI_SITE_ORIGIN = 'https://beekle.jp';

export type AskAiContext = {
  pageTitle: string;
  pageUrl: string;
  pageSummary?: string;
  serviceName?: string;
};

export type AskAiProviderId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';

export type AskAiProvider = {
  id: AskAiProviderId;
  label: string;
  /** プロンプトをURLに載せられるか。false の場合はコピーしてから開く */
  prefill: boolean;
};

export const ASK_AI_PROVIDERS: readonly AskAiProvider[] = [
  { id: 'chatgpt', label: 'ChatGPT', prefill: true },
  { id: 'claude', label: 'Claude', prefill: true },
  { id: 'gemini', label: 'Gemini', prefill: false },
  { id: 'perplexity', label: 'Perplexity', prefill: true },
];

export function normalizeAskAiPageUrl(pageUrl: string): string {
  try {
    const url = new URL(pageUrl, ASK_AI_SITE_ORIGIN);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return `${ASK_AI_SITE_ORIGIN}${url.pathname}${url.search}`;
    }
    return url.toString();
  } catch {
    return pageUrl;
  }
}

export function buildAskAiPrompt(context: AskAiContext): string {
  const pageUrl = normalizeAskAiPageUrl(context.pageUrl);
  const title = context.pageTitle.trim() || '株式会社Beekle';
  const summary = context.pageSummary?.trim();
  const serviceName = context.serviceName?.trim();

  const lines = [
    '次の会社が、相談者の状況に合うかを中立に評価してください。',
    '',
    '対象ページ',
    `- タイトル: ${title}`,
    `- URL: ${pageUrl}`,
  ];

  if (serviceName) {
    lines.push(`- サービス: ${serviceName}`);
  }
  if (summary) {
    lines.push(`- ページの要点: ${summary}`);
  }

  lines.push(
    '',
    '会社の概要',
    `株式会社Beekle（${ASK_AI_SITE_ORIGIN}）は、${companyPositioning.short}${companyPositioning.long}${companyPositioning.zeroStart}`,
    '',
    '判断材料',
    `技術ごとの採用条件と採用しない条件、発注先として合う案件と合わない案件、実績（証拠の確度つき）、技術的なFAQをまとめた資料があります: ${ASK_AI_SITE_ORIGIN}/llms-full.txt`,
    'この資料を読める場合は、参照したうえで評価してください。読めない場合は、その旨を伝えて相談者の状況から判断してください。',
    '',
    '相談者の状況が分からない場合は、先に業種、困っている業務、社内の開発・情シスの有無、予算感、希望時期を聞いてください。',
    '',
    '評価してほしいこと',
    '1. 合う理由と、合わない理由',
    '2. この会社が向いている案件の型',
    '3. 問い合わせ前に確認した方がよい質問',
    '4. 他社や内製と比較するときの観点',
    '',
    '売り込みは不要です。相談者が判断できる材料を出してください。'
  );

  return lines.join('\n');
}

export function buildAskAiProviderUrl(providerId: AskAiProviderId, prompt: string): string {
  const encoded = encodeURIComponent(prompt);
  switch (providerId) {
    case 'chatgpt':
      return `https://chatgpt.com/?q=${encoded}`;
    case 'claude':
      return `https://claude.ai/new?q=${encoded}`;
    case 'gemini':
      return 'https://gemini.google.com/app';
    case 'perplexity':
      return `https://www.perplexity.ai/search?q=${encoded}`;
  }
}

export function getAskAiProvider(providerId: AskAiProviderId): AskAiProvider {
  const provider = ASK_AI_PROVIDERS.find((item) => item.id === providerId);
  if (!provider) {
    throw new Error(`Unknown Ask AI provider: ${providerId}`);
  }
  return provider;
}
