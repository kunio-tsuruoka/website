/**
 * エンジニア向け記事 (Gherkin/EARS) の末尾CTAを PM on Rails へ切り替える。
 *
 * 対象記事には、過去の移行状況によって次のどちらかが存在する。
 *   1. {{BRIDGE_CTA}} マーカー
 *   2. /contact や /prooffirst へ向く旧ハードコードCTA
 *
 * どちらの場合も PM on Rails の直接CTAへ置換し、技術検索流入を
 * 受託相談ではなく PM on Rails の獲得導線として扱う。
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
import { replaceTechnicalClusterCta } from './lib/technical-cluster-cta.mjs';

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/**
 * 各記事ごとに、旧ハードコードCTAのパターンを定義。
 * {{BRIDGE_CTA}} が存在する場合は helper 側でそちらを優先して置換する。
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

console.log(`Mode: ${dryRun ? 'DRY-RUN (no API writes)' : 'APPLY (PATCH to MicroCMS)'}`);
console.log(`Targets: ${TARGETS.length} articles`);
console.log('Destination: PM on Rails (https://pmonrails.com/)');
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

  const migrated = replaceTechnicalClusterCta(content, pattern, slug);
  if (migrated.status === 'not-found') {
    console.log('   SKIP: {{BRIDGE_CTA}} / legacy CTA block not found');
    console.log('   hint: the article may already have a PM on Rails CTA or may have been edited');
    skipped.push(slug);
    continue;
  }

  if (migrated.content === content) {
    console.log('   SKIP: content unchanged after replacement');
    skipped.push(slug);
    continue;
  }

  console.log(`   found: ${migrated.status}`);
  console.log('   replacement: technical CTA -> PM on Rails');
  console.log(
    `   new content length: ${migrated.content.length} chars (delta: ${migrated.content.length - content.length})`
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
      content: { content: migrated.content },
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
