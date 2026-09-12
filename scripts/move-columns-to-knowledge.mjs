/**
 * 仕様・要件定義ノウハウ／技術論の記事を knowledge カテゴリへ移す。
 *
 * 判定（2026-09-12、全146記事を「技術語:発注者語」比率＋GSC＋AI引用で機械判定）:
 *   読者がエンジニア／テックリードで、発注者フレーム（発注前に・発注者視点・情シス）を持たない記事だけ。
 *   要件定義の主力（complete-guide / vs-requests / process / template / how-to-write-rfp）は
 *   発注者向けで買い手リードの源泉なので動かさない。
 *
 * 移動の副作用: URL は /column と /knowledge の両方で 200 のまま。canonical だけ /knowledge 側になる。
 * 記事末CTAは column-cta-mapping.ts の SLUG_CTA（仕様クラスタ）または knowledge 既定に従う。
 * 監修者は src/data/authors.ts の slugReviewerMap を先に更新しておく（knowledge 既定は佐藤）。
 *
 * 使い方:
 *   node --env-file=.env scripts/move-columns-to-knowledge.mjs          # dry-run（既定）
 *   node --env-file=.env scripts/move-columns-to-knowledge.mjs --apply
 */
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const TARGETS = [
  // 仕様・要件定義ノウハウ（記事末CTA = PM on Rails）
  'ai-agent-gherkin-evidence',
  'user-story-template-examples',
  // 技術論（記事末CTA = knowledge 既定の相談＋協業）
  'ai-agent-capability-upgrade',
  'emotion-commonsense-kg-customer-support',
];

console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}\n`);
const errors = [];

for (const slug of TARGETS) {
  let cur;
  try {
    cur = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,category' },
    });
  } catch (e) {
    errors.push(`${slug}: 取得失敗 ${e.message}`);
    continue;
  }
  const from = cur.category?.id;
  if (from === 'knowledge') {
    console.log(`[${slug}] 既に knowledge — スキップ`);
    continue;
  }
  console.log(`[${slug}] ${from} → knowledge  (${cur.title.slice(0, 40)})`);
  if (!apply) continue;
  try {
    // category は単数の文字列で送る（配列だと 400。.claude/rules/microcms.md）
    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content: { category: 'knowledge' },
    });
    const after = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'category' },
    });
    if (after.category?.id !== 'knowledge') {
      errors.push(`${slug}: PATCH 後も ${after.category?.id}（公開ステータスを疑う）`);
    } else {
      console.log('   PATCH OK（再取得で確認）');
    }
  } catch (e) {
    errors.push(`${slug}: PATCH失敗 ${e.message}`);
  }
}

if (errors.length) {
  console.log('\n--- 要確認 ---');
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log(apply ? '\n完了' : '\ndry-run 完了（--apply で反映）');
