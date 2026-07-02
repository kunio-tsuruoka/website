/**
 * 受託クラスタ順位改善: 上位コラム3本 → 新記事(生成AI受託失敗パターン) + /services/ai-development
 * への内部リンクを追加する (2026-07-01)
 *
 * GSC分析で「ai 受託開発」248imp はコラム(ai-era-development-flow等)が page1-2 / サービスページ
 * (/services/ai-development)が page4-6 に分裂。上位コラムから記述的アンカーで送客し、サービスページと
 * 新記事のトピック関連性・オーソリティを補強する。既存マーカーやHTMLはいじらず追記のみ。
 *
 *   node --env-file=.env scripts/patch-jutaku-internal-links.mjs          # dry-run
 *   node --env-file=.env scripts/patch-jutaku-internal-links.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');
const NEW = 'ai-contract-development-failures';

// 関連リストへ差し込む2リンク（li）
const LI_NEW = `<li><a href="/column/${NEW}">生成AI受託開発で失敗する5パターンと正しい進め方</a></li>`;
const LI_SVC = `<li><a href="/services/ai-development">生成AI受託開発サービス（Beekle）</a></li>`;
// 関連セクションが無いページのCTA直前に入れる段落
const P_RELATED = `<p>あわせて読みたい：<a href="/column/${NEW}">生成AI受託開発で失敗する5パターン</a> ／ <a href="/services/ai-development">生成AI受託開発サービス</a></p>`;

const PATCHES = [
  {
    slug: 'ai-era-development-flow',
    kind: 'listInsert',
    anchor: '関連記事 / 関連ツール</h2><ul>',
    insert: `${LI_NEW}${LI_SVC}`,
  },
  {
    slug: 'ai-development-cost-guide',
    kind: 'beforeMarker',
    marker: '<p>{{ESTIMATE_CONSULT}}</p>',
    insert: `${P_RELATED}\n`,
  },
  {
    slug: 'ai-development-vendor-selection',
    kind: 'beforeMarker',
    marker: '<p>{{CONTACT_CTA}}</p>',
    insert: `${P_RELATED}\n`,
  },
];

console.log(`モード: ${DRY_RUN ? 'DRY-RUN' : 'APPLY (PATCH)'}\n`);
let changed = 0;
const errors = [];

for (const p of PATCHES) {
  console.log(`--- ${p.slug} (${p.kind}) ---`);
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
  if (content.includes(`/column/${NEW}`)) {
    console.log('  [skip] 既に新記事リンクあり');
    continue;
  }

  let next = content;
  if (p.kind === 'listInsert') {
    if (!content.includes(p.anchor)) {
      console.error('  [NG] 関連リストのアンカーが見つからない');
      errors.push(`${p.slug}: anchor not found`);
      continue;
    }
    next = content.replace(p.anchor, `${p.anchor}${p.insert}`);
  } else if (p.kind === 'beforeMarker') {
    if (!content.includes(p.marker)) {
      console.error(`  [NG] マーカー ${p.marker} が見つからない`);
      errors.push(`${p.slug}: marker not found`);
      continue;
    }
    next = content.replace(p.marker, `${p.insert}${p.marker}`);
  }

  if (next === content) {
    console.log('  [skip] 変更なし');
    continue;
  }
  changed++;
  const at = next.indexOf(`/column/${NEW}`);
  console.log(`  挿入付近: ...${next.slice(Math.max(0, at - 40), at + 90).replace(/\n/g, '⏎')}...`);

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: p.slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: p.slug,
        queries: { fields: 'content' },
      });
      const ok =
        (ver.content || '').includes(`/column/${NEW}`) &&
        (ver.content || '').includes('/services/ai-development');
      console.log(`  [OK] PATCH完了 / 検証: 新記事+サービスリンク ${ok ? '存在' : '★欠落'}`);
    } catch (e) {
      console.error(`  [NG] PATCH失敗: ${e.message}`);
      errors.push(`${p.slug}: ${e.message}`);
    }
  }
}

console.log(`\n${DRY_RUN ? '変更予定' : '変更'}: ${changed}件 / エラー: ${errors.length}件`);
if (errors.length) for (const e of errors) console.log(`  - ${e}`);
if (DRY_RUN) console.log('\n--apply で実行');
