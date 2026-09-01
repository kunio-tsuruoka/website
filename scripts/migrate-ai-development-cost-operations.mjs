import { createClient } from 'microcms-js-sdk';
import { transformAiDevelopmentCostOperations } from './lib/ai-development-cost-operations.mjs';

const APPLY = process.argv.includes('--apply');
const CONTENT_ID = 'ai-development-cost-guide';

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are required');
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const article = await client.get({
  endpoint: 'columns',
  contentId: CONTENT_ID,
  queries: { fields: 'id,title,content' },
});

const next = transformAiDevelopmentCostOperations(article.content);

console.log(`[mode] ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
console.log(`[columns] ${CONTENT_ID}`);
console.log(
  next.changed
    ? '  - 運用・保守・継続改善の月額目安と上振れ条件を追加'
    : '  - 変更なし（追加済み）'
);

if (!APPLY || !next.changed) process.exit(0);

await client.update({
  endpoint: 'columns',
  contentId: CONTENT_ID,
  content: { content: next.content },
});

const verify = await client.get({
  endpoint: 'columns',
  contentId: CONTENT_ID,
  queries: { fields: 'id,content' },
});

if (verify.content !== next.content) {
  throw new Error(`verify failed: columns/${CONTENT_ID} field=content`);
}

console.log(`[updated] columns/${CONTENT_ID}`);
console.log('[done] verified 1 MicroCMS update');
