/**
 * 高滞在記事の本文中盤に {{CONTACT_CTA_MID}} マーカーを挿入する。
 *
 * 中盤(=本文の <h2> の中央付近) の直前に <p>{{CONTACT_CTA_MID}}</p> を差し込み、
 * Astro 側 renderColumnVisuals() が記事ごとの計測タグ付きHTMLに置換する。
 *
 * 使い方:
 *   node scripts/insert-mid-cta.mjs --dry    # プレビュー (デフォルト)
 *   node scripts/insert-mid-cta.mjs --apply  # MicroCMSに反映
 *
 * 安全装置:
 *   - dry-run デフォルト
 *   - sentinel HTMLコメントで二重挿入防止
 *   - 末尾CTAは [...slug].astro の最終セクションが担うため、ここでは挿入しない
 *
 * 対象選定: 60日 GA4 で滞在時間トップの published 記事
 */
import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const TARGETS = [
  'project-management-complete-guide',
  'project-management-01',
  'nqu29zwuq6',
  'estimate-complete-guide',
  'progress-check-points',
];

const SENTINEL = 'mid-cta-marker-v1';

/** 本文の中央付近にある <h2>（FAQ "Q1." 形式でない通常見出し）の開始位置を返す */
function findMidH2Position(html) {
  const positions = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m = re.exec(html);
  while (m !== null) {
    const inner = m[1].replace(/<[^>]+>/g, '').trim();
    // FAQ 見出し (Q1. ...) と「FAQ」「よくある質問」「関連記事」「関連ツール」は除外
    const skip = /^Q\d+\./.test(inner) || /(FAQ|よくある質問|関連記事|関連ツール)/.test(inner);
    if (!skip) {
      positions.push({ index: m.index, heading: inner });
    }
    m = re.exec(html);
  }
  if (positions.length === 0) return null;
  // 中央のh2を選ぶ
  const midIdx = Math.floor(positions.length / 2);
  return positions[midIdx];
}

console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'APPLY'}`);
console.log(`Targets: ${TARGETS.length} articles\n`);

let succeeded = 0;
let skipped = 0;
const errors = [];

for (const id of TARGETS) {
  console.log(`[${id}]`);
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: id,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    console.error(`   NG: 取得失敗: ${e.message}`);
    errors.push(`${id}: get失敗`);
    continue;
  }

  if (current.content?.includes(SENTINEL)) {
    console.log('   SKIP: 既に挿入済み (sentinel found)');
    skipped++;
    continue;
  }

  const target = findMidH2Position(current.content || '');
  if (!target) {
    console.log('   SKIP: 中央 h2 が見つからない');
    skipped++;
    continue;
  }

  // sentinel HTMLコメント + マーカー段落を挿入
  // 改行を入れる (microcms.md ルール: 1行詰めHTMLを送ると壊れる)
  const insertion = `\n<!-- ${SENTINEL} -->\n<p>{{CONTACT_CTA_MID}}</p>\n`;
  const newContent =
    current.content.slice(0, target.index) + insertion + current.content.slice(target.index);

  console.log(`   title: ${current.title}`);
  console.log(
    `   挿入位置: 中央h2「${target.heading.slice(0, 40)}」の直前 (offset ${target.index})`
  );
  console.log(`   元の長さ: ${current.content.length} → 新: ${newContent.length}`);

  if (dryRun) {
    console.log('   OK: would update (dry-run)');
    succeeded++;
    continue;
  }

  try {
    await client.update({
      endpoint: 'columns',
      contentId: id,
      content: { content: newContent },
    });
    console.log('   OK: updated');
    succeeded++;
  } catch (e) {
    console.error(`   NG: 更新失敗: ${e.message}`);
    errors.push(`${id}: ${e.message}`);
  }
}

console.log('\n========================================');
console.log(`${dryRun ? 'plan' : 'updated'}: ${succeeded}/${TARGETS.length}`);
if (skipped) console.log(`skipped: ${skipped}`);
if (errors.length) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`  - ${e}`);
}
if (dryRun) console.log('\nDry-run mode. Re-run with --apply to write to MicroCMS.');
