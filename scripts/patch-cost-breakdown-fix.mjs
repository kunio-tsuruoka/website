// scripts/patch-cost-breakdown-fix.mjs
// system-development-cost-breakdown の費用分類を修正する。
// インフラ初期費用・ライセンス費は「間接費」ではなく「直接経費（実費）」が正しい。
//   node --env-file=.env scripts/patch-cost-breakdown-fix.mjs          # dry-run
//   node --env-file=.env scripts/patch-cost-breakdown-fix.mjs --apply  # PATCH送信
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SLUG = 'system-development-cost-breakdown';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const REPLACEMENTS = [
  [
    '<p>システム開発の費用は、大きく「直接費」と「間接費」に分けられます。</p><p>直接費（プロジェクトに直接かかる費用）</p><p>要件定義・設計・実装・テスト・リリースなど、プロジェクト遂行に直接必要な人件費と外注費。一般に総額の 70〜85% を占める。</p><p>間接費（プロジェクトを支える費用）</p><p>プロジェクト管理（PM工数）・品質保証・インフラ初期費用・ライセンス費・予備費など。総額の 15〜30%。</p><p>「総額しか見ていない」と、間接費の中に大きな差異が隠れていることに気づけません。</p>',
    '<p>システム開発の費用は、大きく「直接費」と「間接費」に分けられます。さらに直接費は、人件費である「直接労務費」と、外部から購入する「直接経費（実費）」に分かれます。</p><p><strong>直接費（プロジェクトに直接かかる費用）</strong></p><p>要件定義・設計・実装・テストなどに必要な人件費・外注費（直接労務費）と、インフラ・ライセンス・外部APIなどプロジェクト専用に調達する実費（直接経費）。人件費が中心の案件では総額の 70〜85% を占める。</p><p><strong>間接費（プロジェクト全体を支える費用）</strong></p><p>プロジェクト管理（PM工数）・品質保証・一般管理費・予備費など、特定の作業に直接ひもづかない費用。総額の 15〜30%。</p><p>インフラ初期費用やライセンス費は本来「実費（パススルー）」で、PM工数や品質保証とは性質が異なります。クラウドやライセンスが重い案件では実費の比率が上がり、上記の比率は前後します。「総額しか見ていない」と、こうした内訳の差に気づけません。</p>',
  ],
  [
    '<h2 id="he012f39665">要注意: 見落としやすい間接費</h2>',
    '<h2 id="he012f39665">要注意: 見落としやすい実費・予備費</h2>',
  ],
];

async function main() {
  const col = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'id,title,content' },
  });
  if (col.id !== SLUG) throw new Error(`ID mismatch: ${col.id}`);
  console.log(`TITLE: ${col.title}`);

  let content = col.content;
  let missing = 0;
  for (const [oldStr, newStr] of REPLACEMENTS) {
    if (!content.includes(oldStr)) {
      console.log(`  MISS  ${oldStr.slice(0, 50)}...`);
      missing++;
      continue;
    }
    content = content.split(oldStr).join(newStr);
    console.log(`  OK    ${oldStr.slice(0, 40)}...`);
  }
  console.log(`\n  missing: ${missing} / content ${col.content.length} -> ${content.length}`);
  if (missing > 0) {
    console.log('  STOP: 未置換あり（PATCHしない）');
    return;
  }
  if (!APPLY) {
    console.log('  DRY-RUN: --apply で送信');
    return;
  }
  await client.update({ endpoint: 'columns', contentId: SLUG, content: { content } });
  const v = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'content' },
  });
  const ok = v.content.includes('直接経費（実費）') && !v.content.includes('見落としやすい間接費');
  console.log(`  PATCH OK / verify = ${ok}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
