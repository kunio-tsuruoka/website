/**
 * 長尺の買い手ページに中盤の意図別相談CTA {{X_CONSULT_MID}} を挿入する (2026-06-19)
 *
 * ※ 先に column-visuals.ts の MID マーカー対応コードを本番デプロイしてから実行すること
 *    （literal 露出防止、.claude/rules/microcms.md 参照）。
 *
 *   node --env-file=.env scripts/patch-buyer-mid-cta.mjs          # dry-run
 *   node --env-file=.env scripts/patch-buyer-mid-cta.mjs --apply  # PATCH
 *
 * 挿入位置: 本文の文字数中央に最も近い <h2> の直前。
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');

// slug → 中盤に挿入する相談CTAの種別マーカー
const PAGES = {
  'system-development-cost-breakdown': 'ESTIMATE',
  'quote-comparison-checklist': 'ESTIMATE',
  'ai-development-cost-guide': 'ESTIMATE',
  'cdp-product-comparison': 'CDP',
  'how-to-write-rfp': 'RFP',
  'requirements-definition-template': 'REQ',
  'requirements-vs-requests': 'REQ',
};

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (書き込みなし)' : 'APPLY (MicroCMS PATCH)'}\n`);

let changed = 0;
const errors = [];

for (const [slug, kind] of Object.entries(PAGES)) {
  const marker = `${kind}_CONSULT_MID`;
  console.log(`--- ${slug} ({{${marker}}}) ---`);
  let cur;
  try {
    cur = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'content' },
    });
  } catch (e) {
    console.error(`  [NG] 取得失敗: ${e.message}`);
    errors.push(`${slug}: ${e.message}`);
    continue;
  }
  const content = cur.content || '';
  if (content.includes(`{{${marker}}}`)) {
    console.log('  [skip] 既に挿入済み');
    continue;
  }

  const h2s = [...content.matchAll(/<h2[^>]*>/g)].map((m) => m.index);
  if (h2s.length === 0) {
    console.error('  [NG] h2 が無く挿入位置を決められない');
    errors.push(`${slug}: no h2`);
    continue;
  }
  const mid = content.length / 2;
  const at = h2s.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a), h2s[0]);
  const pct = Math.round((at / content.length) * 100);
  const heading =
    content
      .slice(at)
      .match(/<h2[^>]*>(.*?)<\/h2>/)?.[1]
      .replace(/<[^>]+>/g, '') || '';
  const next = `${content.slice(0, at)}<p>{{${marker}}}</p>\n${content.slice(at)}`;

  console.log(`  挿入位置: ${pct}% / 直後のh2: "${heading.slice(0, 30)}"`);
  changed++;

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: slug,
        queries: { fields: 'content' },
      });
      console.log(
        `  [OK] PATCH完了 / 検証: {{${marker}}} ${ver.content?.includes(`{{${marker}}}`) ? '存在' : '★欠落'}`
      );
    } catch (e) {
      console.error(`  [NG] PATCH失敗: ${e.message}`);
      errors.push(`${slug}: ${e.message}`);
    }
  }
}

console.log(`\n${DRY_RUN ? '変更予定' : '変更'}: ${changed}件 / エラー: ${errors.length}件`);
if (errors.length) for (const e of errors) console.log(`  - ${e}`);
if (DRY_RUN) console.log('\n--apply で実行（先にコードのデプロイ完了を確認）');
