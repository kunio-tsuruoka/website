/**
 * 同業（開発会社・SIer・コンサルのテック側＝B セグメント）向け相談CTA
 * {{PARTNER_CONSULT}} を AI開発コスト系＋AI技術深掘り記事の末尾に追記する (2026-07-01)
 *
 * 背景: DataForSEO AI検索ボリュームで「ai 開発 費用 / ai 開発 会社」が上昇、Clarity で
 * AI開発コスト系が実引用上位。これらは買い手A と 同業B の双方が読む。既存の買い手CTA
 * （ESTIMATE_CONSULT / CONTACT_CTA）は残したまま、B向けの協業・開発リソース相談CTAを
 * 二系統目として足す。マーカー定義は src/lib/column-visuals.ts の PARTNER_CONSULT。
 *
 * 【重要】PARTNER_CONSULT は新マーカー。renderColumnVisuals 対応コードが本番デプロイ
 * されてから --apply すること（未デプロイで PATCH すると本番に literal {{PARTNER_CONSULT}}
 * が露出する。.claude/rules/microcms.md「新マーカー導入時のデプロイ順序」参照）。
 *
 *   node --env-file=.env scripts/patch-partner-consult-cta.mjs          # dry-run
 *   node --env-file=.env scripts/patch-partner-consult-cta.mjs --apply  # PATCH
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const DRY_RUN = !process.argv.includes('--apply');
const MARKER = 'PARTNER_CONSULT';

// AI開発コスト系（A+B）＋ 同業Bが実装力の見極めで読む技術深掘り記事
const SLUGS = [
  // コスト系（買い手CTAと並べて二系統化）
  'ai-development-cost-guide',
  'system-development-cost-breakdown',
  // 発注比較・技術深掘り（同業が実装力を見極めるために読む）
  'ai-development-vendor-selection',
  'knowledge-graph-rag-business',
  'graphrag-knowledge-search',
  'ai-rag-accuracy-graphrag',
  'genai-system-infrastructure',
  'llm-api-system-design',
  'ai-agent-build-guide',
  'ai-driven-development',
  'mcp-business-data-integration',
  'internal-ai-assistant-rag-patterns',
  'llm-selection-strategy',
];

const has = (content, marker) => content.includes(`{{${marker}}}`);

console.log(`モード: ${DRY_RUN ? 'DRY-RUN (書き込みなし)' : 'APPLY (MicroCMS PATCH)'}\n`);

let changed = 0;
const errors = [];

for (const slug of SLUGS) {
  console.log(`--- ${slug} (append: ${MARKER}) ---`);
  let cur;
  try {
    cur = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'content' },
    });
  } catch (e) {
    console.error(`  [NG] 取得失敗: ${e.message}`);
    errors.push(`${slug}: ${e.message}`);
    continue;
  }
  const content = cur.content || '';
  if (has(content, MARKER)) {
    console.log('  [skip] 既に挿入済み');
    continue;
  }
  const next = `${content.trimEnd()}\n<p>{{${MARKER}}}</p>\n`;
  console.log(`  挿入後 末尾100字: ...${next.slice(-100).replace(/\n/g, '⏎')}`);
  changed++;

  if (!DRY_RUN) {
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: next } });
      const ver = await client.get({
        endpoint: 'columns',
        contentId: slug,
        queries: { fields: 'content' },
      });
      console.log(
        `  [OK] PATCH完了 / 検証: {{${MARKER}}} ${has(ver.content || '', MARKER) ? '存在' : '★欠落'}`
      );
    } catch (e) {
      console.error(`  [NG] PATCH失敗: ${e.message}`);
      errors.push(`${slug}: ${e.message}`);
    }
  }
}

console.log(`\n${DRY_RUN ? '変更予定' : '変更'}: ${changed}件 / エラー: ${errors.length}件`);
if (errors.length) for (const e of errors) console.log(`  - ${e}`);
if (DRY_RUN) console.log('\n--apply で実行（※ PARTNER_CONSULT 対応コードの本番デプロイ後に）');
