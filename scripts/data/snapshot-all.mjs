/**
 * Refresh all scriptable marketing data sources into the hub.
 *
 * スクリプトで取れるソース (GSC / GA4 / Clarity CSV) を順に走らせ、
 * 1本失敗しても他は続ける。MCP系ソース (DataForSEO / rakko / Clarity API) は
 * LLM が skill 経由で叩く必要があるため、ここでは実行せずリマインドだけ出す。
 *
 * 使い方:
 *   node scripts/data/snapshot-all.mjs
 *   node scripts/data/snapshot-all.mjs --start 2026-04-01 --end 2026-06-30   # GSC の期間指定を委譲
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { log, regenerateReadme } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const passthrough = process.argv.slice(2);

const steps = [
  { name: 'GSC', script: 'snapshot-gsc.mjs', args: passthrough },
  { name: 'GA4', script: 'snapshot-ga4.mjs', args: [] }, // GA4 は NdaysAgo 形式なので期間は既定に任せる
  { name: 'Clarity(CSV)', script: 'import-clarity-citations.mjs', args: [] },
];

const results = [];
for (const step of steps) {
  log(`\n=== ${step.name} ===`);
  const r = spawnSync('node', [join(here, step.script), ...step.args], { stdio: 'inherit' });
  results.push({ name: step.name, ok: r.status === 0 });
}

regenerateReadme();

log('\n=== summary ===');
for (const r of results) log(`${r.ok ? '[OK] ' : '[FAIL]'} ${r.name}`);

log(
  [
    '',
    'MCP系ソースは skill 経由で LLM が取得する (このスクリプトでは走らない):',
    '  - DataForSEO: search_intent / keyword_ideas / ai_search_volume',
    '  - rakko: co-occurrence / question-search (PAA) / related-keywords',
    '  - Clarity Data Export API: トラフィック/挙動 (AI Citations は CSV export のみ)',
    '  → 手順は .claude/skills/marketing-data/SKILL.md',
    '',
    'ハブ: docs/marketing/data/  (まず README.md と各 latest/ を読む)',
  ].join('\n')
);

process.exit(results.some((r) => !r.ok) ? 1 : 0);
