/**
 * PoC意図ページの末尾CTAを「0円でPoC/MVPを試す」相談CTAに最適化する (2026-07-01)
 *
 * 背景: GSC実測で、生成AI PoC系クエリ（生成ai poc 費用 pos1.36 / poc mvp / ai poc 進め方 等）の
 * インプレッションは下記ページに来ているが、末尾CTAが汎用の {{CONTACT_CTA}}（「ご相談ください」）で
 * PoC意図に最適化されていない。PoC希望者向けの {{ZERO_START_CONSULT_CTA}}（0円でPoC/MVPを試す→
 * /contact?intent=zero-start、計測タグ付き）に差し替え、PoC問い合わせの転換と計測を改善する。
 *
 * ZERO_START_CONSULT_CTA は既存マーカー（column-visuals.ts に定義済み・本番デプロイ済み）。
 * 新マーカーではないので順序制約なし。--apply 即実行可。
 *
 *   node --env-file=.env scripts/patch-poc-zerostart-cta.mjs          # dry-run
 *   node --env-file=.env scripts/patch-poc-zerostart-cta.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');
const TO = 'ZERO_START_CONSULT_CTA';

// PoC意図がドミナントで、PoCクエリの実インプレッションがあるページ。
// action: 'replace' = 末尾 {{CONTACT_CTA}} を差し替え / 'append' = マーカー無しページに追記
const PATCHES = [
  { slug: 'poc-boundary-line', action: 'replace', from: 'CONTACT_CTA' }, // 70imp pos7 PoC意図ど真ん中
  { slug: 'ai-poc-to-production', action: 'replace', from: 'CONTACT_CTA' }, // 50imp pos6.8 PoC→本番
  { slug: 'mvp-development-guide', action: 'replace', from: 'CONTACT_CTA' }, // 436imp 最大入口
  { slug: 'ai-era-development-flow', action: 'append' }, // 生成ai poc/ai poc 進め方の受け皿(CTAマーカー無し)
];

const has = (content, marker) => content.includes(`{{${marker}}}`);

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (書き込みなし)' : 'APPLY (MicroCMS PATCH)'}\n`);

let changed = 0;
const errors = [];

for (const p of PATCHES) {
  console.log(`--- ${p.slug} (${p.action}${p.from ? `: ${p.from}→${TO}` : `: ${TO}`}) ---`);
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
  if (has(content, TO)) {
    console.log('  [skip] 既に挿入済み');
    continue;
  }

  let next = content;
  if (p.action === 'replace') {
    if (!has(content, p.from)) {
      console.log(`  [warn] 置換元 {{${p.from}}} が無いため末尾に追記`);
      next = `${content.trimEnd()}\n<p>{{${TO}}}</p>\n`;
    } else {
      next = content.replace(`{{${p.from}}}`, `{{${TO}}}`);
    }
  } else {
    next = `${content.trimEnd()}\n<p>{{${TO}}}</p>\n`;
  }

  if (next === content) {
    console.log('  [skip] 変更なし');
    continue;
  }
  console.log(`  挿入後 末尾110字: ...${next.slice(-110).replace(/\n/g, '⏎')}`);
  changed++;

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: p.slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: p.slug,
        queries: { fields: 'content' },
      });
      console.log(
        `  [OK] PATCH完了 / 検証: {{${TO}}} ${has(ver.content || '', TO) ? '存在' : '★欠落'}`
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
