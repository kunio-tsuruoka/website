/**
 * GSC Search Analytics Query
 *
 * Google Search Console API からクエリ/ページデータを取得する。
 * OAuth トークンの自動リフレッシュ付き。
 *
 * 使い方:
 *   node scripts/gsc-query.mjs                       # JSON (全件, query+page)
 *   node scripts/gsc-query.mjs --csv                  # CSV 出力
 *   node scripts/gsc-query.mjs --top 50               # 上位50件
 *   node scripts/gsc-query.mjs --query-only           # dimensions: query のみ
 *   node scripts/gsc-query.mjs --page-only            # dimensions: page のみ
 *   node scripts/gsc-query.mjs --start 2026-05-01 --end 2026-05-28
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CLIENT_FILE = '/Users/kunio/.gcp-keys/oauth-client.json';
const TOKEN_FILE = '/Users/kunio/.gcp-keys/gsc-token.json';
const SITE_URL = 'sc-domain:beekle.jp';
const API_BASE = 'https://www.googleapis.com/webmasters/v3/sites';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    csv: false,
    top: null,
    queryOnly: false,
    pageOnly: false,
    start: null,
    end: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--csv') {
      args.csv = true;
    } else if (a === '--top' && argv[i + 1]) {
      args.top = Number.parseInt(argv[++i], 10);
      if (Number.isNaN(args.top) || args.top < 1) {
        fatal('--top requires a positive integer');
      }
    } else if (a === '--query-only') {
      args.queryOnly = true;
    } else if (a === '--page-only') {
      args.pageOnly = true;
    } else if (a === '--start' && argv[i + 1]) {
      args.start = argv[++i];
    } else if (a === '--end' && argv[i + 1]) {
      args.end = argv[++i];
    } else if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else {
      fatal(`Unknown flag: ${a}. Use --help for usage.`);
    }
  }

  if (args.queryOnly && args.pageOnly) {
    fatal('--query-only and --page-only are mutually exclusive');
  }

  return args;
}

function printUsage() {
  console.log(`Usage: node scripts/gsc-query.mjs [options]

Options:
  --csv           Output as CSV instead of JSON
  --top N         Limit to top N rows (default: all)
  --query-only    Dimensions: query only
  --page-only     Dimensions: page only
  --start DATE    Start date (YYYY-MM-DD, default: 28 days ago)
  --end DATE      End date (YYYY-MM-DD, default: today)
  --help, -h      Show this help message`);
}

function fatal(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------
function loadCredentials() {
  if (!existsSync(CLIENT_FILE)) {
    fatal(`OAuth client file not found: ${CLIENT_FILE}`);
  }
  const raw = JSON.parse(readFileSync(CLIENT_FILE, 'utf-8'));
  const creds = raw.installed || raw.web;
  if (!creds?.client_id || !creds?.client_secret) {
    fatal('Invalid OAuth client file: missing client_id or client_secret');
  }
  return creds;
}

function loadToken() {
  if (!existsSync(TOKEN_FILE)) {
    fatal(
      `Token file not found: ${TOKEN_FILE}\nRun "node scripts/gsc-oauth-setup.mjs" first to create it.`
    );
  }
  const token = JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
  if (!token.access_token) {
    fatal('Token file is missing access_token. Re-run gsc-oauth-setup.mjs.');
  }
  if (!token.refresh_token) {
    fatal('Token file is missing refresh_token. Re-run gsc-oauth-setup.mjs with prompt=consent.');
  }
  return token;
}

function isTokenExpired(token) {
  if (!token.expiry_date) return true;
  // Refresh 60 seconds before actual expiry to avoid race conditions
  return Date.now() >= token.expiry_date - 60_000;
}

async function refreshAccessToken(creds, token) {
  console.error('[INFO] Access token expired, refreshing...');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();

  if (data.error) {
    fatal(
      `Token refresh failed: ${data.error_description || data.error}\n` +
        'You may need to re-run "node scripts/gsc-oauth-setup.mjs".'
    );
  }

  const updated = {
    ...token,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
  // Preserve existing refresh_token if the response doesn't include a new one
  if (data.refresh_token) {
    updated.refresh_token = data.refresh_token;
  }
  if (data.scope) {
    updated.scope = data.scope;
  }
  if (data.token_type) {
    updated.token_type = data.token_type;
  }

  writeFileSync(TOKEN_FILE, JSON.stringify(updated, null, 2), { mode: 0o600 });
  console.error('[INFO] Token refreshed and saved.');
  return updated;
}

async function getValidToken() {
  const creds = loadCredentials();
  let token = loadToken();

  if (isTokenExpired(token)) {
    token = await refreshAccessToken(creds, token);
  }

  return token.access_token;
}

// ---------------------------------------------------------------------------
// GSC API
// ---------------------------------------------------------------------------
function buildDateRange(startStr, endStr) {
  const end = endStr ? new Date(endStr) : new Date();
  const start = startStr ? new Date(startStr) : new Date(end.getTime() - 28 * 24 * 60 * 60 * 1000);

  const fmt = (d) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

function buildDimensions(args) {
  if (args.queryOnly) return ['query'];
  if (args.pageOnly) return ['page'];
  return ['query', 'page'];
}

async function querySearchAnalytics(accessToken, args) {
  const { startDate, endDate } = buildDateRange(args.start, args.end);
  const dimensions = buildDimensions(args);

  const body = {
    startDate,
    endDate,
    dimensions,
    rowLimit: 5000,
    type: 'web',
  };

  const encodedSite = encodeURIComponent(SITE_URL);
  const url = `${API_BASE}/${encodedSite}/searchAnalytics/query`;

  console.error(`[INFO] Querying GSC: ${startDate} to ${endDate}`);
  console.error(`[INFO] Dimensions: ${dimensions.join(', ')}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    fatal(`GSC API error (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  const rows = data.rows || [];

  console.error(`[INFO] Received ${rows.length} rows`);
  return { rows, dimensions, startDate, endDate };
}

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------
function formatRows(rows, dimensions, args) {
  let output = rows;

  if (args.top) {
    output = output.slice(0, args.top);
  }

  return output.map((row) => {
    const obj = {};
    for (let i = 0; i < dimensions.length; i++) {
      obj[dimensions[i]] = row.keys[i];
    }
    obj.clicks = row.clicks;
    obj.impressions = row.impressions;
    obj.ctr = row.ctr;
    obj.position = row.position;
    return obj;
  });
}

function escapeCsvField(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(formatted, dimensions) {
  const headers = [...dimensions, 'clicks', 'impressions', 'ctr', 'position'];
  const lines = [headers.join(',')];
  for (const row of formatted) {
    const vals = headers.map((h) => {
      const v = row[h];
      if (h === 'ctr') return (v * 100).toFixed(2) + '%';
      if (h === 'position') return Number(v).toFixed(1);
      return escapeCsvField(v);
    });
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv);
  const accessToken = await getValidToken();
  const { rows, dimensions, startDate, endDate } = await querySearchAnalytics(accessToken, args);
  const formatted = formatRows(rows, dimensions, args);

  if (formatted.length === 0) {
    console.error('[INFO] No data returned for the specified date range.');
    process.exit(0);
  }

  if (args.csv) {
    console.log(toCsv(formatted, dimensions));
  } else {
    console.log(
      JSON.stringify(
        {
          meta: {
            startDate,
            endDate,
            dimensions,
            totalRows: rows.length,
            outputRows: formatted.length,
          },
          rows: formatted,
        },
        null,
        2
      )
    );
  }
}

main().catch((err) => {
  fatal(`Unexpected error: ${err.message}`);
});
