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
// title: null のときは変更しない（現行維持）
const PATCHES = [
  {
    slug: 'requirements-vs-requests',
    title: '要求定義と要件定義の違い｜混同が手戻りを招く3つの判別軸と正しい変換手順',
    description:
      '要求定義と要件定義を混同すると、開発着手後に「これじゃない」の手戻りが発生します。主語・抽象度・検証可能性の3軸で判別し、要求を要件へ変換する手順を失敗実例つきで解説。発注担当・PM必読。',
  },
  {
    slug: 'web-system-cost-by-scale',
    title: 'Webシステム開発の費用相場｜予算超過しないための規模別チェックポイント',
    description:
      '小規模300万〜大規模4,000万超。Webシステム開発費用は見積もり時の想定と実際の乖離が最大の落とし穴。体制・追加費用・運用コストまで規模別に分解し、予算超過を防ぐための判断軸を提示。',
  },
  {
    slug: 'ai-development-cost-guide',
    title: '生成AI開発の費用相場｜PoC→本番運用の内訳と見積もり比較のポイント',
    description:
      '生成AI開発はPoC50万〜本番運用1,000万超と幅が大きい。検証・試作・本番の3段階で費用構造が変わる理由と、複数社の見積もりで必ず確認すべき比較ポイントを発注担当者向けに整理。',
  },
  {
    slug: 'mvp-development-guide',
    title: 'MVP開発とは｜PoC・プロトタイプとの違い・費用相場・進め方を発注者目線で解説',
    description:
      'MVP・PoC・プロトタイプ開発の違いと使い分け、費用の目安、発注時の注意点を1記事で整理。「動くものを先に見てから判断したい」発注者に向けて、ゼロスタート開発を含む実践的な選択肢を提示。',
  },
  {
    slug: 'quote-comparison-checklist',
    title: null, // 現行タイトル維持
    description:
      'システム開発の見積書を総額だけで比較すると、安い方に飛びついて追加費用で結局高くつく。人月単価・工数根拠・保守費用など13のチェック項目で見積もりの「罠」を洗い出す方法を具体例つきで解説。',
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

  if (newTitle !== null) {
    const changed = current.title !== newTitle;
    console.log(`  title (old): ${current.title}`);
    console.log(`  title (new): ${newTitle}`);
    console.log(`  title changed: ${changed ? 'YES' : 'no (identical)'}`);
  } else {
    console.log(`  title: SKIP (keep current: ${current.title})`);
  }

  const oldDesc = current.description || '(empty)';
  console.log(`  desc  (old): ${oldDesc}`);
  console.log(`  desc  (new): ${newDesc}`);
  console.log(`  desc changed: ${oldDesc !== newDesc ? 'YES' : 'no (identical)'}`);

  // 3. PATCH 内容を組み立て（変更があるフィールドのみ）
  const content = {};
  if (newTitle !== null && current.title !== newTitle) {
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
    console.log(`  -> PATCH applied: [${Object.keys(content).join(', ')}]\n`);
    succeeded++;
  } catch (e) {
    const msg = `${slug}: PATCH failed - ${e.message}`;
    console.error(`  -> [NG] ${msg}\n`);
    errors.push(msg);
  }
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
