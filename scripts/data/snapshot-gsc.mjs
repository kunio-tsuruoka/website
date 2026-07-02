/**
 * GSC snapshot → marketing data hub.
 *
 * scripts/gsc-query.mjs のトークン処理を自己完結で持ち、
 * query別 / page別を取得して正規化 JSON でハブに落とす。
 * さらに seo.md の「CTR診断ループ」を機械化した派生分析
 * (ctr-opportunities: 順位5-20 かつ imp>=閾値 かつ CTR低) も出力する。
 *
 * 使い方:
 *   node scripts/data/snapshot-gsc.mjs                 # 直近28日
 *   node scripts/data/snapshot-gsc.mjs --start 2026-04-01 --end 2026-06-30
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { log, recordRefresh, writeSnapshot } from './lib.mjs';

const CLIENT_FILE = '/Users/kunio/.gcp-keys/oauth-client.json';
const TOKEN_FILE = '/Users/kunio/.gcp-keys/gsc-token.json';
const SITE_URL = 'sc-domain:beekle.jp';
const API_BASE = 'https://www.googleapis.com/webmasters/v3/sites';

// --- args ---
function parseArgs(argv) {
  const args = { start: null, end: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--start' && argv[i + 1]) args.start = argv[++i];
    else if (a === '--end' && argv[i + 1]) args.end = argv[++i];
    else if (a === '--help' || a === '-h') {
      log('Usage: node scripts/data/snapshot-gsc.mjs [--start YYYY-MM-DD] [--end YYYY-MM-DD]');
      process.exit(0);
    } else fatal(`Unknown flag: ${a}`);
  }
  return args;
}
function fatal(msg) {
  log(`[ERROR] ${msg}`);
  process.exit(1);
}

// --- token ---
function loadCredentials() {
  if (!existsSync(CLIENT_FILE)) fatal(`OAuth client file not found: ${CLIENT_FILE}`);
  const raw = JSON.parse(readFileSync(CLIENT_FILE, 'utf-8'));
  const creds = raw.installed || raw.web;
  if (!creds?.client_id) fatal('Invalid OAuth client file');
  return creds;
}
function loadToken() {
  if (!existsSync(TOKEN_FILE))
    fatal(`Token file not found: ${TOKEN_FILE}. Run scripts/gsc-oauth-setup.mjs first.`);
  const token = JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
  if (!token.refresh_token) fatal('Token missing refresh_token. Re-run gsc-oauth-setup.mjs.');
  return token;
}
async function getValidToken() {
  const creds = loadCredentials();
  const token = loadToken();
  const expired = !token.expiry_date || Date.now() >= token.expiry_date - 60_000;
  if (!expired) return token.access_token;

  log('[INFO] Refreshing GSC access token...');
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
  if (data.error) fatal(`Token refresh failed: ${data.error_description || data.error}`);
  const updated = {
    ...token,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
  if (data.refresh_token) updated.refresh_token = data.refresh_token;
  writeFileSync(TOKEN_FILE, JSON.stringify(updated, null, 2), { mode: 0o600 });
  return updated.access_token;
}

// --- query ---
function dateRange(startStr, endStr) {
  const end = endStr ? new Date(endStr) : new Date();
  const start = startStr ? new Date(startStr) : new Date(end.getTime() - 28 * 864e5);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}
async function queryGsc(token, dimensions, startDate, endDate) {
  const url = `${API_BASE}/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: 5000, type: 'web' }),
  });
  if (!res.ok) fatal(`GSC API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return (data.rows || []).map((row) => {
    const obj = {};
    for (let i = 0; i < dimensions.length; i++) obj[dimensions[i]] = row.keys[i];
    obj.clicks = row.clicks;
    obj.impressions = row.impressions;
    obj.ctr = row.ctr;
    obj.position = row.position;
    return obj;
  });
}

/**
 * 買い手インテント判定 (content-strategy-goals.md の3セグメント方針をスコアに反映)。
 * インプレッションだけでスコアリングすると定義系 (要求とは / gherkin等 = C-zone) が
 * 上位を占拠し、CV価値の低いクエリに時間が流れるため、発注に近い語を含むクエリを
 * 優先し、定義・構文系を減衰させる。
 * buyer 判定が definitional より先に勝つ (例: 「cdp 比較」は比較=buyer)。
 */
const BUYER_PATTERNS = [
  /費用|料金|価格|相場|見積/,
  /受託|外注|委託|依頼|発注/,
  /会社|ベンダー|パートナー|業者/,
  /比較|選び方|選定/,
  /導入|支援|代行|相談/,
  /rfp|poc|mvp|cdp/i,
];
const DEFINITIONAL_PATTERNS = [
  /とは|意味|読み方|一覧|サンプル|テンプレート|書き方|例$/,
  /違い/,
  /gherkin|ears|ガーキン|記法|構文|when then/i,
];
function classifyIntent(query) {
  if (BUYER_PATTERNS.some((p) => p.test(query))) return { intent: 'buyer', weight: 3 };
  if (DEFINITIONAL_PATTERNS.some((p) => p.test(query)))
    return { intent: 'definitional', weight: 0.3 };
  return { intent: 'neutral', weight: 1 };
}

/**
 * CTR改善余地の派生分析 (seo.md の CTR診断ループを機械化)。
 * 順位5-20 かつ imp>=閾値 かつ CTR が期待値を大きく下回るクエリ = title/desc 見直し候補。
 * opportunityScore = imp × 低CTR × インテント重み (buyer 3x / definitional 0.3x)。
 */
function ctrOpportunities(queryRows, minImpressions = 30) {
  return queryRows
    .filter((r) => r.position >= 5 && r.position <= 20 && r.impressions >= minImpressions)
    .map((r) => {
      const { intent, weight } = classifyIntent(r.query);
      return {
        query: r.query,
        intent,
        impressions: r.impressions,
        clicks: r.clicks,
        ctrPct: +(r.ctr * 100).toFixed(2),
        position: +r.position.toFixed(1),
        // imp × 低CTR × インテント重み で「取りこぼしの大きさ × 買い手価値」をスコア化
        opportunityScore: +(r.impressions * Math.max(0, 0.03 - r.ctr) * weight).toFixed(1),
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

async function main() {
  const args = parseArgs(process.argv);
  const { startDate, endDate } = dateRange(args.start, args.end);
  const token = await getValidToken();
  log(`[INFO] GSC ${startDate} → ${endDate}`);

  const byQuery = await queryGsc(token, ['query'], startDate, endDate);
  const byPage = await queryGsc(token, ['page'], startDate, endDate);
  const opportunities = ctrOpportunities(byQuery);

  const meta = { startDate, endDate, site: SITE_URL };
  const totals = byPage.reduce(
    (acc, r) => {
      acc.clicks += r.clicks;
      acc.impressions += r.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0 }
  );
  totals.ctrPct = totals.impressions ? +((totals.clicks / totals.impressions) * 100).toFixed(2) : 0;

  writeSnapshot('gsc', 'queries', { meta, totals, rows: byQuery });
  writeSnapshot('gsc', 'pages', { meta, totals, rows: byPage });
  writeSnapshot('gsc', 'ctr-opportunities', {
    meta,
    count: opportunities.length,
    rows: opportunities,
  });

  recordRefresh('gsc', {
    files: ['queries.json', 'pages.json', 'ctr-opportunities.json'],
    dateRange: { startDate, endDate },
    stats: {
      queries: byQuery.length,
      pages: byPage.length,
      totalClicks: totals.clicks,
      totalImpressions: totals.impressions,
      ctrPct: totals.ctrPct,
      ctrOpportunities: opportunities.length,
    },
    note: 'query/page別 + CTR改善余地(pos5-20/imp>=30, 買い手インテント重み付き)',
  });

  log(
    `[OK] GSC: ${byQuery.length} queries / ${byPage.length} pages / ${opportunities.length} CTR opportunities. clicks=${totals.clicks} imp=${totals.impressions} ctr=${totals.ctrPct}%`
  );
}

main().catch((err) => fatal(`Unexpected error: ${err.stack || err.message}`));
