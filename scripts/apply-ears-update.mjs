/**
 * project-management-complete-guide のユーザーストーリー説明をEARS記法に書き換える
 *
 * 使い方:
 *   node scripts/apply-ears-update.mjs --dry   # プレビュー
 *   node scripts/apply-ears-update.mjs          # 実行
 */
import { createClient } from 'microcms-js-sdk';
import { readFileSync } from 'node:fs';

const envText = readFileSync('.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const dryRun = process.argv.includes('--dry');

const fixes = [
  {
    id: 'project-management-complete-guide',
    note: 'ユーザーストーリー説明 → EARS記法説明、ビジュアルマーカー差し替え、まとめ更新',
    replacements: [
      {
        from: '<li><strong>ユーザーストーリーの言語化</strong>：単なる機能のリスト（例：在庫管理機能）ではなく、「手袋をした倉庫作業員が（誰が）、作業を止めないために（なぜ）、スマートフォンで簡単に在庫数を減らしたい（何をする）」というように、現場の具体的なシナリオ（ユーザーストーリー）をセットにして伝えます。</li>',
        to: '<li><strong>EARS記法による要件の明文化</strong>：単なる機能のリスト（例：在庫管理機能）ではなく、「いつ・どんな条件で・システムは何をするのか」を統一された型で書き表すEARS記法（Easy Approach to Requirements Syntax）が有効です。条件と振る舞いを分けて記述することで要件の曖昧さを減らし、開発会社との認識のズレを防げます。常時要件・イベント駆動・状態駆動・オプション機能・異常系の5つの基本パターンを使い分けて、業務シナリオを漏れなく言語化していきます。</li>',
      },
      {
        from: '<p>{{USER_STORY_TEMPLATE}}</p><p>{{USER_STORY_EXAMPLE_WAREHOUSE}}</p>',
        to: '<p>{{EARS_PATTERNS}}</p><p>{{EARS_EXAMPLES}}</p>',
      },
      {
        from: '<li>要件定義では、単なる機能のリストではなく「誰が・何を・なぜ」行うのかというユーザーストーリーを言語化して伝える</li>',
        to: '<li>要件定義では、単なる機能のリストではなく、EARS記法（条件＋システムの振る舞い）を使って要件を曖昧さなく言語化して伝える</li>',
      },
    ],
  },
];

let totalReplacements = 0;
let totalArticles = 0;
const errors = [];

for (const fix of fixes) {
  console.log(`\n${fix.id}`);
  console.log(`  ${fix.note}`);

  const article = await client.get({
    endpoint: 'columns',
    contentId: fix.id,
    queries: { fields: 'id,content' },
  });

  let content = article.content;
  let changed = false;
  let localCount = 0;

  for (const { from, to } of fix.replacements) {
    if (!content.includes(from)) {
      const msg = `NOT FOUND in ${fix.id}: "${from.substring(0, 80)}..."`;
      console.error(`  [X] ${msg}`);
      errors.push(msg);
      continue;
    }
    content = content.replace(from, to);
    changed = true;
    localCount++;
    console.log(`  [OK] replaced #${localCount}: "${from.substring(0, 60)}..."`);
  }

  if (errors.length > 0 && !dryRun) {
    console.error('\nエラーが発生したため中断します（保存していません）');
    process.exit(1);
  }

  if (!changed) continue;

  if (dryRun) {
    console.log('  (dry run - not saved)');
  } else {
    await client.update({
      endpoint: 'columns',
      contentId: fix.id,
      content: { content },
    });
    console.log('  [SAVED] to MicroCMS');
  }

  totalArticles++;
  totalReplacements += localCount;
}

console.log(`\n====================================`);
console.log(`Summary: ${totalReplacements} replacements across ${totalArticles} articles`);
if (errors.length > 0) {
  console.log(`${errors.length} errors`);
  process.exit(1);
}
if (dryRun) {
  console.log('(dry run - nothing was saved)');
}
