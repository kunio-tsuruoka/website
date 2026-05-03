/**
 * scripts/seed-qa-data.json を MicroCMS の qa-categories / qas に下書きとして投入する
 *
 * 使い方:
 *   node scripts/seed-qas.mjs --dry    # プレビュー（デフォルト）
 *   node scripts/seed-qas.mjs --apply  # 実際に投入
 *
 * 安全装置:
 *   - 既定で dry-run（--apply 指定時のみ実際に登録）
 *   - ステータスは draft で投稿（公開は管理画面で確認後に手動）
 *   - 既存 id と重複したらスキップ
 *   - カテゴリーは固定 id で先に投入し、qas からは contentId 参照で接続
 *
 * 必要な環境変数:
 *   - MICROCMS_SERVICE_DOMAIN
 *   - MICROCMS_API_KEY (qa-categories と qas に POST/GET 権限が必要)
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

async function main() {
  const { categories, qas } = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  console.log(`[mode] ${dryRun ? 'DRY-RUN (--apply で実行)' : 'APPLY'}`);
  console.log(`[plan] categories=${categories.length} qas=${qas.length}\n`);

  // 既存カテゴリ取得（id 重複スキップ用）
  const existingCats = await fetchAllIds('qa-categories');
  const existingQas = await fetchAllIds('qas');

  console.log(`[remote] qa-categories=${existingCats.size} qas=${existingQas.size}\n`);

  // カテゴリ投入
  for (const cat of categories) {
    if (existingCats.has(cat.id)) {
      console.log(`[skip cat] ${cat.id} 既に存在`);
      continue;
    }
    console.log(`[create cat] ${cat.id} :: ${cat.title}`);
    if (!dryRun) {
      await client.create({
        endpoint: 'qa-categories',
        contentId: cat.id,
        content: {
          title: cat.title,
          description: cat.description,
          order: cat.order,
        },
      });
    }
  }

  // QA 投入（カテゴリは contentId 参照）
  for (const qa of qas) {
    const id = `${qa.categoryId}-${qa.order}`;
    if (existingQas.has(id)) {
      console.log(`[skip qa] ${id} 既に存在`);
      continue;
    }
    console.log(`[create qa] ${id} :: ${qa.question}`);
    if (!dryRun) {
      await client.create({
        endpoint: 'qas',
        contentId: id,
        content: {
          question: qa.question,
          answer: qa.answer,
          category: qa.categoryId,
          order: qa.order,
        },
      });
    }
  }

  console.log(`\n[done] ${dryRun ? '(dry-run)' : '(applied)'}`);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
