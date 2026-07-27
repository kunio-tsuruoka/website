/**
 * 高順位のRAG/ナレッジグラフ記事に、サービスLPへのブリッジCTAマーカーを挿入する。
 *
 * 背景（2026-07-27）:
 *   LLM推奨プローブ(kb02)で /services/rag-system-development が初めて引用されたとき、
 *   引用URLに `source=column-what-is-rag` が残っており、コラムに置いたブリッジCTAが
 *   LLM の web_search の到達経路になっていることが確認できた。
 *   一方、`graphrag`(1,600/月・競合LOW) で pos 9.6 を取っている最強ページ
 *   /knowledge/graphrag-knowledge-search にはブリッジが無かった。そこを埋める。
 *
 * 挿入位置: 「よくある質問（FAQ）」見出しの直前（本文の締め、記事末CTAより手前）。
 *
 * 使い方:
 *   node --env-file=.env scripts/insert-service-bridge.mjs                    # dry-run（既定）
 *   node --env-file=.env scripts/insert-service-bridge.mjs --apply --backup-dir=<path>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const backupDir = process.argv
  .find((a) => a.startsWith('--backup-dir='))
  ?.slice('--backup-dir='.length);

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/** slug → 挿入するブリッジマーカー */
const TARGETS = {
  'graphrag-knowledge-search': 'RAG_SERVICE_BRIDGE',
  'rag-evaluation': 'RAG_SERVICE_BRIDGE',
  'how-to-build-knowledge-graph-agent': 'RAG_SERVICE_BRIDGE',
};

const textOf = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** 「よくある質問」見出しの開始位置。無ければ末尾CTAマーカーの直前 */
function findInsertPosition(html) {
  const headRe = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g;
  let m = headRe.exec(html);
  while (m !== null) {
    if (/(よくある質問|FAQ)/.test(textOf(m[1]))) return m.index;
    m = headRe.exec(html);
  }
  const cta = html.search(/<p>\s*\{\{CONTACT_CTA\}\}\s*<\/p>/);
  return cta === -1 ? null : cta;
}

if (apply && !backupDir) {
  console.error('--apply には --backup-dir=<path> が必須です');
  process.exit(1);
}
if (apply) mkdirSync(backupDir, { recursive: true });

console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}\n`);

const errors = [];
let changed = 0;

for (const [slug, marker] of Object.entries(TARGETS)) {
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    errors.push(`${slug}: 取得失敗 ${e.message}`);
    continue;
  }

  const before = current.content;
  if (before.includes(`{{${marker}}}`)) {
    console.log(`[${slug}] 既に ${marker} あり — スキップ`);
    continue;
  }

  const at = findInsertPosition(before);
  if (at === null) {
    errors.push(`${slug}: 挿入位置（FAQ見出し / CONTACT_CTA）が見つからない`);
    continue;
  }

  const html = `${before.slice(0, at)}\n<p>{{${marker}}}</p>\n${before.slice(at)}`;
  changed += 1;
  const ctx = textOf(before.slice(Math.max(0, at - 90), at)).slice(-60);
  console.log(
    `[${slug}] ${marker} を挿入 (…${ctx} の直後) / ${before.length} → ${html.length} bytes`
  );

  if (apply) {
    writeFileSync(`${backupDir}/${slug}.html`, before, 'utf8');
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: html } });
      console.log('   PATCH OK');
    } catch (e) {
      errors.push(`${slug}: PATCH失敗 ${e.message}`);
    }
  }
}

console.log(`\n変更対象: ${changed} 記事`);
if (errors.length) {
  console.log('\n--- 要確認 ---');
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log(apply ? '完了' : 'dry-run 完了（--apply で反映）');
