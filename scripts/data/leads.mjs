/**
 * Leads ledger — 実問い合わせ台帳 (北極星指標の記録基盤)。
 *
 * GA4 の form_submit はスパム込みで使えない (analytics-ga4.md) ため、
 * 実問い合わせは Slack 到着ベースで手動記録する。この台帳が
 * 「どの施策・どのページ・どのペルソナがリードを生んだか」の唯一の真実源。
 *
 * Slack 通知の「流入」ブロック (2026-06-12 以降の attribution 同送) から
 * channel / landing / source を転記する。
 *
 * 保存先: docs/marketing/data/leads/leads.jsonl (append-only, gitignore済)
 * index.json / README にも件数サマリを反映する。
 *
 * 使い方:
 *   node scripts/data/leads.mjs add --intent partner --persona B --quality high \
 *     --channel referral --source column-graphrag-knowledge-search \
 *     --company "株式会社シフト" --note "GraphRAG記事経由で協業相談"
 *   node scripts/data/leads.mjs add --quality spam --note "海外SEO営業"
 *   node scripts/data/leads.mjs list [--since 2026-06-01]
 *   node scripts/data/leads.mjs summary
 *
 * フィールド:
 *   --date     YYYY-MM-DD (省略時は今日)
 *   --intent   CTA/URLの intent (partner / zero-start / estimate / rfp / cdp / requirements / general...)
 *   --persona  A1=事業部担当者 / A2=情シス / A3=経営層 / B=同業協業 / C=エンジニア / unknown
 *   --quality  high (商談化しうる) / medium / low / spam
 *   --channel  organic / direct / referral / ai / social / unknown (Slack通知の流入ブロックから)
 *   --source   CTAソース or 着地ページ (Slack通知の source / 流入ブロックから)
 *   --company  会社名 (ローカル専用データなので実名可)
 *   --note     自由記述 (何の相談か)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HUB, log, recordRefresh, today } from './lib.mjs';

const LEADS_DIR = join(HUB, 'leads');
const LEDGER = join(LEADS_DIR, 'leads.jsonl');

const PERSONAS = ['A1', 'A2', 'A3', 'B', 'C', 'unknown'];
const QUALITIES = ['high', 'medium', 'low', 'spam'];
const CHANNELS = ['organic', 'direct', 'referral', 'ai', 'social', 'unknown'];

function fatal(msg) {
  log(`[ERROR] ${msg}`);
  process.exit(1);
}

function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) fatal(`Unexpected argument: ${a}`);
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    flags[key] = val;
  }
  return flags;
}

function readLedger() {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function updateIndex(leads) {
  const real = leads.filter((l) => l.quality !== 'spam');
  const byIntent = {};
  const byPersona = {};
  for (const l of real) {
    byIntent[l.intent || 'unknown'] = (byIntent[l.intent || 'unknown'] || 0) + 1;
    byPersona[l.persona || 'unknown'] = (byPersona[l.persona || 'unknown'] || 0) + 1;
  }
  recordRefresh('leads', {
    files: ['leads.jsonl'],
    stats: {
      total: leads.length,
      real: real.length,
      spam: leads.length - real.length,
      byIntent,
      byPersona,
    },
    note: '実問い合わせ台帳 (Slack到着ベース, 北極星指標)。node scripts/data/leads.mjs で記録',
  });
}

function cmdAdd(flags) {
  const persona = flags.persona || 'unknown';
  const quality = flags.quality || 'medium';
  const channel = flags.channel || 'unknown';
  if (!PERSONAS.includes(persona))
    fatal(`--persona must be one of: ${PERSONAS.join(', ')} (got: ${persona})`);
  if (!QUALITIES.includes(quality))
    fatal(`--quality must be one of: ${QUALITIES.join(', ')} (got: ${quality})`);
  if (!CHANNELS.includes(channel))
    fatal(`--channel must be one of: ${CHANNELS.join(', ')} (got: ${channel})`);
  if (flags.date && !/^\d{4}-\d{2}-\d{2}$/.test(flags.date))
    fatal(`--date must be YYYY-MM-DD (got: ${flags.date})`);

  const lead = {
    id: `lead_${Date.now()}`,
    date: flags.date || today(),
    intent: flags.intent || 'general',
    persona,
    quality,
    channel,
    source: flags.source || null,
    company: flags.company || null,
    note: flags.note || null,
    recordedAt: new Date().toISOString(),
  };

  mkdirSync(LEADS_DIR, { recursive: true });
  const line = `${JSON.stringify(lead)}\n`;
  writeFileSync(LEDGER, existsSync(LEDGER) ? readFileSync(LEDGER, 'utf-8') + line : line);

  const leads = readLedger();
  updateIndex(leads);
  log(
    `[OK] Recorded lead ${lead.id} (${lead.date} / ${lead.intent} / persona=${lead.persona} / ${lead.quality})`
  );
  log(
    `[OK] Ledger now has ${leads.length} entries (${leads.filter((l) => l.quality !== 'spam').length} real)`
  );
}

function cmdList(flags) {
  let leads = readLedger();
  if (flags.since) leads = leads.filter((l) => l.date >= flags.since);
  if (!leads.length) {
    log('[INFO] No leads recorded yet.');
    return;
  }
  for (const l of leads) {
    const parts = [
      l.date,
      `intent=${l.intent}`,
      `persona=${l.persona}`,
      l.quality,
      l.channel,
      l.source ? `src=${l.source}` : null,
      l.company,
      l.note,
    ].filter(Boolean);
    process.stdout.write(`${parts.join(' | ')}\n`);
  }
}

function cmdSummary() {
  const leads = readLedger();
  if (!leads.length) {
    log('[INFO] No leads recorded yet.');
    return;
  }
  const real = leads.filter((l) => l.quality !== 'spam');
  const group = (arr, key) => {
    const out = {};
    for (const l of arr) {
      const k = l[key] || 'unknown';
      out[k] = (out[k] || 0) + 1;
    }
    return out;
  };
  const byMonth = {};
  for (const l of real) {
    const m = l.date.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  }
  const summary = {
    total: leads.length,
    real: real.length,
    spam: leads.length - real.length,
    byMonth,
    byIntent: group(real, 'intent'),
    byPersona: group(real, 'persona'),
    byChannel: group(real, 'channel'),
    byQuality: group(leads, 'quality'),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  updateIndex(leads);
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = parseFlags(rest);
if (cmd === 'add') cmdAdd(flags);
else if (cmd === 'list') cmdList(flags);
else if (cmd === 'summary') cmdSummary();
else {
  log('Usage: node scripts/data/leads.mjs <add|list|summary> [--flags]');
  log(
    '  add --intent partner --persona B --quality high --channel referral --source column-x --company "..." --note "..."'
  );
  log('  list [--since YYYY-MM-DD]');
  log('  summary');
  process.exit(cmd ? 1 : 0);
}
