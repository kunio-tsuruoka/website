/**
 * Save an MCP tool result into the marketing data hub.
 *
 * DataForSEO / rakko / Clarity Data Export API のような「MCP でしか取れない」
 * ソースの結果を、GSC/GA4 と同じハブ規約 (日付き + latest + index) で落とすための橋渡し。
 * LLM が MCP を叩いた結果を一時 JSON に保存 → これに食わせると正規化されてハブに入る。
 *
 * 使い方:
 *   node scripts/data/save-mcp.mjs <source> <name> --file result.json [--note "..."]
 *   echo '<json>' | node scripts/data/save-mcp.mjs <source> <name>
 *
 * 例:
 *   node scripts/data/save-mcp.mjs dataforseo search-intent --file /tmp/intent.json \
 *     --note "発注クエリ12件のintent (ja/Japan)"
 *   node scripts/data/save-mcp.mjs rakko paa-genai --file /tmp/paa.json
 */
import { readFileSync } from 'node:fs';
import { log, recordRefresh, writeSnapshot } from './lib.mjs';

function parseArgs(argv) {
  const positional = [];
  const opts = { file: null, note: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file' && argv[i + 1]) opts.file = argv[++i];
    else if (a === '--note' && argv[i + 1]) opts.note = argv[++i];
    else if (a === '--help' || a === '-h') {
      log(
        'Usage: node scripts/data/save-mcp.mjs <source> <name> [--file result.json] [--note "..."]'
      );
      process.exit(0);
    } else positional.push(a);
  }
  return { source: positional[0], name: positional[1], ...opts };
}

function readStdin() {
  try {
    return readFileSync(0, 'utf-8');
  } catch {
    return '';
  }
}

function main() {
  const { source, name, file, note } = parseArgs(process.argv);
  if (!source || !name) {
    log('[ERROR] usage: node scripts/data/save-mcp.mjs <source> <name> [--file result.json]');
    process.exit(1);
  }

  const raw = file ? readFileSync(file, 'utf-8') : readStdin();
  if (!raw.trim()) {
    log('[ERROR] no JSON input (use --file or pipe via stdin)');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    log(`[ERROR] input is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  const payload = {
    meta: {
      source,
      name,
      capturedAt: new Date().toISOString(),
      via: 'mcp',
      sourceFile: file || 'stdin',
    },
    data,
  };
  writeSnapshot(source, name, payload);

  const rows = Array.isArray(data)
    ? data.length
    : Array.isArray(data?.rows)
      ? data.rows.length
      : undefined;
  recordRefresh(source, {
    files: [`${name}.json`],
    stats: rows !== undefined ? { [`${name}_rows`]: rows } : undefined,
    note: note || `MCP capture: ${name}`,
  });

  log(`[OK] saved ${source}/${name}.json to hub${rows !== undefined ? ` (${rows} rows)` : ''}`);
}

main();
