/**
 * scripts/seed-qa-data.json から MicroCMS に QA を一括投入する。
 * - 既存 id（公開中・draft 含む）は PATCH（answer/question/category/order）
 * - 未存在 id は POST（contentId 指定で create）
 * - データの "answer" に「再執筆中」マーカーが含まれる場合は skip（執筆未完了の保護）
 *
 * 使い方:
 *   node scripts/seed-qa-batch.mjs --dry    # プレビュー（デフォルト）
 *   node scripts/seed-qa-batch.mjs --apply  # 実投入
 *
 * 必要な env:
 *   - MICROCMS_SERVICE_DOMAIN
 *   - MICROCMS_API_KEY (qas / qa-categories に GET/POST/PATCH 権限)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'microcms-js-sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'scripts/seed-qa-data.json');

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRAFT_MARKER = '再執筆中';

async function main() {
  const { categories = [], qas = [] } = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  console.log(`[mode] ${dryRun ? 'DRY-RUN (--apply で実行)' : 'APPLY'}`);
  console.log(`[plan] categories=${categories.length} qas=${qas.length}\n`);

  const remoteCats = await fetchAllIds('qa-categories');
  const remoteQas = await fetchAllIds('qas');
  console.log(`[remote] qa-categories=${remoteCats.size} qas=${remoteQas.size}\n`);

  // カテゴリ
  for (const cat of categories) {
    const action = remoteCats.has(cat.id) ? 'patch' : 'create';
    console.log(`[cat ${action}] ${cat.id} :: ${cat.title}`);
    if (dryRun) continue;
    if (action === 'create') {
      await client.create({
        endpoint: 'qa-categories',
        contentId: cat.id,
        content: {
          title: cat.title,
          description: cat.description,
          order: cat.order,
        },
      });
    } else {
      await client.update({
        endpoint: 'qa-categories',
        contentId: cat.id,
        content: {
          title: cat.title,
          description: cat.description,
          order: cat.order,
        },
      });
    }
    await sleep(1500);
  }

  // QA
  let skipped = 0;
  for (const qa of qas) {
    const id = `${qa.categoryId}-${qa.order}`;
    if ((qa.answer || '').includes(DRAFT_MARKER)) {
      console.log(`[skip qa] ${id} (draft marker)`);
      skipped++;
      continue;
    }
    const action = remoteQas.has(id) ? 'patch' : 'create';
    console.log(`[qa ${action}] ${id} :: ${qa.question}`);
    if (dryRun) continue;
    const content = {
      question: qa.question,
      answer: qa.answer,
      category: qa.categoryId,
      order: qa.order,
    };
    if (action === 'create') {
      await client.create({ endpoint: 'qas', contentId: id, content });
    } else {
      await client.update({ endpoint: 'qas', contentId: id, content });
    }
    await sleep(1500);
  }

  console.log(`\n[done] ${dryRun ? '(dry-run)' : '(applied)'} skipped=${skipped}`);
}

async function fetchAllIds(endpoint) {
  const ids = new Set();
  try {
    const data = await client.get({ endpoint, queries: { limit: 100, fields: 'id' } });
    for (const c of data.contents || []) ids.add(c.id);
  } catch (err) {
    console.warn(`[warn] ${endpoint} 取得失敗:`, err?.message || err);
  }
  return ids;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
