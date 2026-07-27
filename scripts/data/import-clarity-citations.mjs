/**
 * Clarity AI Citations CSV → marketing data hub.
 *
 * Clarity の AI Visibility → AI Citations はダッシュボード export のみ (API 非対応)。
 * ~/Downloads に落ちたセクション区切り CSV を正規化 JSON にしてハブに取り込む。
 * これで「Downloads のどのファイル？」の摩擦を無くし、LLM が latest を読むだけで済む。
 *
 * CSV 構造 (セクション区切り):
 *   "Project name","..."
 *   "Date range","03/02/2026 00:00 - 06/19/2026 23:59"
 *   "FullyCitedQueries"
 *   "Metric","Share of authority (SoA)","20.55..."
 *   "Query","SoA","Citations"
 *   "要求と要件の違い","17.97%","69"
 *   ...
 *   "Metric","Page citations","1335"
 *   "Metric","AI referral traffic","0.228..."
 *
 * 使い方:
 *   node scripts/data/import-clarity-citations.mjs                  # Downloads の最新 Clarity_*.csv を自動選択
 *   node scripts/data/import-clarity-citations.mjs --file /path/to.csv
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
      log('Usage: node scripts/data/import-clarity-citations.mjs [--file /path/to/Clarity_*.csv]');
      process.exit(0);
    }
  }
  return args;
}

/** ~/Downloads で最新の Clarity_*.csv を探す */
function findLatestCsv() {
  const dir = join(homedir(), 'Downloads');
  if (!existsSync(dir)) return null;
  const cands = readdirSync(dir)
    .filter((f) => /^Clarity_.*\.csv$/i.test(f))
    .map((f) => ({ path: join(dir, f), mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return cands.length ? cands[0].path : null;
}

/** RFC4180 相当の 1行 CSV パーサ (クォート内カンマ/エスケープ対応、単一行想定) */
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

function pctToNum(s) {
  const n = Number(String(s).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
}

function parseClarityCsv(text) {
  // BOM 除去
  const clean = text.replace(/^﻿/, '');
  const rows = clean
    .split(/\r?\n/)
    .map((l) => (l.trim() === '' ? null : parseCsvLine(l)))
    .filter(Boolean);

  const result = {
    projectName: null,
    dateRange: null,
    soa: null,
    pageCitations: null,
    aiReferralTraffic: null,
    queries: [],
    pages: [],
    topics: [],
  };

  // AI Citations export はサブテーブルが3種類あり得る:
  //   "Query",...    → クエリ別引用 (mode='query')
  //   "Page URL",... → ページ別引用 (mode='page')
  //   "Topic",...    → テーマ別引用 (mode='topic', 2026-07-22 の export から登場)
  //
  // Clarity は列の「順序」も予告なく変える (2026-07-13 に SoA と Citations が入れ替わった)。
  // 固定順で一致を見るとテーブルが丸ごと0件になりエラーも出ないため、
  // 必ず列名 → index の対応で解決する。詳細は .claude/rules/analytics-ga4.md。
  const TABLE_HEADS = { Query: 'query', Topic: 'topic', 'Page URL': 'page' };

  let mode = null;
  let idx = null;
  // SoA はスカラー ("Metric","Share of authority (SoA)","20.55") と
  // 表形式 ("Metric","Share of authority (SoA)","Citations","Percentage" → 次行 "","You",...) がある。
  let soaTableMode = false;

  for (const cols of rows) {
    const [c0, c1, c2] = cols;

    if (c0 === 'Project name') {
      result.projectName = c1;
      continue;
    }
    if (c0 === 'Date range') {
      result.dateRange = c1;
      continue;
    }

    // テーブルヘッダの判定は SoA 表モードの行スキップより「先」に行う。
    // 逆順にすると SoA 表モードが後続の Query ヘッダを食い潰して 0 件になる。
    if (TABLE_HEADS[c0]) {
      mode = TABLE_HEADS[c0];
      soaTableMode = false;
      idx = { label: 0, citations: null, soa: null };
      cols.forEach((name, i) => {
        const n = String(name).trim();
        if (i === 0) return;
        if (/^Citations$/i.test(n)) idx.citations = i;
        else if (/^SoA$/i.test(n) || /Share of authority/i.test(n)) idx.soa = i;
      });
      continue;
    }

    if (c0 === 'Metric') {
      mode = null;
      idx = null;
      if (/Share of authority/i.test(c1 || '')) {
        const n = Number(c2);
        if (Number.isFinite(n)) result.soa = n;
        else soaTableMode = true;
      } else if (/Page citations/i.test(c1 || '')) result.pageCitations = Number(c2);
      else if (/AI referral traffic/i.test(c1 || '')) result.aiReferralTraffic = Number(c2);
      continue;
    }

    // SoA 表形式の本体行: "","You","528","23.78%" → 最終列のパーセントを採る
    if (soaTableMode) {
      if (/^you$/i.test(String(c1 || '').trim())) {
        result.soa = pctToNum(cols[cols.length - 1]);
        soaTableMode = false;
      }
      continue;
    }

    if (!mode || !idx || !c0) continue;
    const citations = idx.citations == null ? null : Number(cols[idx.citations]);
    const soaPct = idx.soa == null ? null : pctToNum(cols[idx.soa]);
    if (mode === 'query') result.queries.push({ query: c0, soaPct, citations });
    else if (mode === 'topic') result.topics.push({ topic: c0, soaPct, citations });
    else if (mode === 'page' && /^https?:\/\//.test(c0))
      result.pages.push({ url: c0.replace('https://beekle.jp', '') || '/', citations });
  }

  result.queries.sort((a, b) => b.citations - a.citations);
  result.pages.sort((a, b) => b.citations - a.citations);
  result.topics.sort((a, b) => b.citations - a.citations);
  return result;
}

function main() {
  const args = parseArgs(process.argv);
  const csvPath = args.file || findLatestCsv();
  if (!csvPath) {
    log(
      '[ERROR] Clarity CSV が見つからない。Clarity ダッシュボードで AI Citations を export して ~/Downloads に置くか --file で指定。'
    );
    process.exit(1);
  }
  if (!existsSync(csvPath)) {
    log(`[ERROR] file not found: ${csvPath}`);
    process.exit(1);
  }

  const text = readFileSync(csvPath, 'utf-8');
  const parsed = parseClarityCsv(text);

  // 空上書き防止: どちらのサブテーブル (Query別 / Page別) も検出できない CSV
  // (メインダッシュボード export 等) は、既存の引用データを空で潰さないよう中止する。
  if (parsed.queries.length === 0 && parsed.pages.length === 0 && parsed.topics.length === 0) {
    log(
      `[ERROR] AI Citations の Query別/Page別/Topic別テーブルをいずれも検出できない (src=${basename(csvPath)})。`
    );
    log(
      '  - AI引用: Clarity → AI Visibility → AI Citations → Export (Queries または Pages ビュー)'
    );
    log(
      '  - メインダッシュボード(トラフィック/挙動)なら: node scripts/data/import-clarity-dashboard.mjs --file <csv>'
    );
    log('  上書きを中止した (既存の引用データは保持)。');
    process.exit(1);
  }

  const meta = {
    sourceFile: basename(csvPath),
    dateRange: parsed.dateRange,
    projectName: parsed.projectName,
  };
  const dateRange = (() => {
    const m = (parsed.dateRange || '').match(/([\d/]+)[^-]*-\s*([\d/]+)/);
    return m ? { startDate: m[1], endDate: m[2] } : undefined;
  })();
  const written = [];

  // Query別 (存在すれば ai-citations.json を更新)
  if (parsed.queries.length > 0) {
    writeSnapshot('clarity', 'ai-citations', {
      meta,
      soa: parsed.soa,
      pageCitations: parsed.pageCitations,
      aiReferralTraffic: parsed.aiReferralTraffic,
      queryCount: parsed.queries.length,
      queries: parsed.queries,
    });
    written.push('ai-citations.json');
  }

  // Page別 (存在すれば ai-citation-pages.json を更新。Query版とは別ファイルで共存)
  if (parsed.pages.length > 0) {
    writeSnapshot('clarity', 'ai-citation-pages', {
      meta,
      soa: parsed.soa,
      pageCitations: parsed.pageCitations,
      aiReferralTraffic: parsed.aiReferralTraffic,
      pageCount: parsed.pages.length,
      pages: parsed.pages,
    });
    written.push('ai-citation-pages.json');
  }

  // Topic別 (2026-07-22 の export から登場。テーマ単位の引用量と SoA)
  if (parsed.topics.length > 0) {
    writeSnapshot('clarity', 'ai-citation-topics', {
      meta,
      soa: parsed.soa,
      pageCitations: parsed.pageCitations,
      aiReferralTraffic: parsed.aiReferralTraffic,
      topicCount: parsed.topics.length,
      topics: parsed.topics,
    });
    written.push('ai-citation-topics.json');
  }

  writeRaw('clarity', basename(csvPath), text); // provenance

  recordRefresh(
    parsed.pages.length > 0 && parsed.queries.length === 0 ? 'clarity-pages' : 'clarity',
    {
      files: written,
      dateRange,
      stats: {
        queries: parsed.queries.length,
        pages: parsed.pages.length,
        topics: parsed.topics.length,
        soa: parsed.soa,
        pageCitations: parsed.pageCitations,
        topQuery: parsed.queries[0]?.query || null,
        topPage: parsed.pages[0]?.url || null,
      },
      note: `AI引用 (${written.join(' + ')}, source: ${basename(csvPath)})`,
    }
  );

  log(
    `[OK] Clarity AI Citations: ${parsed.queries.length} queries / ${parsed.pages.length} pages / ${parsed.topics.length} topics, SoA=${parsed.soa?.toFixed?.(2)}%, pageCitations=${parsed.pageCitations}. → ${written.join(', ')}`
  );
}

main();
