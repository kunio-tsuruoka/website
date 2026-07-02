/**
 * 生成AI導入カテゴリ (genai-adoption) の新設と記事移動。
 *
 * 1. categories に genai-adoption（生成AI導入, order 3 = /column 先頭）を作成
 * 2. 導入テーマの記事（完全ガイド＋ペルソナ記事＋導入課題系）を ai-development から移動
 *
 * 対象の線引き（content.md のカテゴリ精査基準の応用）:
 * - genai-adoption = 導入を進める側の課題・進め方（何から始める/ROI/セキュリティ/組織/経営説得/PoC本番化）
 * - ai-development に残す = 発注ノウハウ・技術の発注者向け解説（ベンダー選定/費用/契約/エージェント/KG/LLM選定）
 *
 * 使い方:
 *   node --env-file=.env scripts/patch-genai-adoption-category.mjs          # dry-run
 *   node --env-file=.env scripts/patch-genai-adoption-category.mjs --apply
 *
 * 前提: コード側 (PR #75) が本番デプロイ済みであること（コード先→CMS後）。
 */
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const CATEGORY = {
  id: 'genai-adoption',
  title: '生成AI導入',
  description:
    '生成AIを業務に導入したい担当者・情シス・経営層向け。何から始めるか、費用対効果、セキュリティ、PoCから本番化まで、導入の進め方を判断材料つきで解説します。',
  order: 3,
};

// 導入テーマ（進め方・社内課題）の記事。ai-development から移動する。
const MOVE_IDS = [
  'genai-introduction-complete-guide',
  'genai-roi-investment',
  'genai-inquiry-automation',
  'genai-security-governance',
  'genai-system-infrastructure',
  'ai-introduction-kpi-redesign',
  'it-admin-ai-first-week',
  'ai-project-stalled-agile',
  'ai-organization-constraints',
  'ai-legacy-system-constraints',
  'ai-executive-understanding',
  'ai-cost-zero-start',
  'ai-roi-measurement-difficulty',
  'ai-training-data-quality',
  'ai-security-privacy-guide',
  'ai-data-foundation-not-ready',
  'ai-poc-to-production',
  'internal-ai-assistant-rag-patterns',
  'ai-guideline-template',
];

async function main() {
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);

  // 1. カテゴリ作成（存在チェック）
  let categoryExists = false;
  try {
    await client.get({ endpoint: 'categories', contentId: CATEGORY.id, queries: { fields: 'id' } });
    categoryExists = true;
  } catch (_) {
    categoryExists = false;
  }
  if (categoryExists) {
    console.log(`[SKIP] category ${CATEGORY.id} already exists`);
  } else if (apply) {
    await client.create({
      endpoint: 'categories',
      contentId: CATEGORY.id,
      content: { title: CATEGORY.title, description: CATEGORY.description, order: CATEGORY.order },
    });
    console.log(`[OK] created category ${CATEGORY.id} (order ${CATEGORY.order})`);
  } else {
    console.log(
      `[PLAN] create category ${CATEGORY.id} "${CATEGORY.title}" order=${CATEGORY.order}`
    );
  }

  // 2. 記事移動
  let moved = 0;
  let skipped = 0;
  const errors = [];
  for (const id of MOVE_IDS) {
    try {
      const a = await client.get({
        endpoint: 'columns',
        contentId: id,
        queries: { fields: 'id,title,category.id' },
      });
      if (a.category?.id === CATEGORY.id) {
        console.log(`[SKIP] ${id} already in ${CATEGORY.id}`);
        skipped++;
        continue;
      }
      if (apply) {
        await client.update({
          endpoint: 'columns',
          contentId: id,
          content: { category: CATEGORY.id },
        });
        console.log(`[OK] ${id}: ${a.category?.id} -> ${CATEGORY.id}`);
      } else {
        console.log(`[PLAN] ${id}: ${a.category?.id} -> ${CATEGORY.id} | ${a.title.slice(0, 40)}`);
      }
      moved++;
    } catch (e) {
      console.error(`[NG] ${id}: ${e.message}`);
      errors.push(id);
    }
  }

  console.log('----------------------------------------');
  console.log(
    `${apply ? 'moved' : 'planned'}: ${moved}, skipped: ${skipped}, errors: ${errors.length}`
  );
  if (!apply) console.log('Re-run with --apply to execute.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
