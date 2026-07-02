/**
 * claudedocs/drafts/ai-contract-development-failures.html を MicroCMS columns に公開する。
 * publish-drafts.mjs はカテゴリを3種しか知らず ai-development を project-management に
 * フォールバックするため、この記事専用に category='ai-development' を明示して投入する。
 *
 * 注意: microcms-js-sdk の create() は status:'draft' でも即公開される（.claude/rules/microcms.md）。
 *
 *   node --env-file=.env scripts/publish-one-ai-failures.mjs          # dry-run
 *   node --env-file=.env scripts/publish-one-ai-failures.mjs --apply  # 公開
 */
import { readFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const DRY_RUN = !process.argv.includes('--apply');
const FILE = 'claudedocs/drafts/ai-contract-development-failures.html';
const SLUG = 'ai-contract-development-failures';
const CATEGORY = 'ai-development';

const raw = readFileSync(FILE, 'utf-8');
const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
const description = raw.match(/想定\s*description[^:：]*[:：]\s*(.+)/)?.[1]?.trim();
// 先頭メタブロック（# 行 + > 行 + ---）を除いた本文
const body = raw
  .split(/\n---\n/)
  .slice(1)
  .join('\n---\n')
  .trim();

if (!title || !description || !body) {
  console.error('パース失敗:', {
    title: !!title,
    description: !!description,
    bodyLen: body.length,
  });
  process.exit(1);
}

const faqCount = (body.match(/<h2[^>]*>Q\./g) || []).length;
console.log(`モード: ${DRY_RUN ? 'DRY-RUN' : 'APPLY (公開)'}`);
console.log(`slug     : ${SLUG}`);
console.log(`category : ${CATEGORY}`);
console.log(`title    : ${title} (${title.length}字)`);
console.log(`desc     : ${description} (${description.length}字)`);
console.log(`body     : ${body.length}字 / FAQ Q.: ${faqCount}`);
console.log(`body head: ${body.slice(0, 80)}...`);

if (DRY_RUN) {
  console.log('\n--apply で公開');
  process.exit(0);
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

try {
  const res = await client.create({
    endpoint: 'columns',
    contentId: SLUG,
    content: { title, content: body, category: CATEGORY, description },
    status: 'draft',
  });
  console.log(`\n[OK] 作成: ${JSON.stringify(res)}`);
  const ver = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'id,title,category,publishedAt' },
  });
  console.log(
    `[検証] id=${ver.id} / category=${ver.category?.id} / publishedAt=${ver.publishedAt || '(draft)'}`
  );
} catch (e) {
  console.error(`[NG] 公開失敗: ${e.message}`);
  process.exit(1);
}
