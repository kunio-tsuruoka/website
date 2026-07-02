import { createClient } from 'microcms-js-sdk';
/**
 * AI引用の買い手ページで、末尾のgeneric {{CONTACT_CTA}} を意図一致CTAに差し替える。
 *
 * 背景: Clarity AI Citations(Pagesビュー)で、AIが送客する買い手ページのうち
 * コスト/ROI/見積系が generic な CONTACT_CTA(end)しか持っていなかった。
 * 意図一致のCTA(ESTIMATE_CONSULT=費用相談)に上げて、AI経由の濃い読者の転換を狙う。
 *
 * 既定 dry-run。--apply で MicroCMS に PATCH。
 * PATCH後は再取得して (1)対象マーカーが入れ替わった (2)h2数が不変(サニタイザ事故検知)
 * をassertする。
 *
 * 使い方:
 *   node --env-file=.env scripts/patch-aicited-cta-intent.mjs         # dry-run
 *   node --env-file=.env scripts/patch-aicited-cta-intent.mjs --apply
 */
import { getColumns } from '../src/lib/microcms.ts';

const APPLY = process.argv.includes('--apply');

// slug → {from, to} 意図一致への差し替え。コスト/見積/ROI意図の買い手ページのみ。
const PATCHES = [
  { slug: 'ai-roi-measurement-difficulty', from: '{{CONTACT_CTA}}', to: '{{ESTIMATE_CONSULT}}' },
  { slug: 'system-estimate-validity', from: '{{CONTACT_CTA}}', to: '{{ESTIMATE_CONSULT}}' },
];

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

function h2count(s) {
  return (s.match(/<h2/g) || []).length;
}

const cols = await getColumns(undefined, process.env);
const byId = Object.fromEntries(cols.map((c) => [c.id, c]));

let ok = 0;
let skipped = 0;
for (const { slug, from, to } of PATCHES) {
  const col = byId[slug];
  if (!col) {
    console.log(`[SKIP] ${slug}: 記事なし`);
    skipped++;
    continue;
  }
  const body = col.content || '';
  const occ = (body.match(new RegExp(from.replace(/[{}]/g, '\\$&'), 'g')) || []).length;
  if (occ === 0) {
    console.log(`[SKIP] ${slug}: "${from}" が無い（既に差し替え済み？）`);
    skipped++;
    continue;
  }
  const next = body.split(from).join(to);
  const beforeH2 = h2count(body);
  const afterH2 = h2count(next);

  console.log(`[${APPLY ? 'APPLY' : 'DRY'}] ${slug}: ${from} × ${occ} → ${to}  (h2 ${beforeH2})`);

  if (!APPLY) {
    ok++;
    continue;
  }

  await client.update({ endpoint: 'columns', contentId: slug, content: { content: next } });
  // 検証: 再取得して差し替え & h2数保全を確認
  const fetched = await client.get({
    endpoint: 'columns',
    contentId: slug,
    queries: { fields: 'content' },
  });
  const fb = fetched.content || '';
  const hasTo = fb.includes(to);
  const hasFrom = fb.includes(from);
  const h2ok = h2count(fb) === beforeH2;
  if (hasTo && !hasFrom && h2ok) {
    console.log(`  ✓ 検証OK (${to} 有 / ${from} 無 / h2=${h2count(fb)})`);
    ok++;
  } else {
    console.log(`  ✗ 検証NG: hasTo=${hasTo} hasFrom=${hasFrom} h2 ${beforeH2}→${h2count(fb)}`);
    process.exitCode = 1;
  }
}

console.log(
  `\n${APPLY ? '適用' : 'dry-run'}: ok=${ok} skipped=${skipped}${APPLY ? '' : '  (--apply で反映)'}`
);
