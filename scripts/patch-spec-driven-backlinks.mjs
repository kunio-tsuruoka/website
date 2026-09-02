import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';
const apply = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const LINK = '<a href="/knowledge/spec-driven-development">仕様駆動開発（SDD）とは</a>';
const PATCHES = [
  {
    id: 'ai-driven-development',
    find: '要件定義の精度が、これまで以上に成果物の品質を左右します。</p>',
    replace:
      '要件定義の精度が、これまで以上に成果物の品質を左右します。</p>\n' +
      `<p>この「仕様の精度がそのまま成果物になる」性質に向き合う進め方が仕様駆動開発（SDD）です。実装させる前にどこまで決めておけばよいかは${LINK}でまとめています。</p>`,
  },
  {
    id: 'requirements-definition-complete-guide',
    find: '<li><a href="/column/user-story-template-examples">User Storyの書き方</a></li></ul>',
    replace:
      '<li><a href="/column/user-story-template-examples">User Storyの書き方</a></li>' +
      `<li>${LINK}</li></ul>`,
  },
  {
    id: 'gherkin-bdd-introduction',
    find: '<li><a href="/column/user-story-template-examples">User Storyの書き方</a></li></ul>',
    replace:
      '<li><a href="/column/user-story-template-examples">User Storyの書き方</a></li>' +
      `<li>${LINK}</li></ul>`,
  },
];
for (const p of PATCHES) {
  const a = await client.get({ endpoint: 'columns', contentId: p.id, queries: { fields: 'content' } });
  if (a.content.includes('/spec-driven-development')) {
    console.log(`SKIP ${p.id}: 既にリンク済み`);
    continue;
  }
  const n = a.content.split(p.find).length - 1;
  if (n !== 1) {
    console.log(`ABORT ${p.id}: アンカーが ${n} 箇所（1でないため中断）`);
    continue;
  }
  const next = a.content.replace(p.find, p.replace);
  console.log(`${p.id}: ${a.content.length} -> ${next.length} bytes`);
  if (!apply) { console.log('  (dry-run)'); continue; }
  await client.update({ endpoint: 'columns', contentId: p.id, content: { content: next } });
  const after = await client.get({ endpoint: 'columns', contentId: p.id, queries: { fields: 'content' } });
  console.log(`  applied. リンク存在: ${after.content.includes('/knowledge/spec-driven-development')}`);
}
