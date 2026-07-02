/**
 * SEO title/desc PATCH (2026-05-28) - 9 articles
 *
 * node --env-file=.env scripts/patch-seo-batch-2026-05-28.mjs          # dry-run
 * node --env-file=.env scripts/patch-seo-batch-2026-05-28.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');

const PATCHES = [
  {
    slug: 'mvp-development-guide',
    title: 'MVP開発とは？PoC・プロトタイプとの違いと費用相場｜発注者向け早見ハブ',
    description:
      'MVP・PoC・プロトタイプの3つの違いを表で整理し、規模別の費用目安と失敗パターンを掲載。「動くものを先に見てから判断したい」発注者のための早見ハブ。',
  },
  {
    slug: 'system-development-cost-breakdown',
    title: 'システム開発費用の内訳｜見積書のどこを見れば妥当性がわかるか',
    description:
      '要件定義・設計・開発・テスト・運用の各フェーズで何にいくらかかるか、内訳の標準比率と見落としやすい間接費を整理。見積書を受け取ったら確認すべき10項目のチェックリスト付き。',
  },
  {
    slug: 'web-system-cost-by-scale',
    title: 'Webシステム開発の費用相場｜300万〜4,000万超、なぜ見積もりと実費がズレるのか',
    description:
      '小規模300万〜大規模4,000万超の規模別に費用内訳と体制を整理。予算超過が起きる3つの構造的原因と、発注前に潰せるチェックポイントを掲載。',
  },
  {
    slug: 'system-estimate-validity',
    title: 'その見積もりは妥当？システム開発の見積もり妥当性を3軸でチェックする方法',
    description:
      '見積書の金額が高いのか安いのか判断できない発注者向けに、機能・相場・ROIの3軸で妥当性を評価する方法を整理。相見積もりだけでは見えない落とし穴も解説。',
  },
  {
    slug: 'cdp-cost-and-period',
    title: 'CDP構築の費用と期間｜月数千円から数千万円まで、規模別の現実的な目安',
    description:
      'CDP構築費用を中小企業（月数千円〜）から中堅企業（数千万円規模）まで規模別に整理。サービス型と自社開発型の違い、見落とされがちな追加費用、3年で見る予算の考え方を掲載。',
  },
  {
    slug: 'ai-agent-explained',
    title: 'AIエージェントとは？発注検討者が知るべき判断軸｜できること・費用・導入条件',
    description:
      'AIエージェントとは何か、ChatGPT/RAGとの違い、業務での活用シナリオ5つ、導入の現実的なコスト感を整理。「AIエージェントを入れたい」と言われた情シス向け。',
  },
  {
    slug: 'ai-agent-build-guide',
    title: 'AIエージェントの作り方｜設計・実装・運用の全フェーズを発注者視点で整理',
    description:
      'AIエージェントを業務に組み込むまでの設計・実装・運用を3フェーズで解説。構成パターン、構築期間とコスト目安、発注先の選定ポイントまで。',
  },
  {
    slug: 'how-to-write-rfp',
    title: 'RFPの書き方｜何を書けばベンダーに伝わるか？7項目と9つの落とし穴',
    description:
      'RFPに書くべき7項目と、予算・スケジュール・評価基準で陥りやすい9つの落とし穴を具体例で解説。10章構成の骨格テンプレートも掲載。',
  },
  {
    slug: 'dx-josys-as-is-bpo-guide',
    title: 'DXの進め方｜業務プロセス見直しとAs-Is/To-Beから始める実践ガイド',
    description:
      '「DXやれ」と言われた情シス向けに、業務プロセス（BPO）見直し→As-Is/To-Be可視化→費用対効果で絞り込む進め方を解説。製造業DX案件の実例付き。',
  },
];

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (API書き込みなし)' : 'APPLY (MicroCMS PATCH実行)'}`);
console.log(`対象: ${PATCHES.length} 記事\n`);

let succeeded = 0;
const errors = [];

for (const patch of PATCHES) {
  const { slug, title: newTitle, description: newDesc } = patch;
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

  if (ok) {
    console.log('  -> 検証OK: title, description 一致');
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
