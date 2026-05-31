// 監修E（不可逆）: slug改名 + 重複301統合 + 02-06削除。
// すべてユーザー承認済み（AskUserQuestion 2026-05-31）。_redirects に301は追加済み。
//   --apply で本番実行。既定は dry-run（何をするか表示のみ）。
//   --create : oae→failure-prevention-for-clients の再作成のみ
//   --delete : 旧コンテンツの削除のみ（project-management-01 / project-management-steps / 7hhc1tib7dft / oae_of8l_ij）

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const DO_CREATE = process.argv.includes('--create');
const DO_DELETE = process.argv.includes('--delete');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const NEW_SLUG = 'failure-prevention-for-clients';
const OLD_SLUG = 'oae_of8l_ij';
const DELETE_SLUGS = [
  'project-management-01',
  'project-management-steps',
  '7hhc1tib7dft',
  OLD_SLUG,
];

// 0073: <h2 ...>N. 見出し</h2> の番号prefix除去
function strip0073(html) {
  return html.replace(/(<h2[^>]*>)\s*[0-9０-９]+\.\s*/g, '$1');
}

async function create() {
  // 既に存在すれば skip（冪等）
  try {
    await client.get({ endpoint: 'columns', contentId: NEW_SLUG, queries: { fields: 'id' } });
    console.log(`[create] ${NEW_SLUG} は既に存在 → skip`);
    return;
  } catch {
    /* 未存在 = 作成する */
  }
  const src = await client.get({ endpoint: 'columns', contentId: OLD_SLUG });
  const body = {
    title: src.title,
    content: strip0073(src.content),
    category: src.category.id,
    description: src.description,
  };
  console.log(`[create] ${NEW_SLUG} を作成 (title: ${body.title}, category: ${body.category})`);
  console.log(
    `  h2番号prefix: ${(src.content.match(/<h2[^>]*>\s*[0-9]+\. /g) || []).length} → ${(body.content.match(/<h2[^>]*>\s*[0-9]+\. /g) || []).length}`
  );
  if (!APPLY) {
    console.log('  [dry-run]');
    return;
  }
  await client.create({ endpoint: 'columns', contentId: NEW_SLUG, content: body });
  const chk = await client.get({
    endpoint: 'columns',
    contentId: NEW_SLUG,
    queries: { fields: 'id,title' },
  });
  console.log(`  ✅ 作成OK: ${chk.id}`);
}

async function del() {
  for (const slug of DELETE_SLUGS) {
    let exists = true;
    try {
      await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'id' } });
    } catch {
      exists = false;
    }
    if (!exists) {
      console.log(`[delete] ${slug} は存在しない → skip`);
      continue;
    }
    // oae は新slug作成後のみ削除する安全ガード
    if (slug === OLD_SLUG) {
      try {
        await client.get({ endpoint: 'columns', contentId: NEW_SLUG, queries: { fields: 'id' } });
      } catch {
        console.log(`[delete] ${OLD_SLUG} の削除は ${NEW_SLUG} 作成後のみ → skip`);
        continue;
      }
    }
    console.log(`[delete] ${slug} を削除${APPLY ? '' : '（dry-run）'}`);
    if (APPLY) {
      await client.delete({ endpoint: 'columns', contentId: slug });
      console.log('  ✅ 削除OK');
    }
  }
}

(async () => {
  console.log(APPLY ? '【本番実行】' : '【dry-run】');
  if (DO_CREATE || (!DO_CREATE && !DO_DELETE)) await create();
  if (DO_DELETE || (!DO_CREATE && !DO_DELETE)) await del();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
