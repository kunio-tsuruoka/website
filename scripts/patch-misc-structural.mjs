// 監修の構造系（正規表現変換）。冪等・dry-run既定・--apply で本番。
//   0061 prevent-mismatch: テキスト区切り線 <p>------</p> を削除
//   0062 project-management-steps: <p><strong>ステップN：…</strong></p> を <h3> に
//   0073 oae_of8l_ij: <h2>「N. 」見出し</h2> の番号プレフィックスを除去
// 使い方: node --env-file=.env scripts/patch-misc-structural.mjs [--apply]

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const JOBS = [
  {
    slug: 'prevent-mismatch',
    id: '0061',
    fn: (h) => h.replace(/<p>-{10,}<\/p>/g, ''),
  },
  {
    slug: 'project-management-steps',
    id: '0062',
    // <p><strong>ステップN：…</strong></p> → <h3>ステップN：…</h3>
    fn: (h) => h.replace(/<p><strong>(ステップ[0-9０-９][^<]*)<\/strong><\/p>/g, '<h3>$1</h3>'),
  },
  {
    slug: 'oae_of8l_ij',
    id: '0073',
    // <h2 ...>N. 見出し</h2> の先頭 "N. " を除去
    fn: (h) => h.replace(/(<h2[^>]*>)\s*[0-9０-９]+\.\s*/g, '$1'),
  },
];

(async () => {
  for (const job of JOBS) {
    const cur = await client.get({
      endpoint: 'columns',
      contentId: job.slug,
      queries: { fields: 'content' },
    });
    const next = job.fn(cur.content);
    const changed = next !== cur.content;
    console.log(`\n=== ${job.slug} (${job.id}) ===`);
    console.log(changed ? '  変更あり' : '  変更なし（適用済/対象なし）');
    if (!changed || !APPLY) {
      if (changed && !APPLY) console.log('  [dry-run]');
      continue;
    }
    await client.update({ endpoint: 'columns', contentId: job.slug, content: { content: next } });
    console.log('  ✅ PATCH 完了');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
