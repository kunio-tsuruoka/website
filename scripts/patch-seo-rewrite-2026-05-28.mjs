/**
 * SEO title/desc + content PATCH (2026-05-28)
 *
 * node --env-file=.env scripts/patch-seo-rewrite-2026-05-28.mjs          # dry-run
 * node --env-file=.env scripts/patch-seo-rewrite-2026-05-28.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');

const BUDGET_SCHEDULE_SECTION = `
<h2 id="budget-schedule">要件定義の予算・スケジュールとシステム開発全体の工程</h2>
<p>要件定義は、システム開発プロジェクト全体の工程のうち最上流に位置します。予算配分の目安として、開発費全体の <strong>10〜20%</strong> を要件定義に割り当てるのが一般的です。たとえば開発費1,000万円のプロジェクトなら、要件定義に100〜200万円を見込みます。</p>
<p>スケジュール面では、中規模案件（1,000〜3,000万円）で <strong>1〜2ヶ月</strong> が標準的な要件定義期間です。この期間を短縮しすぎると、後の設計・実装・テスト工程で手戻りが発生し、結局スケジュール全体が伸びます。</p>
<p>予算を理由に要件定義を省略・短縮するケースがありますが、IPA（情報処理推進機構）の統計でも <strong>要件定義の不備がシステム開発失敗の最大要因</strong> とされています。「予算が限られているからこそ、要件定義で無駄な機能を削る」という発想の方が、結果的にプロジェクトを守ります。</p>
<p>システム開発の予算感については <a href="/column/ai-development-cost-guide">生成AI時代の開発費用ガイド</a> も参考にしてください。</p>
<hr>
`.trim();

const PATCHES = [
  {
    slug: 'requirements-definition-process',
    title: '要件定義の進め方がわからない？発注側が押さえる5フェーズと実例',
    description:
      '要件定義の進め方を5フェーズに分解し、各段階の会話例とアウトプット例を掲載。発注側の現場担当者が「次に何をすべきか」判断できる実践手順書。',
    contentTransform(content) {
      const marker = '<h2 id="h9e9d8acad9">まとめ';
      if (!content.includes(marker)) {
        throw new Error(`挿入マーカー "${marker}" が本文中に見つかりません`);
      }
      return content.replace(marker, `${BUDGET_SCHEDULE_SECTION}\n${marker}`);
    },
  },
  {
    slug: 'requirements-definition-complete-guide',
    title: '要件定義書の書き方と実例｜発注側が使えるテンプレート付き',
    description:
      '要件定義書に何をどう書くか、EARS記法やMoSCoW法など実務テクニックをテンプレート付きで紹介。初めての発注でも成果物の質を落とさない。',
    contentTransform: null,
  },
];

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (API書き込みなし)' : 'APPLY (MicroCMS PATCH実行)'}`);
console.log(`対象: ${PATCHES.length} 記事\n`);

let succeeded = 0;
const errors = [];

for (const patch of PATCHES) {
  const { slug, title: newTitle, description: newDesc, contentTransform } = patch;
  console.log(`--- ${slug} ---`);

  let current;
  try {
    current = await client.get({ endpoint: 'columns', contentId: slug });
  } catch (e) {
    const msg = `${slug}: 取得失敗 - ${e.message}`;
    console.error(`  [NG] ${msg}`);
    errors.push(msg);
    continue;
  }

  console.log(`  title (現在): ${current.title}`);
  console.log(`  title (変更後): ${newTitle}`);
  console.log(`  title 変更: ${current.title !== newTitle ? 'YES' : 'なし (同一)'}`);
  console.log(`  desc  (現在): ${current.description || '(空)'}`);
  console.log(`  desc  (変更後): ${newDesc}`);
  console.log(`  desc  変更: ${(current.description || '') !== newDesc ? 'YES' : 'なし (同一)'}`);

  const updatePayload = {};
  if (current.title !== newTitle) updatePayload.title = newTitle;
  if ((current.description || '') !== newDesc) updatePayload.description = newDesc;

  let newContent = null;
  if (contentTransform) {
    try {
      newContent = contentTransform(current.content);
      updatePayload.content = newContent;
      const oldLen = current.content.length;
      const newLen = newContent.length;
      console.log(`  content 変更: YES (${oldLen} -> ${newLen} bytes, +${newLen - oldLen})`);
      console.log(
        `  挿入セクション h2#budget-schedule 確認: ${newContent.includes('id="budget-schedule"') ? 'OK' : 'NG'}`
      );
    } catch (e) {
      const msg = `${slug}: content変換失敗 - ${e.message}`;
      console.error(`  [NG] ${msg}`);
      errors.push(msg);
      continue;
    }
  } else {
    console.log('  content 変更: なし');
  }

  if (Object.keys(updatePayload).length === 0) {
    console.log('  -> 更新不要 (全フィールド同一)\n');
    succeeded++;
    continue;
  }

  if (DRY_RUN) {
    console.log(`  -> PATCH予定フィールド: [${Object.keys(updatePayload).join(', ')}] (dry-run)\n`);
    succeeded++;
    continue;
  }

  try {
    await client.update({
      endpoint: 'columns',
      contentId: slug,
      content: updatePayload,
    });
    console.log('  -> PATCH 送信完了');
  } catch (e) {
    const msg = `${slug}: PATCH失敗 - ${e.message}`;
    console.error(`  [NG] ${msg}`);
    errors.push(msg);
    continue;
  }

  let after;
  try {
    after = await client.get({ endpoint: 'columns', contentId: slug });
  } catch (e) {
    console.error(`  [WARN] 検証用の再取得に失敗: ${e.message}`);
    succeeded++;
    continue;
  }

  let ok = true;
  if (after.title !== newTitle) {
    console.error(`  [NG] title不一致: "${after.title}"`);
    ok = false;
  }
  if ((after.description || '') !== newDesc) {
    console.error('  [NG] description不一致');
    ok = false;
  }
  if (contentTransform) {
    if (!after.content.includes('id="budget-schedule"')) {
      console.error('  [NG] h2#budget-schedule が本文に見つかりません');
      ok = false;
    }
  }

  if (ok) {
    console.log(
      `  -> 検証OK: title, description${contentTransform ? ', content(h2#budget-schedule)' : ''} 全て一致`
    );
    succeeded++;
  } else {
    errors.push(`${slug}: PATCH後の検証に失敗`);
  }
  console.log();
}

console.log('========================================');
console.log(`${DRY_RUN ? '計画' : 'PATCH完了'}: ${succeeded}/${PATCHES.length}`);
if (errors.length > 0) {
  console.log(`エラー: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
  process.exit(1);
}
if (DRY_RUN) {
  console.log('\ndry-run です。--apply を付けて再実行すると MicroCMS に PATCH します。');
}
