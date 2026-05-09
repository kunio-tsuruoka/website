/**
 * claudedocs/drafts/ 配下の「リライト用」HTML を、既存の MicroCMS columns に
 * 上書き（PATCH）する。新規 create は publish-drafts.mjs を使う。
 *
 * 使い方:
 *   node scripts/patch-drafts.mjs            # dry-run（既定、API への write なし）
 *   node scripts/patch-drafts.mjs --apply    # 実際に PATCH 送信（本番反映）
 *
 * 安全装置:
 *   - 既定で dry-run
 *   - メタヘッダの「想定スラッグ」と上書き対象 slug が不一致なら停止
 *   - 上書き対象の slug が MicroCMS に存在しないなら停止（誤作成を防ぐ）
 *   - HTML の改行は保ったまま送る（1行詰めHTMLでブロック要素が崩れる問題対策）
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'microcms-js-sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRAFTS_DIR = join(ROOT, 'claudedocs/drafts');

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// 上書き対象: リライトファイル → 上書きする既存記事の slug
const REWRITES = [
  { file: 'cluster-data-04-cdp-explained-rewrite.html', slug: 'cdp-explained' },
  { file: 'cluster-data-05-cdp-cost-rewrite.html', slug: 'cdp-cost-and-period' },
  { file: 'cluster-data-06-data-utilization-failure-rewrite.html', slug: 'cdp-failure-patterns' },
  { file: 'cluster-exec-04-kintone-illusion-trap.html', slug: 'kintone-illusion-trap' },
];

function extractMeta(text) {
  const slugMatch = text.match(/想定スラッグ[:：]\s*`([^`]+)`/);
  const catMatch = text.match(/推奨カテゴリ[:：]\s*`([^`]+)`/);
  const descMatch = text.match(/想定\s*description[^:：]*[:：]\s*(.+)/);
  return {
    slug: slugMatch?.[1]?.trim(),
    category: catMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
  };
}

function stripMetaBlock(text) {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i].startsWith('# ')) i++;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === '' || line.startsWith('>')) {
      i++;
    } else if (line === '---') {
      i++;
      break;
    } else {
      break;
    }
  }
  return lines.slice(i).join('\n').trim();
}

function extractTitle(text) {
  const m = text.match(/^#\s+(.+)/m);
  return m?.[1]?.trim() ?? '';
}

const VALID_CATEGORIES = [
  'estimate-concerns',
  'project-management',
  'communication',
  'cdp-development',
  'ai',
  'dx',
];
function resolveCategory(raw) {
  if (!raw) return 'cdp-development';
  for (const c of VALID_CATEGORIES) {
    if (raw.includes(c)) return c;
  }
  return 'cdp-development';
}

console.log(
  `Mode: ${dryRun ? 'DRY-RUN (no API writes)' : 'APPLY (PATCH-update existing entries)'}`
);
console.log(`Targets: ${REWRITES.length} rewrites`);
console.log('---');

let succeeded = 0;
const errors = [];

for (const { file, slug } of REWRITES) {
  const path = join(DRAFTS_DIR, file);
  const raw = readFileSync(path, 'utf-8');
  const meta = extractMeta(raw);
  const title = extractTitle(raw);
  const html = stripMetaBlock(raw);
  const category = resolveCategory(meta.category);

  console.log(`[FILE] ${file}`);
  console.log(`   target slug : ${slug}`);
  console.log(`   meta slug   : ${meta.slug}`);
  console.log(`   title       : ${title}`);
  console.log(`   category    : ${category}`);
  console.log(
    `   desc(${(meta.description || '').length}): ${(meta.description || '').slice(0, 80)}${(meta.description || '').length > 80 ? '...' : ''}`
  );
  console.log(`   html bytes  : ${html.length}`);
  console.log(`   html lines  : ${html.split('\n').length}  (1行詰め回避: 改行保持済み)`);

  if (!meta.slug || meta.slug !== slug) {
    console.error(
      `   NG: メタヘッダの想定スラッグ(${meta.slug || 'なし'})と上書き対象(${slug})が一致しません`
    );
    errors.push(`${slug}: slug mismatch`);
    continue;
  }

  let exists = false;
  try {
    await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'id' } });
    exists = true;
  } catch (_) {
    exists = false;
  }
  if (!exists) {
    console.error(`   NG: 上書き対象 ${slug} が MicroCMS に存在しません（誤作成回避のため停止）`);
    errors.push(`${slug}: not found in MicroCMS`);
    continue;
  }

  if (dryRun) {
    console.log('   OK: would PATCH (dry-run)');
    succeeded++;
    continue;
  }

  try {
    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content: {
        title,
        content: html,
        description: meta.description || '',
        category,
      },
    });
    console.log('   OK: PATCH applied');
    succeeded++;
  } catch (e) {
    const msg = `${slug}: ${e.message}`;
    console.error(`   NG: ${msg}`);
    errors.push(msg);
  }
}

console.log('\n========================================');
console.log(`${dryRun ? 'plan' : 'patched'}: ${succeeded}/${REWRITES.length}`);
if (errors.length > 0) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
  process.exit(1);
}
if (dryRun) {
  console.log('\nThis was a dry run. Re-run with --apply to actually PATCH.');
}
