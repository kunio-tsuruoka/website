/**
 * 生成AI・業務改善クラスタの汎用CTAを、記事ごとの読後不安に合う相談CTAへ差し替える。
 *
 * 使い方:
 *   node --env-file=.env scripts/patch-genai-dx-cluster-cta.mjs
 *   node --env-file=.env scripts/patch-genai-dx-cluster-cta.mjs --apply
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const backupDir = 'docs/marketing/data/microcms-backup/2026-07-29-genai-dx-cta';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const PATCHES = [
  { slug: 'ai-era-development-flow', from: 'CONTACT_CTA', to: 'GENAI_START_CONSULT' },
  { slug: 'genai-roi-investment', from: 'ESTIMATE_CONSULT', to: 'GENAI_ROI_CONSULT' },
  { slug: 'ai-factcheck', from: 'CONTACT_CTA', to: 'AI_ACCURACY_CONSULT' },
  { slug: 'rag-evaluation', from: 'CONTACT_CTA', to: 'AI_ACCURACY_CONSULT' },
  { slug: 'ai-knowledge-chatbot-accuracy', from: 'CONTACT_CTA', to: 'AI_ACCURACY_CONSULT' },
  { slug: 'ai-security-privacy-guide', from: 'CONTACT_CTA', to: 'TECH_REVIEW_CONSULT' },
  { slug: 'genai-security-governance', from: 'CONTACT_CTA', to: 'TECH_REVIEW_CONSULT' },
  { slug: 'genai-system-infrastructure', from: 'CONTACT_CTA', to: 'TECH_REVIEW_CONSULT' },
  { slug: 'dx-josys-ai-era-requirements', from: 'CONTACT_CTA', to: 'DX_WORKFLOW_CONSULT' },
  { slug: 'dx-josys-as-is-bpo-guide', from: 'CONTACT_CTA', to: 'DX_WORKFLOW_CONSULT' },
  { slug: 'dx-josys-tobe-redesign', from: 'CONTACT_CTA', to: 'DX_WORKFLOW_CONSULT' },
];

const marker = (name) => `{{${name}}}`;
const markerRe = (name) => new RegExp(`\\{\\{${name}\\}\\}`, 'g');
const h2Count = (html) => (html.match(/<h2/g) || []).length;

if (APPLY) mkdirSync(backupDir, { recursive: true });
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

let changed = 0;
let skipped = 0;
const errors = [];

for (const patch of PATCHES) {
  let article;
  try {
    article = await client.get({
      endpoint: 'columns',
      contentId: patch.slug,
      queries: { fields: 'title,content' },
    });
  } catch (e) {
    errors.push(`${patch.slug}: 取得失敗 ${e.message}`);
    continue;
  }

  const before = article.content || '';
  if (before.includes(marker(patch.to))) {
    console.log(`[SKIP] ${patch.slug}: ${marker(patch.to)} 挿入済み`);
    skipped++;
    continue;
  }
  if (!before.includes(marker(patch.from))) {
    console.log(`[SKIP] ${patch.slug}: ${marker(patch.from)} が無い`);
    skipped++;
    continue;
  }

  const next = before.replace(markerRe(patch.from), marker(patch.to));
  const beforeH2 = h2Count(before);
  const afterH2 = h2Count(next);

  console.log(
    `[${APPLY ? 'APPLY' : 'DRY'}] ${patch.slug}: ${marker(patch.from)} → ${marker(
      patch.to
    )} / h2 ${beforeH2}→${afterH2}`
  );
  changed++;

  if (!APPLY) continue;

  writeFileSync(`${backupDir}/${patch.slug}.html`, before, 'utf8');
  await client.update({ endpoint: 'columns', contentId: patch.slug, content: { content: next } });
  const fetched = await client.get({
    endpoint: 'columns',
    contentId: patch.slug,
    queries: { fields: 'content' },
  });
  const after = fetched.content || '';
  if (!after.includes(marker(patch.to)) || h2Count(after) !== beforeH2) {
    errors.push(`${patch.slug}: 検証NG`);
  }
}

console.log(`\nchanged=${changed} skipped=${skipped} errors=${errors.length}`);
for (const e of errors) console.log(`- ${e}`);
if (errors.length) process.exitCode = 1;
