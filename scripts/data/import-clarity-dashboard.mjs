/**
 * Clarity main dashboard CSV → marketing data hub.
 *
 * Clarity のメインダッシュボード export (トラフィック/挙動: Sessions, Scroll depth,
 * Top pages, Referrer, Smart events, Bot traffic, Web Vitals 等) を正規化して取り込む。
 * ※ AI Citations とは別 export。AI引用は import-clarity-citations.mjs。
 *
 * CSV 構造 (キー・バリュー + 小テーブルのセクション連結):
 *   "Metric","Sessions"
 *   "","Total sessions","842"
 *   "","Bot sessions","131"
 *   "Metric","Insights","No. of sessions","% of sessions"
 *   "","Dead click","169","20.07%"
 *   "Metric","Top pages","No. of sessions"
 *   "","https://beekle.jp/...","208"
 *   "Metric","Referrer","No. of sessions"
 *   "","chatgpt.com","8"
 *   "Metric","Bot traffic"
 *   "webScraperBotSessions","41"
 *
 * 使い方:
 *   node scripts/data/import-clarity-dashboard.mjs                 # ~/Downloads の最新 Clarity_*.csv を自動選択
 *   node scripts/data/import-clarity-dashboard.mjs --file /path/to.csv
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import { log, recordRefresh, writeRaw, writeSnapshot } from './lib.mjs';

function parseArgs(argv) {
  const args = { file: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file' && argv[i + 1]) args.file = argv[++i];
    else if (a === '--help' || a === '-h') {
      log('Usage: node scripts/data/import-clarity-dashboard.mjs [--file /path/to/Clarity_*.csv]');
      process.exit(0);
    }
  }
  return args;
}

function findLatestCsv() {
  const dir = join(homedir(), 'Downloads');
  if (!existsSync(dir)) return null;
  const cands = readdirSync(dir)
    .filter((f) => /^Clarity_.*\.csv$/i.test(f))
    .map((f) => ({ path: join(dir, f), mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return cands.length ? cands[0].path : null;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

const numOrStr = (s) => {
  if (s == null || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : s;
};

/**
 * セクション連結 CSV を汎用パース。
 * 各 "Metric" 行で新セクション開始。以降の行を {cells:[...]} として溜める。
 * → { meta, sections: { <name>: { headers, rows } }, derived: {...} }
 */
function parseDashboard(text) {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).map((l) => (l.trim() === '' ? null : parseCsvLine(l)));

  const out = { projectName: null, dateRange: null, sections: {} };
  let current = null;

  for (const cols of lines) {
    if (!cols) continue;
    const [c0, c1] = cols;
    if (c0 === 'Project name') {
      out.projectName = c1;
      continue;
    }
    if (c0 === 'Date range') {
      out.dateRange = c1;
      continue;
    }
    if (c0 === 'Metric') {
      // c1 = セクション名。c2 以降があれば列ヘッダ (例: No. of sessions / % of sessions)
      const name = c1;
      current = { headers: cols.slice(2).filter(Boolean), rows: [] };
      out.sections[name] = current;
      continue;
    }
    // Bot traffic セクションは "webScraperBotSessions","41" 形式 (c0 に key)
    if (current && c0 && c0 !== '') {
      if (c0 === '__typename') continue;
      current.rows.push({ label: c0, values: cols.slice(1).map(numOrStr) });
      continue;
    }
    // 通常データ行: "","<label>","<v>",("<pct>")
    if (current && c0 === '') {
      const label = c1;
      if (label == null || label === '') continue;
      current.rows.push({ label, values: cols.slice(2).map(numOrStr) });
    }
  }
  return out;
}

/** セクションから {label: value} の素直な辞書を作る (先頭 value を採用) */
function sectionMap(section) {
  const m = {};
  if (!section) return m;
  for (const r of section.rows) m[r.label] = r.values[0];
  return m;
}

function deriveHighlights(parsed) {
  const s = parsed.sections;
  const sessions = sectionMap(s.Sessions);
  const insights = sectionMap(s.Insights);
  const smart =
    s['Smart events']?.rows.map((r) => ({
      event: r.label,
      sessions: r.values[0],
      pct: r.values[1],
    })) || [];
  const referrers =
    s.Referrer?.rows.map((r) => ({ referrer: r.label, sessions: r.values[0] })) || [];
  const topPages =
    s['Top pages']?.rows.map((r) => ({
      url: (r.label || '').replace('https://beekle.jp', '') || '/',
      sessions: r.values[0],
    })) || [];
  const perf = sectionMap(s['Performance overview']);
  const bot = sectionMap(s['Bot traffic']);

  const total = sessions['Total sessions'] ?? null;
  const botSessions = sessions['Bot sessions'] ?? null;

  // AI アシスタント経由の referrer を抽出
  const AI_RE =
    /chatgpt|openai|claude\.ai|anthropic|perplexity|notebooklm|gemini|copilot|bing.*chat/i;
  const aiReferrers = referrers.filter((r) => AI_RE.test(r.referrer));

  return {
    sessionsTotal: total,
    botSessions,
    botPct: total && botSessions != null ? +((botSessions / total) * 100).toFixed(1) : null,
    scrollDepthAvg: sectionMap(s['Scroll depth'])['Average'] ?? null,
    deadClicks: insights['Dead click'] ?? null,
    rageClicks: insights['Rage clicks'] ?? null,
    quickBackClicks: insights['Quick back click'] ?? null,
    smartEvents: smart,
    aiReferrers,
    topReferrers: referrers.slice(0, 12),
    topPages: topPages.slice(0, 15),
    performance: perf,
    botTraffic: bot,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const csvPath = args.file || findLatestCsv();
  if (!csvPath || !existsSync(csvPath)) {
    log(`[ERROR] Clarity CSV が見つからない (${csvPath || 'none'})。--file で指定。`);
    process.exit(1);
  }

  const text = readFileSync(csvPath, 'utf-8');

  // 誤ファイルガード: AI Citations export を渡された場合はこちらでは扱わない
  if (/FullyCitedQueries|"Query","SoA","Citations"/.test(text)) {
    log(
      `[ERROR] これは AI Citations export のよう (src=${basename(csvPath)})。→ node scripts/data/import-clarity-citations.mjs`
    );
    process.exit(1);
  }

  const parsed = parseDashboard(text);
  if (Object.keys(parsed.sections).length === 0) {
    log(
      `[ERROR] ダッシュボードのセクションを検出できない (src=${basename(csvPath)})。フォーマット変更の可能性。`
    );
    process.exit(1);
  }

  const derived = deriveHighlights(parsed);
  const payload = {
    meta: {
      sourceFile: basename(csvPath),
      dateRange: parsed.dateRange,
      projectName: parsed.projectName,
    },
    highlights: derived,
    sections: parsed.sections,
  };

  writeSnapshot('clarity', 'dashboard', payload);
  writeRaw('clarity', basename(csvPath), text);

  recordRefresh('clarity-dashboard', {
    files: ['dashboard.json'],
    dateRange: (() => {
      const m = (parsed.dateRange || '').match(/([\d/]+)[^-]*-\s*([\d/]+)/);
      return m ? { startDate: m[1], endDate: m[2] } : undefined;
    })(),
    stats: {
      sessions: derived.sessionsTotal,
      botPct: derived.botPct,
      deadClicks: derived.deadClicks,
      aiReferrerSessions: derived.aiReferrers.reduce((a, r) => a + (r.sessions || 0), 0),
    },
    note: `トラフィック/挙動 (bot ${derived.botPct}%, deadClick ${derived.deadClicks}). src: ${basename(csvPath)}`,
  });

  log(
    `[OK] Clarity dashboard: sessions=${derived.sessionsTotal} (bot ${derived.botPct}%), scroll=${derived.scrollDepthAvg}%, deadClick=${derived.deadClicks}, AI referrer=${derived.aiReferrers.map((r) => `${r.referrer}:${r.sessions}`).join(', ') || 'なし'}`
  );
}

main();
