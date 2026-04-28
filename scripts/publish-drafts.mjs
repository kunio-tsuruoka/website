/**
 * claudedocs/drafts/ 配下のMarkdownドラフトをMicroCMSのcolumnsに「下書き」として投入する
 *
 * 使い方:
 *   node scripts/publish-drafts.mjs --dry    # プレビュー（デフォルト）
 *   node scripts/publish-drafts.mjs --apply  # MicroCMSに下書きとして登録
 *
 * 安全装置:
 *   - 既定で dry-run（--apply 指定時のみ実際に登録）
 *   - ステータスは 'draft' で投稿（公開は管理画面で確認後に手動）
 *   - 既存IDと重複したらスキップ
 */
import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createClient } from 'microcms-js-sdk';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRAFTS_DIR = join(ROOT, 'claudedocs/drafts');

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

marked.setOptions({ breaks: true, gfm: true });

/** ドラフトファイル先頭のメタコメントから値を抽出 */
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

/** メタコメント（先頭の `>` で始まるブロック）を除いた本文を取得 */
function stripMetaBlock(text) {
  const lines = text.split('\n');
  let i = 0;
  // 先頭のH1を保持
  while (i < lines.length && lines[i].trim() === '') i++;
  if (lines[i].startsWith('# ')) {
    i++;
  }
  // > で始まる行と空行の連続をスキップ
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

/** タイトル抽出（# 行） */
function extractTitle(text) {
  const m = text.match(/^#\s+(.+)/m);
  return m?.[1]?.trim() ?? '';
}

/** カテゴリスラッグの正規化: '@/types/service' のテーブルから引く */
const CATEGORY_FALLBACK = 'project-management';
const VALID_CATEGORIES = ['estimate-concerns', 'project-management', 'communication'];

function resolveCategory(raw) {
  if (!raw) return CATEGORY_FALLBACK;
  // 「`estimate-concerns` または新カテゴリ ...」のパターンに対応
  for (const c of VALID_CATEGORIES) {
    if (raw.includes(c)) return c;
  }
  return CATEGORY_FALLBACK;
}

const drafts = readdirSync(DRAFTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

console.log(`Found ${drafts.length} draft files in ${DRAFTS_DIR}`);
console.log(`Mode: ${dryRun ? 'DRY-RUN (no API calls)' : 'APPLY (writing to MicroCMS as draft)'}`);
console.log('---');

let succeeded = 0;
let skipped = 0;
const errors = [];

for (const file of drafts) {
  const path = join(DRAFTS_DIR, file);
  const raw = readFileSync(path, 'utf-8');
  const meta = extractMeta(raw);
  const title = extractTitle(raw);
  const body = stripMetaBlock(raw);
  const html = marked(body);
  const category = resolveCategory(meta.category);

  console.log(`[FILE] ${file}`);
  console.log(`   slug      : ${meta.slug}`);
  console.log(`   title     : ${title}`);
  console.log(`   category  : ${category} ${meta.category && !VALID_CATEGORIES.includes(meta.category.split(' ')[0]) ? `(raw: ${meta.category})` : ''}`);
  console.log(`   desc(${(meta.description || '').length}): ${(meta.description || '').slice(0, 80)}${(meta.description || '').length > 80 ? '...' : ''}`);
  console.log(`   html len  : ${html.length}`);

  if (!meta.slug) {
    console.log('   SKIP: 想定スラッグが取れなかった');
    skipped++;
    continue;
  }

  // 重複チェック
  let exists = false;
  try {
    await client.get({ endpoint: 'columns', contentId: meta.slug, queries: { fields: 'id' } });
    exists = true;
  } catch (_) {
    exists = false;
  }
  if (exists) {
    console.log('   SKIP: 同じIDの記事が既に存在');
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log('   OK: would create (dry-run)');
    succeeded++;
    continue;
  }

  try {
    await client.create({
      endpoint: 'columns',
      contentId: meta.slug,
      content: {
        title,
        content: html,
        description: meta.description || '',
        category,
      },
      // 下書き状態で投稿（管理画面で確認後に公開）
      status: 'draft',
    });
    console.log('   OK: created as DRAFT');
    succeeded++;
  } catch (e) {
    const msg = `${meta.slug}: ${e.message}`;
    console.error(`   NG: ${msg}`);
    errors.push(msg);
  }
}

console.log('\n========================================');
console.log(`OK: ${dryRun ? 'plan' : 'created'}: ${succeeded}/${drafts.length}`);
if (skipped > 0) console.log(`skipped: ${skipped}`);
if (errors.length > 0) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
}
if (dryRun) {
  console.log('\nThis was a dry run. Re-run with --apply to actually create draft entries.');
}
