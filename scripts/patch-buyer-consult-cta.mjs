/**
 * 買い手意図ページに意図別相談CTAマーカーを挿入する (2026-06-19)
 *
 * AI Citations 分析で「AIが見積・RFP・CDP比較の発注者を送り込んでいる」と判明した
 * ページに、意図別の相談CTA（{{ESTIMATE_CONSULT}} 等、column-visuals.ts で定義）を入れる。
 *
 *   node --env-file=.env scripts/patch-buyer-consult-cta.mjs          # dry-run
 *   node --env-file=.env scripts/patch-buyer-consult-cta.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');

const PATCHES = [
  { slug: 'system-development-cost-breakdown', action: 'append', marker: 'ESTIMATE_CONSULT' },
  { slug: 'quote-comparison-checklist', action: 'append', marker: 'ESTIMATE_CONSULT' },
  {
    slug: 'ai-development-cost-guide',
    action: 'replace',
    from: 'CONTACT_CTA',
    to: 'ESTIMATE_CONSULT',
  },
  // 末尾のベタ書き汎用CTA（h3「Beekleにご相談ください」＋段落＋/contactリンク）を CDP特化に置換
  {
    slug: 'cdp-product-comparison',
    action: 'replaceTail',
    re: /<h3[^>]*>Beekleにご相談ください<\/h3>[\s\S]*$/,
    to: 'CDP_CONSULT',
  },
  { slug: 'how-to-write-rfp', action: 'replace', from: 'CONTACT_CTA', to: 'RFP_CONSULT' },
  { slug: 'requirements-definition-template', action: 'append', marker: 'REQ_CONSULT' },
  { slug: 'requirements-vs-requests', action: 'append', marker: 'REQ_CONSULT' },
];

const has = (content, marker) => content.includes(`{{${marker}}}`);

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (書き込みなし)' : 'APPLY (MicroCMS PATCH)'}\n`);

let changed = 0;
const errors = [];

for (const p of PATCHES) {
  console.log(`--- ${p.slug} (${p.action}: ${p.marker || `${p.from}→${p.to}`}) ---`);
  let cur;
  try {
    cur = await client.get({
      endpoint: 'columns',
      contentId: p.slug,
      queries: { fields: 'content' },
    });
  } catch (e) {
    console.error(`  [NG] 取得失敗: ${e.message}`);
    errors.push(`${p.slug}: ${e.message}`);
    continue;
  }
  const content = cur.content || '';
  let next = content;

  if (p.action === 'append') {
    if (has(content, p.marker)) {
      console.log('  [skip] 既に挿入済み');
      continue;
    }
    next = `${content.trimEnd()}\n<p>{{${p.marker}}}</p>\n`;
  } else if (p.action === 'replaceTail') {
    if (has(content, p.to)) {
      console.log('  [skip] 既に置換済み');
      continue;
    }
    if (!p.re.test(content)) {
      console.error('  [NG] 置換対象の末尾ブロックが見つからない（手動確認が必要）');
      errors.push(`${p.slug}: replaceTail target not found`);
      continue;
    }
    next = `${content.replace(p.re, '').trimEnd()}\n<p>{{${p.to}}}</p>\n`;
  } else if (p.action === 'replace') {
    if (has(content, p.to)) {
      console.log('  [skip] 既に置換済み');
      continue;
    }
    if (!has(content, p.from)) {
      console.log(`  [warn] 置換元 {{${p.from}}} が見つからないため末尾に追記`);
      next = `${content.trimEnd()}\n<p>{{${p.to}}}</p>\n`;
    } else {
      // 末尾(final)の {{CONTACT_CTA}} のみ置換。MID 等は触らない（厳密一致）
      next = content.replace(`<p>{{${p.from}}}</p>`, `<p>{{${p.to}}}</p>`);
      if (next === content) next = content.replace(`{{${p.from}}}`, `{{${p.to}}}`);
    }
  }

  if (next === content) {
    console.log('  [skip] 変更なし');
    continue;
  }
  console.log(`  挿入後 末尾120字: ...${next.slice(-120).replace(/\n/g, '⏎')}`);
  changed++;

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: p.slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: p.slug,
        queries: { fields: 'content' },
      });
      const target = p.action === 'replace' ? p.to : p.marker;
      console.log(
        `  [OK] PATCH完了 / 検証: {{${target}}} ${has(ver.content || '', target) ? '存在' : '★欠落'}`
      );
    } catch (e) {
      console.error(`  [NG] PATCH失敗: ${e.message}`);
      errors.push(`${p.slug}: ${e.message}`);
    }
  }
}

console.log(`\n${DRY_RUN ? '変更予定' : '変更'}: ${changed}件 / エラー: ${errors.length}件`);
if (errors.length) for (const e of errors) console.log(`  - ${e}`);
if (DRY_RUN) console.log('\n--apply で実行');
