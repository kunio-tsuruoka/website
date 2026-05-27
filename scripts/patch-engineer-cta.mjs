/**
 * エンジニア向け記事 (Gherkin/EARS) の末尾ハードコードCTAを
 * {{BRIDGE_CTA}} マーカーに差し替える。
 *
 * これらの記事は {{CONTACT_CTA}} マーカーではなく、直書きの
 * <h2>...CTA見出し...</h2><p>...誘導文...</p><p><a href="/contact">...</a>...</p>
 * パターンで CTA を持っている。このスクリプトはそのブロックを検出し
 * {{BRIDGE_CTA}} に置き換える。
 *
 * 対象記事:
 *   - gherkin-bdd-introduction
 *   - ears-requirements-syntax-guide
 *   - ears-gherkin-workflow
 *
 * 使い方:
 *   node --env-file=.env scripts/patch-engineer-cta.mjs          # dry-run
 *   node --env-file=.env scripts/patch-engineer-cta.mjs --apply  # 実際に PATCH
 */
import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/**
 * 各記事ごとに、置換対象のCTAブロックを正規表現で定義。
 * 関連記事セクションは残し、CTAの h2 + 本文 + リンク段落だけを差し替える。
 */
const TARGETS = [
  {
    slug: 'gherkin-bdd-introduction',
    // <h2 id="h794b7c1204">BDDで現場と開発を一直線にしたい方へ</h2>
    // <p>Beekleでは...支援しています。</p>
    // <p><a href="/contact">無料相談を予約する</a> / <a href="/prooffirst">ゼロスタートを詳しく見る</a></p>
    pattern:
      /<h2 id="h794b7c1204">BDD[^<]*<\/h2><p>Beekle[^<]*<\/p><p><a href="\/contact">[^<]*<\/a>[^<]*<a href="\/prooffirst">[^<]*<\/a><\/p>/,
  },
  {
    slug: 'ears-requirements-syntax-guide',
    // <h2 id="h340c799757">要件記述でお困りなら</h2>
    // <p>複雑な業務要件をEARSで整理する支援も行っています。</p>
    // <p><a href="/contact">無料相談を予約する</a> / <a href="/tools/story-builder">Story Builder を試す</a></p>
    pattern:
      /<h2 id="h340c799757">要件記述[^<]*<\/h2><p>[^<]*支援も行っています。<\/p><p><a href="\/contact">[^<]*<\/a>[^<]*<a href="\/tools\/story-builder">[^<]*<\/a><\/p>/,
  },
  {
    slug: 'ears-gherkin-workflow',
    // <h2 id="ha784afc1b2">このワークフローを試してみたい方へ</h2>
    // <p><a href="/contact">無料相談を予約する</a> / <a href="/prooffirst">ゼロスタートを詳しく見る</a></p>
    pattern:
      /<h2 id="ha784afc1b2">この[^<]*<\/h2><p><a href="\/contact">[^<]*<\/a>[^<]*<a href="\/prooffirst">[^<]*<\/a><\/p>/,
  },
];

const BRIDGE_MARKER = '{{BRIDGE_CTA}}';

console.log(`Mode: ${dryRun ? 'DRY-RUN (no API writes)' : 'APPLY (PATCH to MicroCMS)'}`);
console.log(`Targets: ${TARGETS.length} articles`);
console.log('---');

let succeeded = 0;
const errors = [];
const skipped = [];

for (const { slug, pattern } of TARGETS) {
  console.log(`\n[${slug}]`);

  let article;
  try {
    article = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    const msg = `${slug}: fetch failed - ${e.message}`;
    console.error(`   NG: ${msg}`);
    errors.push(msg);
    continue;
  }

  console.log(`   title: ${article.title}`);
  const content = article.content || '';
  console.log(`   content length: ${content.length} chars`);

  // Check if already has bridge marker
  const hasBridgeCta = /\{\{BRIDGE_CTA\}\}/.test(content);
  if (hasBridgeCta) {
    console.log('   SKIP: already has {{BRIDGE_CTA}}');
    skipped.push(slug);
    continue;
  }

  // Find hardcoded CTA block
  const match = content.match(pattern);
  if (!match) {
    console.log('   SKIP: hardcoded CTA block not found (pattern mismatch)');
    console.log('   hint: the article may have been edited since this script was written');
    skipped.push(slug);
    continue;
  }

  console.log(`   found CTA block (${match[0].length} chars):`);
  const preview = match[0].length > 120 ? `${match[0].slice(0, 120)}...` : match[0];
  console.log(`     ${preview}`);

  const newContent = content.replace(pattern, BRIDGE_MARKER);

  if (newContent === content) {
    console.log('   SKIP: content unchanged after replacement');
    skipped.push(slug);
    continue;
  }

  console.log('   replacement: hardcoded CTA -> {{BRIDGE_CTA}}');
  console.log(
    `   new content length: ${newContent.length} chars (delta: ${newContent.length - content.length})`
  );

  if (dryRun) {
    console.log('   OK: would PATCH (dry-run)');
    succeeded++;
    continue;
  }

  try {
    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content: { content: newContent },
    });
    console.log('   OK: PATCH applied');
    succeeded++;
  } catch (e) {
    const msg = `${slug}: ${e.message}`;
    console.error(`   NG: ${msg}`);
    errors.push(msg);
  }
}

console.log('\n========================================');
console.log(`${dryRun ? 'plan' : 'patched'}: ${succeeded}/${TARGETS.length}`);
if (skipped.length > 0) {
  console.log(`skipped: ${skipped.length} (${skipped.join(', ')})`);
}
if (errors.length > 0) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
  process.exit(1);
}
if (dryRun) {
  console.log('\nThis was a dry run. Re-run with --apply to actually PATCH.');
}
