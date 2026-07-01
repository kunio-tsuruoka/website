/**
 * GA4 snapshot → marketing data hub.
 *
 * SA キー (~/.gcp-keys/ga4-mcp-beekle.json) で analytics.readonly トークンを発行し、
 * GA4 Data API (runReport) を直接叩く。MCP に依存せずスクリプトで再現可能にするのが狙い。
 * 各レポートは独立 try/catch。1本失敗しても他は書き込む。
 *
 * 取得レポート:
 *   content-group     content_group別 セッション/CV/エンゲージ
 *   channels          流入チャネル別 セッション/CV
 *   top-pages         pagePath別 PV/セッション
 *   key-events        リード系キーイベントのカウント
 *   sc-landing        Search Console連携メトリクス (landingPage別) ※SC系は単独リクエスト必須
 *
 * 使い方:
 *   node scripts/data/snapshot-ga4.mjs                       # 直近28日
 *   node scripts/data/snapshot-ga4.mjs --start 30daysAgo --end yesterday
 */
import gal from 'google-auth-library';
import { log, recordRefresh, writeSnapshot } from './lib.mjs';

const { GoogleAuth } = gal;
const SA_KEY = '/Users/kunio/.gcp-keys/ga4-mcp-beekle.json';
const PROPERTY = '355503040';
const API = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`;

// リード系キーイベント (analytics-ga4.md の TARGET_EVENTS と揃える)
const KEY_EVENTS = [
  'form_submit',
  'generate_lead',
  'contact_complete',
  'cta_click',
  'download_request',
  'purchase',
];

function parseArgs(argv) {
  const args = { start: '28daysAgo', end: 'yesterday' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--start' && argv[i + 1]) args.start = argv[++i];
    else if (a === '--end' && argv[i + 1]) args.end = argv[++i];
    else if (a === '--help' || a === '-h') {
      log(
        'Usage: node scripts/data/snapshot-ga4.mjs [--start <date|NdaysAgo>] [--end <date|yesterday>]'
      );
      process.exit(0);
    }
  }
  return args;
}

async function getToken() {
  const auth = new GoogleAuth({
    keyFile: SA_KEY,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to mint GA4 access token from SA key');
  return token;
}

async function runReport(token, body) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GA4 API ${res.status}: ${await res.text()}`);
  return res.json();
}

/** runReport レスポンスを [{dim..., metric...}] に正規化 */
function normalize(resp) {
  const dims = (resp.dimensionHeaders || []).map((h) => h.name);
  const mets = (resp.metricHeaders || []).map((h) => h.name);
  return (resp.rows || []).map((row) => {
    const obj = {};
    for (let i = 0; i < dims.length; i++) obj[dims[i]] = row.dimensionValues[i].value;
    for (let i = 0; i < mets.length; i++) {
      const raw = row.metricValues[i].value;
      const n = Number(raw);
      obj[mets[i]] = Number.isFinite(n) ? n : raw;
    }
    return obj;
  });
}

function report(dateRanges, dimensions, metrics, extra = {}) {
  return {
    dateRanges,
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    ...extra,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const dr = [{ startDate: args.start, endDate: args.end }];
  const token = await getToken();
  log(`[INFO] GA4 property ${PROPERTY}: ${args.start} → ${args.end}`);

  const meta = { property: PROPERTY, startDate: args.start, endDate: args.end };
  const written = [];
  const errors = {};

  const jobs = [
    {
      name: 'content-group',
      body: report(dr, ['contentGroup'], ['sessions', 'engagedSessions', 'keyEvents'], {
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      }),
    },
    {
      name: 'channels',
      body: report(
        dr,
        ['sessionDefaultChannelGroup'],
        ['sessions', 'engagedSessions', 'keyEvents'],
        {
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 50,
        }
      ),
    },
    {
      name: 'top-pages',
      body: report(dr, ['pagePath'], ['screenPageViews', 'sessions'], {
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 100,
      }),
    },
    {
      name: 'key-events',
      body: report(dr, ['eventName'], ['eventCount'], {
        dimensionFilter: {
          filter: { fieldName: 'eventName', inListFilter: { values: KEY_EVENTS } },
        },
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 50,
      }),
    },
    {
      // SC連携メトリクスは landingPage 等の dimension 必須、通常メトリクスと混在不可 (analytics.md)
      name: 'sc-landing',
      body: report(
        dr,
        ['landingPagePlusQueryString'],
        [
          'organicGoogleSearchClicks',
          'organicGoogleSearchImpressions',
          'organicGoogleSearchAveragePosition',
        ],
        {
          orderBys: [{ metric: { metricName: 'organicGoogleSearchImpressions' }, desc: true }],
          limit: 100,
        }
      ),
    },
  ];

  for (const job of jobs) {
    try {
      const resp = await runReport(token, job.body);
      const rows = normalize(resp);
      writeSnapshot('ga4', job.name, { meta, count: rows.length, rows });
      written.push(`${job.name}.json`);
      log(`[OK] ga4/${job.name}: ${rows.length} rows`);
    } catch (err) {
      errors[job.name] = err.message;
      log(`[WARN] ga4/${job.name} failed: ${err.message}`);
    }
  }

  recordRefresh('ga4', {
    files: written,
    dateRange: { startDate: args.start, endDate: args.end },
    stats: { reports: written.length, failed: Object.keys(errors).length },
    note: Object.keys(errors).length
      ? `一部失敗: ${Object.keys(errors).join(', ')}`
      : 'content_group/channels/pages/key-events/SC',
  });

  if (written.length === 0) {
    log('[ERROR] GA4: all reports failed');
    process.exit(1);
  }
}

main().catch((err) => {
  log(`[ERROR] ${err.stack || err.message}`);
  process.exit(1);
});
