/**
 * AIっぽさ是正: 全コラムスキャンで見つかった em dash「——」を句点に置換する (2026-07-01)
 * 全8件が「引用/主張」——「コメント」の同型パターンで、句点で2文に割ると自然。
 * 参照: .claude/rules/content.md
 *
 *   node --env-file=.env scripts/patch-remove-emdash.mjs          # dry-run
 *   node --env-file=.env scripts/patch-remove-emdash.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');
const SLUGS = [
  'things-not-to-do-pm',
  'ai-dx-introduction-process',
  'project-management-complete-guide',
  'dx-failure-patterns',
  'engineer-communication',
  'estimate-complete-guide',
];

console.log(`モード: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}\n`);
let changed = 0;
const errors = [];

for (const slug of SLUGS) {
  let cur;
  try {
    cur = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'content' },
    });
  } catch (e) {
    console.error(`[NG] ${slug}: ${e.message}`);
    errors.push(slug);
    continue;
  }
  const content = cur.content || '';
  const n = (content.match(/——/g) || []).length;
  if (n === 0) {
    console.log(`--- ${slug}: em dash なし [skip]`);
    continue;
  }
  const next = content.replaceAll('——', '。');
  console.log(`--- ${slug}: ${n}件置換`);
  for (const m of content.match(/.{10}——.{10}/g) || []) {
    console.log(`    …${m.replace(/<[^>]+>/g, '')}… → 句点化`);
  }
  changed += n;

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: slug,
        queries: { fields: 'content' },
      });
      const left = (ver.content.match(/——/g) || []).length;
      console.log(`    [OK] PATCH完了 / 残 em dash: ${left}`);
    } catch (e) {
      console.error(`    [NG] PATCH失敗: ${e.message}`);
      errors.push(slug);
    }
  }
}

console.log(`\n${DRY_RUN ? '置換予定' : '置換'}: ${changed}件 / エラー: ${errors.length}件`);
if (DRY_RUN) console.log('--apply で実行');
