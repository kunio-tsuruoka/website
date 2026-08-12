/**
 * Benefit/CVR Batch 1 for high-priority requirements articles.
 *
 * Usage:
 *   node scripts/patch-benefit-cvr-batch1.mjs
 *   node scripts/patch-benefit-cvr-batch1.mjs --apply-meta-only
 *   node scripts/patch-benefit-cvr-batch1.mjs --apply
 *
 * Notes:
 * - Default is dry-run.
 * - `--apply-meta-only` safely updates title/description only.
 * - `--apply` updates content markers too. Run this only after the code that
 *   supports the new markers has been deployed, otherwise raw {{MARKER}} text
 *   can appear on the public site.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const APPLY_META_ONLY = process.argv.includes('--apply-meta-only');
const DRY_RUN = !APPLY && !APPLY_META_ONLY;
const BACKUP_DIR = 'docs/marketing/data/microcms-backup/2026-08-12-benefit-cvr-batch1';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const PATCHES = [
  {
    slug: 'requirements-definition-complete-guide',
    contentReplacements: [
      {
        from: '<p>{{REQ_CONSULT_MID}}</p>',
        to: [
          '<p>ここで止まる場合は、項目を増やすより、RFP・As-Is・議事録をユースケースと受入条件に分ける方が早く進みます。</p>',
          '<p>{{PM_ON_RAILS_REQUIREMENTS_CONSULT_MID}}</p>',
        ].join('\n'),
      },
    ],
  },
  {
    slug: 'requirements-definition-template',
    contentReplacements: [
      {
        from: '<p>{{REQ_CONSULT_MID}}</p>',
        to: [
          '<p>テンプレートを埋めても、ベンダーごとに解釈が割れそうな場合は、先にユースケースと受入条件を揃えます。</p>',
          '<p>{{REQ_TEMPLATE_CONSULT_MID}}</p>',
        ].join('\n'),
      },
      {
        from: '<p>{{REQ_CONSULT}}</p>',
        to: [
          '<p>空欄や記入済みメモのままでも構いません。発注に使うには何が足りないかを確認します。</p>',
          '<p>{{REQ_TEMPLATE_CONSULT}}</p>',
        ].join('\n'),
      },
    ],
  },
  {
    slug: 'requirements-vs-requests',
    title: '要求と要件の違い｜現場要望を発注できる形に変える方法',
    description:
      '要求と要件の違いを、システム開発の発注で使える形に整理。現場要望をユースケース、受入条件、優先順位に変換する手順を解説します。',
    contentReplacements: [
      {
        from: '<p>{{REQ_CONSULT_MID}}</p>',
        to: [
          '<p>言葉の違いを理解するだけでは、見積もりは揃いません。現場要望を、比較できる要件に変換します。</p>',
          '<p>{{REQ_CONVERSION_CONSULT_MID}}</p>',
        ].join('\n'),
      },
      {
        from: '<p>{{REQ_CONSULT}}</p>',
        to: [
          '<p>要望メモの段階でも構いません。発注前に、ユースケース、受入条件、優先順位へ分けて整理します。</p>',
          '<p>{{REQ_CONVERSION_CONSULT}}</p>',
        ].join('\n'),
      },
    ],
  },
];

function h2Count(html) {
  return (html.match(/<h2\b/g) || []).length;
}

function markerList(html) {
  return [...html.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]);
}

function backupPath(slug) {
  const base = `${BACKUP_DIR}/${slug}.json`;
  if (!existsSync(base)) return base;
  let index = 2;
  while (existsSync(`${BACKUP_DIR}/${slug}.${index}.json`)) index += 1;
  return `${BACKUP_DIR}/${slug}.${index}.json`;
}

function applyReplacement(content, replacement, slug, errors) {
  const { from, to } = replacement;
  if (content.includes(to)) {
    return { content, status: 'already-target' };
  }
  const targetMarkers = markerList(to);
  if (targetMarkers.length > 0 && targetMarkers.every((name) => content.includes(`{{${name}}}`))) {
    return { content, status: 'already-target' };
  }
  if (!content.includes(from)) {
    errors.push(`${slug}: replacement source not found: ${from}`);
    return { content, status: 'missing-source' };
  }
  return { content: content.replace(from, to), status: 'changed' };
}

function contentVerificationOk(actual, expected) {
  const expectedMarkers = markerList(expected);
  if (expectedMarkers.length === 0) return actual === expected;
  return expectedMarkers.every((name) => actual.includes(`{{${name}}}`));
}

console.log(
  `Mode: ${DRY_RUN ? 'DRY-RUN' : APPLY_META_ONLY ? 'APPLY META ONLY' : 'APPLY CONTENT + META'}\n`
);

if (
  (APPLY || APPLY_META_ONLY) &&
  (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY)
) {
  console.error('Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY.');
  process.exit(1);
}

if (APPLY || APPLY_META_ONLY) mkdirSync(BACKUP_DIR, { recursive: true });

let changedArticles = 0;
const errors = [];

for (const patch of PATCHES) {
  console.log(`--- ${patch.slug} ---`);

  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: patch.slug,
      queries: { fields: 'id,title,description,content' },
    });
  } catch (error) {
    errors.push(`${patch.slug}: fetch failed - ${error.message}`);
    console.log(`  NG fetch failed: ${error.message}`);
    continue;
  }

  const beforeContent = current.content || '';
  const beforeH2 = h2Count(beforeContent);
  let nextContent = beforeContent;
  let contentChanged = false;

  for (const replacement of patch.contentReplacements || []) {
    const result = applyReplacement(nextContent, replacement, patch.slug, errors);
    nextContent = result.content;
    if (result.status === 'changed') contentChanged = true;
    console.log(`  content replacement: ${result.status}`);
  }

  const titleChanged = patch.title ? current.title !== patch.title : false;
  const descChanged = patch.description ? (current.description || '') !== patch.description : false;
  const updatePayload = {};

  if (!APPLY_META_ONLY && contentChanged) updatePayload.content = nextContent;
  if (patch.title && titleChanged) updatePayload.title = patch.title;
  if (patch.description && descChanged) updatePayload.description = patch.description;

  console.log(`  h2: ${beforeH2} -> ${h2Count(nextContent)}`);
  console.log(`  markers before: ${markerList(beforeContent).join(', ') || '(none)'}`);
  console.log(`  markers after:  ${markerList(nextContent).join(', ') || '(none)'}`);
  if (patch.title) {
    console.log(`  title old: ${current.title}`);
    console.log(`  title new: ${patch.title}`);
    console.log(`  title changed: ${titleChanged ? 'YES' : 'no'}`);
  }
  if (patch.description) {
    console.log(`  desc old: ${current.description || '(empty)'}`);
    console.log(`  desc new: ${patch.description}`);
    console.log(`  desc changed: ${descChanged ? 'YES' : 'no'}`);
  }

  if (h2Count(nextContent) !== beforeH2) {
    errors.push(`${patch.slug}: h2 count changed unexpectedly`);
  }

  if (Object.keys(updatePayload).length === 0) {
    console.log('  no write needed\n');
    continue;
  }

  changedArticles++;

  if (DRY_RUN) {
    console.log(`  would PATCH fields: ${Object.keys(updatePayload).join(', ')}\n`);
    continue;
  }

  writeFileSync(
    backupPath(patch.slug),
    JSON.stringify(
      {
        id: current.id,
        title: current.title,
        description: current.description || '',
        content: beforeContent,
      },
      null,
      2
    ),
    'utf8'
  );

  await client.update({
    endpoint: 'columns',
    contentId: patch.slug,
    content: updatePayload,
  });

  const after = await client.get({
    endpoint: 'columns',
    contentId: patch.slug,
    queries: { fields: 'id,title,description,content' },
  });

  const contentOk = updatePayload.content
    ? contentVerificationOk(after.content || '', updatePayload.content)
    : true;
  const titleOk = updatePayload.title ? after.title === updatePayload.title : true;
  const descOk = updatePayload.description
    ? (after.description || '') === updatePayload.description
    : true;

  console.log(`  verify content: ${contentOk ? 'OK' : 'NG'}`);
  console.log(`  verify title: ${titleOk ? 'OK' : 'NG'}`);
  console.log(`  verify desc: ${descOk ? 'OK' : 'NG'}`);
  console.log('');

  if (!contentOk || !titleOk || !descOk) {
    errors.push(`${patch.slug}: verification failed`);
  }
}

console.log('========================================');
console.log(`${DRY_RUN ? 'planned' : 'patched'}: ${changedArticles}/${PATCHES.length}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`- ${error}`);
if (errors.length) process.exitCode = 1;

if (DRY_RUN) {
  console.log(
    '\nDry run only. Use --apply-meta-only for title/description, or --apply after marker code is deployed.'
  );
}
