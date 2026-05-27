/**
 * B-zone 記事の title / description を PATCH して CTR を改善する。
 * content (本文) は一切触らない。
 *
 * 使い方:
 *   node --env-file=.env scripts/patch-title-desc.mjs          # dry-run
 *   node --env-file=.env scripts/patch-title-desc.mjs --apply  # 実際に PATCH
 */
import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// --- PATCH 対象 -----------------------------------------------------------
const PATCHES = [
  {
    slug: 'requirements-vs-requests',
    title: '要求とは？要件との違いを3軸で判別｜発注前に混同を防ぐチェックリスト',
    description:
      '要求とは「ユーザーが実現したいこと（WHY）」、要件は「システムが満たすべき条件（HOW）」。この2つを混同したまま発注すると手戻りコストが倍増する。主語・抽象度・検証可能性の3軸で判別する方法と、要求から要件への変換手順を失敗実例つきで解説。',
  },
  {
    slug: 'web-system-cost-by-scale',
    title: 'Webシステム開発の費用相場｜規模別300万〜4,000万超の内訳と予算超過を防ぐ方法',
    description:
      'Webシステム開発の費用相場を規模別に整理。小規模（LP+管理画面）100〜300万円、中規模（業務システム）500〜1,500万円、大規模（基幹連携）2,000〜4,000万円超。見積もりと実費がズレる3つの構造的原因と、発注前に確認すべきチェックポイントを掲載。',
  },
  {
    slug: 'cdp-cost-and-period',
    title: 'CDP導入費用の相場｜SaaS型 月数千円〜自社構築 数千万円、規模別に比較',
    description:
      'CDP導入費用をSaaS型（月額数千〜数万円）、パッケージ型（初期100〜500万円+月額）、自社構築型（数百万〜数千万円）の3パターンで比較。Treasure Data・Salesforce CDP・BigQuery自社開発の費用感と構築期間、3年間の総コストで見るべき理由を解説。',
  },
  {
    slug: 'ai-development-cost-guide',
    title: '生成AI開発の費用相場｜PoC 50万〜本番1,000万超、見積もり比較の5項目',
    description:
      '生成AI開発の費用をPoC（50〜200万円）、プロトタイプ（200〜500万円）、本番開発（500〜1,500万円超）の3段階で整理。受託開発の見積もり内訳がわからないまま発注すると追加費用で倍額になることも。複数社の見積もりを比較する際に確認すべき5つのポイントを掲載。',
  },
  {
    slug: 'churn-prediction-guide',
    title: 'チャーン分析とは？解約予測の仕組みと経営判断に活かす方法',
    description:
      'チャーン分析（解約予測）は既存顧客の離脱リスクをスコア化し、介入の優先順位を決める手法。予測モデルでわかること・できないことの境界線と、解約率をKPIにする際の落とし穴、PMF前後で判断軸が変わる理由を解説。',
  },
];

// --------------------------------------------------------------------------

console.log(`Mode: ${dryRun ? 'DRY-RUN (no API writes)' : 'APPLY (PATCH title/description)'}`);
console.log(`Targets: ${PATCHES.length} articles\n`);

let succeeded = 0;
const errors = [];

for (const patch of PATCHES) {
  const { slug, title: newTitle, description: newDesc } = patch;

  // 1. 現在のデータを取得
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,description' },
    });
  } catch (e) {
    const msg = `${slug}: fetch failed - ${e.message}`;
    console.error(`[NG] ${msg}`);
    errors.push(msg);
    continue;
  }

  // 2. diff 表示
  console.log(`--- ${slug} ---`);

  const titleChanged = current.title !== newTitle;
  console.log(`  title (old): ${current.title}`);
  console.log(`  title (new): ${newTitle}`);
  console.log(`  title changed: ${titleChanged ? 'YES' : 'no (identical)'}`);

  const oldDesc = current.description || '(empty)';
  console.log(`  desc  (old): ${oldDesc}`);
  console.log(`  desc  (new): ${newDesc}`);
  console.log(`  desc changed: ${oldDesc !== newDesc ? 'YES' : 'no (identical)'}`);

  // 3. PATCH 内容を組み立て（変更があるフィールドのみ）
  const content = {};
  if (current.title !== newTitle) {
    content.title = newTitle;
  }
  if ((current.description || '') !== newDesc) {
    content.description = newDesc;
  }

  if (Object.keys(content).length === 0) {
    console.log('  -> nothing to update (already identical)\n');
    succeeded++;
    continue;
  }

  if (dryRun) {
    console.log(`  -> would PATCH fields: [${Object.keys(content).join(', ')}] (dry-run)\n`);
    succeeded++;
    continue;
  }

  // 4. PATCH 実行
  try {
    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content,
    });
    console.log(`  -> PATCH applied: [${Object.keys(content).join(', ')}]`);
  } catch (e) {
    const msg = `${slug}: PATCH failed - ${e.message}`;
    console.error(`  -> [NG] ${msg}\n`);
    errors.push(msg);
    continue;
  }

  // 5. 検証: re-read して title/description が反映されたか確認
  try {
    const verified = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,description' },
    });
    const titleOk = verified.title === newTitle;
    const descOk = verified.description === newDesc;
    console.log(`  -> verify title: ${titleOk ? 'OK' : 'MISMATCH (got: ' + verified.title + ')'}`);
    console.log(`  -> verify desc:  ${descOk ? 'OK' : 'MISMATCH'}`);
    if (titleOk && descOk) {
      succeeded++;
    } else {
      errors.push(`${slug}: verification mismatch`);
    }
  } catch (e) {
    console.error(`  -> verify GET failed: ${e.message}`);
    errors.push(`${slug}: verify failed - ${e.message}`);
  }
  console.log('');
}

console.log('========================================');
console.log(`${dryRun ? 'plan' : 'patched'}: ${succeeded}/${PATCHES.length}`);
if (errors.length > 0) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
  process.exit(1);
}
if (dryRun) {
  console.log('\nThis was a dry run. Re-run with --apply to actually PATCH.');
}
