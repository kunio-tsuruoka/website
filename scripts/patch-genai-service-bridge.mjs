// genai系コラム（genai-adoption / ai-development）にサービスLPブリッジマーカーを挿入する。
// 背景: 2026-07-07監査で47記事中39記事にサービスLPへのリンクが皆無だった。
// 記事末の相談CTA（テンプレート側）より手前の温度感の読者を、サービスLPに送る中間導線。
//
// 使い方:
//   node --env-file=.env scripts/patch-genai-service-bridge.mjs         # dry-run
//   node --env-file=.env scripts/patch-genai-service-bridge.mjs --apply
//
// 注意: {{X_SERVICE_BRIDGE}} マーカーは column-visuals.ts のデプロイ後にのみ適用すること
// （コード先・CMS後。microcms.md「新マーカー導入時のデプロイ順序」）。
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');

// slug → ブリッジ種別。記事の主題に最も近いサービスLPへ送る。
const BRIDGE_MAP = {
  // 問い合わせ対応・チャットボット系 → AIチャットボット開発
  'what-is-faq-system': 'CHATBOT_SERVICE_BRIDGE',
  'customer-support-ai-guide': 'CHATBOT_SERVICE_BRIDGE',
  'ai-chatbot-comparison': 'CHATBOT_SERVICE_BRIDGE',
  'chatbot-cannot-answer': 'CHATBOT_SERVICE_BRIDGE',
  'manufacturing-inquiry-ai': 'CHATBOT_SERVICE_BRIDGE',
  'inquiry-attribution-solution': 'CHATBOT_SERVICE_BRIDGE',
  // ナレッジ・属人化・文書検索系 → 社内文書AI検索
  'knowledge-management-guide': 'DOC_SEARCH_SERVICE_BRIDGE',
  'eliminate-work-attribution': 'DOC_SEARCH_SERVICE_BRIDGE',
  'veteran-knowledge-handover': 'DOC_SEARCH_SERVICE_BRIDGE',
  'ai-factcheck': 'DOC_SEARCH_SERVICE_BRIDGE',
  'internal-ai-assistant-rag-patterns': 'DOC_SEARCH_SERVICE_BRIDGE',
  // RAG・ナレッジグラフ系 → RAGシステム構築
  'what-is-rag': 'RAG_SERVICE_BRIDGE',
  'ai-rag-accuracy-graphrag': 'RAG_SERVICE_BRIDGE',
  'knowledge-graph-rag-business': 'RAG_SERVICE_BRIDGE',
  'emotion-commonsense-kg-customer-support': 'RAG_SERVICE_BRIDGE',
  // 生成AI導入・開発全般 → 生成AI受託開発
  'ai-agent-capability-upgrade': 'AI_DEV_SERVICE_BRIDGE',
  'generative-ai-system-development': 'AI_DEV_SERVICE_BRIDGE',
  'ai-requirements-definition': 'AI_DEV_SERVICE_BRIDGE',
  'ai-introduction-kpi-redesign': 'AI_DEV_SERVICE_BRIDGE',
  'it-admin-ai-first-week': 'AI_DEV_SERVICE_BRIDGE',
  'ai-project-stalled-agile': 'AI_DEV_SERVICE_BRIDGE',
  'ai-organization-constraints': 'AI_DEV_SERVICE_BRIDGE',
  'ai-legacy-system-constraints': 'AI_DEV_SERVICE_BRIDGE',
  'ai-executive-understanding': 'AI_DEV_SERVICE_BRIDGE',
  'ai-cost-zero-start': 'AI_DEV_SERVICE_BRIDGE',
  'ai-roi-measurement-difficulty': 'AI_DEV_SERVICE_BRIDGE',
  'ai-training-data-quality': 'AI_DEV_SERVICE_BRIDGE',
  'ai-security-privacy-guide': 'AI_DEV_SERVICE_BRIDGE',
  'ai-data-foundation-not-ready': 'AI_DEV_SERVICE_BRIDGE',
  'prompt-engineering-business': 'AI_DEV_SERVICE_BRIDGE',
  'ai-guideline-template': 'AI_DEV_SERVICE_BRIDGE',
  'ai-agent-build-guide': 'AI_DEV_SERVICE_BRIDGE',
  'ai-agent-explained': 'AI_DEV_SERVICE_BRIDGE',
  'ai-driven-development': 'AI_DEV_SERVICE_BRIDGE',
  'mcp-business-data-integration': 'AI_DEV_SERVICE_BRIDGE',
  'llm-selection-strategy': 'AI_DEV_SERVICE_BRIDGE',
  'ai-poc-to-production': 'AI_DEV_SERVICE_BRIDGE',
  'genai-system-infrastructure': 'AI_DEV_SERVICE_BRIDGE',
  'llm-api-system-design': 'AI_DEV_SERVICE_BRIDGE',
};

// 記事内の最後のCTAマーカーの直前に挿入する。CTAマーカーが無ければ末尾に追記。
const CTA_MARKERS = [
  '{{CONTACT_CTA}}',
  '{{ZERO_START_CONSULT_CTA}}',
  '{{ESTIMATE_CONSULT}}',
  '{{PARTNER_CONSULT}}',
];

function insertBridge(content, marker) {
  const block = `\n<p>{{${marker}}}</p>\n`;
  let lastIdx = -1;
  for (const m of CTA_MARKERS) {
    const idx = content.lastIndexOf(m);
    if (idx > lastIdx) lastIdx = idx;
  }
  if (lastIdx === -1) return content + block;
  // マーカーを含む <p> ブロックの先頭を探す（無ければマーカー位置）
  const pStart = content.lastIndexOf('<p>', lastIdx);
  const insertAt = pStart !== -1 && lastIdx - pStart < 40 ? pStart : lastIdx;
  return content.slice(0, insertAt) + block + content.slice(insertAt);
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

let patched = 0;
let skipped = 0;
for (const [slug, marker] of Object.entries(BRIDGE_MAP)) {
  let article;
  try {
    article = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,content' },
    });
  } catch {
    console.log(`[SKIP] ${slug}: 記事が見つからない`);
    skipped++;
    continue;
  }
  if (article.content.includes('_SERVICE_BRIDGE}}')) {
    console.log(`[SKIP] ${slug}: ブリッジ挿入済み`);
    skipped++;
    continue;
  }
  if (article.content.includes('href="/services/')) {
    console.log(`[SKIP] ${slug}: 既にサービスLPリンクあり`);
    skipped++;
    continue;
  }
  const next = insertBridge(article.content, marker);
  if (APPLY) {
    await client.update({ endpoint: 'columns', contentId: slug, content: { content: next } });
    console.log(`[PATCHED] ${slug} <- {{${marker}}}`);
  } else {
    const at = next.indexOf(`{{${marker}}}`);
    console.log(`[DRY] ${slug} <- {{${marker}}} at ${at}/${next.length}`);
  }
  patched++;
}
console.log(`\n${APPLY ? 'patched' : 'dry-run'}: ${patched}, skipped: ${skipped}`);
