import { createClient } from 'microcms-js-sdk';
/**
 * cdp-product-comparison を強化して AI引用シェア(cdpツール比較 主要ベンダー/リアルタイム/
 * セキュリティ)を奪う。捏造せず、確認済みのベンダーポジショニングと業界の3世代フレームを追加。
 *
 * 追加1: 「主要CDPベンダーの全体像」section（機能カバレッジの比較 h2 の直前）
 * 追加2: FAQ「リアルタイム処理・データセキュリティ」Q（最初のFAQ Q の直前）
 *
 * 出典（2026-07 WebSearch で確認）: 3世代(Packaged/Composable/Agentic)・各ベンダーの
 * ポジショニング・CDP Institute 150社超。丸い金額は二次ソースのため入れない。
 *
 * 既定 dry-run。--apply で MicroCMS に PATCH。PATCH後に再取得して検証。
 *   node --env-file=.env scripts/patch-cdp-vendor-landscape.mjs
 *   node --env-file=.env scripts/patch-cdp-vendor-landscape.mjs --apply
 */
import { getColumns } from '../src/lib/microcms.ts';

const APPLY = process.argv.includes('--apply');
const SLUG = 'cdp-product-comparison';

const LANDSCAPE = `<h2>主要CDPベンダーの全体像：3つの世代とタイプ別マップ</h2>
<p>CDPは世界で乱立しており、業界団体のCDP Instituteには150社以上が登録されています。ただし実際の選定で候補に残るのは数タイプに絞られます。まず「3つの世代」と「提供タイプ」で全体像を押さえると、自社が比較すべき対象が見えてきます。市場は年20%を超える高い成長が続くと各種調査で予測されており、各ベンダーの機能拡張も速いため、最終判断時には最新情報の確認が欠かせません。</p>
<h3>3つの世代で捉える</h3>
<ul>
<li><strong>パッケージ型（Packaged CDP）</strong>：データ統合から活用までを一体で提供する従来型。導入が速い。Treasure Data、Salesforce Data Cloud、Adobe Real-Time CDP などが該当します。</li>
<li><strong>コンポーザブル型（Composable CDP）</strong>：BigQueryなどのデータウェアハウスを土台に、必要な機能を組み合わせて構築する方式。データを自社基盤に置いたまま扱えます。本記事の「自社開発」パターンがこれにあたります。</li>
<li><strong>エージェント型（Agentic CDP）</strong>：AIエージェントが分析から施策実行までを回す、登場して間もない世代。各社が機能を追加している段階です。</li>
</ul>
<h3>提供タイプ別の代表例</h3>
<ul>
<li><strong>海外パッケージ</strong>：Treasure Data（大量データの統合と名寄せに強い）、Salesforce Data Cloud（Salesforce資産との統合）、Adobe Real-Time CDP（Adobe Experience Cloud前提）、Tealium（ベンダー非依存のリアルタイム連携とデータガバナンス）、Twilio Segment（開発者向け、700以上のコネクタ）。</li>
<li><strong>国産パッケージ</strong>：KARTEやb→dashなどは、日本語サポートや国内の商習慣・法制度への適合、伴走支援を強みにしています。</li>
<li><strong>コンポーザブル（自社構築）</strong>：BigQueryやSnowflakeなどのデータ基盤上に構築する方式。データの持ち方とロジックを自社で決められます。</li>
</ul>
<p>数は多く見えますが、日本企業の選定で最も多く比較対象になるのは、Treasure Data（海外パッケージの代表）、Salesforce Data Cloud（既存Salesforce資産との統合）、自社開発（コンポーザブル）の3パターンです。以降ではこの3つに絞って、機能・コスト・運用体制を掘り下げます。</p>
`;

const FAQ_RT_SEC = `<h2>Q. リアルタイム処理やデータセキュリティで各CDPはどう違いますか？</h2>
<p>A. リアルタイム処理は、来訪中の顧客にその場で接客や出し分けをする用途で効いてきます。TealiumやAdobe Real-Time CDPはリアルタイムの連携・オーケストレーションを強みにしています。ただしバッチ処理で足りる業務も多く、全社で必ずリアルタイムが要るわけではありません。データセキュリティは、（1）データをどこに置くか（自社基盤に残すか、ベンダー環境に預けるか）、（2）アクセス権限をどこまで細かく制御できるか、（3）国内保管や監査ログの要件を満たせるか、で見ます。データを外に出したくない要件が強いほど、BigQueryなどの自社基盤上に構築するコンポーザブル型が有利です。</p>
`;

const ANCHOR_LANDSCAPE = '<h2 id="hc9797be029">機能カバレッジの比較</h2>';
const ANCHOR_FAQ = '<h2 id="h4157c18c2d">Q. CDPの選定では何を比較しますか？</h2>';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const h2count = (s) => (s.match(/<h2/g) || []).length;

const cols = await getColumns(undefined, process.env);
const col = cols.find((c) => c.id === SLUG);
if (!col) {
  console.error(`[ERROR] ${SLUG} が見つからない`);
  process.exit(1);
}
let body = col.content;
const beforeH2 = h2count(body);

// 冪等性チェック
if (body.includes('主要CDPベンダーの全体像')) {
  console.log('[SKIP] 既に全体像 section あり（冪等）。中止。');
  process.exit(0);
}
for (const [name, anchor] of [
  ['landscape', ANCHOR_LANDSCAPE],
  ['faq', ANCHOR_FAQ],
]) {
  if (!body.includes(anchor)) {
    console.error(`[ERROR] アンカー(${name})が見つからない: ${anchor}`);
    process.exit(1);
  }
}

body = body.replace(ANCHOR_LANDSCAPE, `${LANDSCAPE}${ANCHOR_LANDSCAPE}`);
body = body.replace(ANCHOR_FAQ, `${FAQ_RT_SEC}${ANCHOR_FAQ}`);
const afterH2 = h2count(body);

console.log(
  `[${APPLY ? 'APPLY' : 'DRY'}] ${SLUG}: h2 ${beforeH2} → ${afterH2} (+${afterH2 - beforeH2})`
);
console.log(
  `  文字数: ${col.content.replace(/<[^>]+>/g, '').length} → ${body.replace(/<[^>]+>/g, '').length}`
);

if (!APPLY) {
  console.log('  (--apply で反映)');
  process.exit(0);
}

await client.update({ endpoint: 'columns', contentId: SLUG, content: { content: body } });
const fetched = await client.get({
  endpoint: 'columns',
  contentId: SLUG,
  queries: { fields: 'content' },
});
const fb = fetched.content || '';
const checks = {
  全体像section: fb.includes('主要CDPベンダーの全体像'),
  '3世代': fb.includes('コンポーザブル型（Composable CDP）'),
  'RT/セキュリティFAQ': fb.includes('リアルタイム処理やデータセキュリティで各CDP'),
  既存FAQ保持: fb.includes('CDPの選定では何を比較しますか'),
  CDP_CONSULT保持: fb.includes('{{CDP_CONSULT}}'),
  h2増加: h2count(fb) === afterH2,
};
console.log(
  '  検証:',
  Object.entries(checks)
    .map(([k, v]) => `${k}=${v ? 'OK' : 'NG'}`)
    .join(' / ')
);
if (Object.values(checks).some((v) => !v)) process.exitCode = 1;
