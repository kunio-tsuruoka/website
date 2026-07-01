/**
 * Marketing data hub — shared helpers.
 *
 * 目的: 散らばったマーケデータ (GSC / GA4 / Clarity / DataForSEO 等) を
 * `docs/marketing/data/` の単一ハブに、日付き + latest の正規化 JSON で落とす。
 * どのセッションの LLM も「latest を読めば最新、日付ディレクトリで時系列比較」
 * ができる状態を作るための土台。
 *
 * ハブ構造:
 *   docs/marketing/data/
 *     index.json              全ソースの最終更新サマリ (機械可読)
 *     README.md               人間/LLM 向けインデックス (自動生成)
 *     <source>/
 *       <YYYY-MM-DD>/<name>.json   その日のスナップショット
 *       latest/<name>.json         最新スナップショット (上書き)
 *
 * docs/marketing/ は .gitignore 済 (ローカル専用)。データは commit されない。
 * 取得スクリプト (scripts/data/*) と skill だけが commit される。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, '../..');
export const HUB = resolve(REPO_ROOT, 'docs/marketing/data');

/** 実行日 (YYYY-MM-DD, ローカルタイム) */
export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nowIso() {
  return new Date().toISOString();
}

/**
 * 正規化 JSON をハブに書き込む。日付きと latest の両方に同じ内容を出力。
 * @returns {{datedPath: string, latestPath: string}}
 */
export function writeSnapshot(source, name, payload) {
  const date = today();
  const datedDir = join(HUB, source, date);
  const latestDir = join(HUB, source, 'latest');
  mkdirSync(datedDir, { recursive: true });
  mkdirSync(latestDir, { recursive: true });

  const body = `${JSON.stringify(payload, null, 2)}\n`;
  const datedPath = join(datedDir, `${name}.json`);
  const latestPath = join(latestDir, `${name}.json`);
  writeFileSync(datedPath, body);
  writeFileSync(latestPath, body);
  return { datedPath, latestPath };
}

/** 生ファイル (CSV 等) をハブに保存して provenance を残す */
export function writeRaw(source, filename, contents) {
  const date = today();
  const dir = join(HUB, source, date, 'raw');
  mkdirSync(dir, { recursive: true });
  const p = join(dir, filename);
  writeFileSync(p, contents);
  return p;
}

function readIndex() {
  const p = join(HUB, 'index.json');
  if (!existsSync(p)) return { sources: {} };
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return { sources: {} };
  }
}

/**
 * index.json にソースの最終更新を記録する。
 * @param {string} source
 * @param {object} summary { files: string[], stats?: object, dateRange?: object, note?: string }
 */
export function recordRefresh(source, summary) {
  mkdirSync(HUB, { recursive: true });
  const index = readIndex();
  index.sources[source] = {
    lastRefresh: nowIso(),
    lastDate: today(),
    ...summary,
  };
  index.updatedAt = nowIso();
  writeFileSync(join(HUB, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  regenerateReadme(index);
  return index;
}

/** index.json から人間/LLM 向けの README を自動生成 */
export function regenerateReadme(index = readIndex()) {
  const lines = [];
  lines.push('# Marketing Data Hub');
  lines.push('');
  lines.push(
    'マーケ計測データの正規化スナップショット置き場。**このディレクトリは gitignore 済 (ローカル専用)**。'
  );
  lines.push('');
  lines.push(
    '分析を始める前に、まず各ソースの `latest/` を読むこと。日付ディレクトリで時系列比較ができる。'
  );
  lines.push('取得方法・MCP系ソースのレシピは `.claude/skills/marketing-data/SKILL.md` を参照。');
  lines.push('');
  lines.push(`最終更新: ${index.updatedAt || '(なし)'}`);
  lines.push('');
  lines.push('## ソース別 最終更新');
  lines.push('');
  lines.push('| ソース | 最終取得 | 対象期間 | ファイル | 備考 |');
  lines.push('|---|---|---|---|---|');
  const sources = index.sources || {};
  for (const [name, s] of Object.entries(sources)) {
    const range = s.dateRange ? `${s.dateRange.startDate}〜${s.dateRange.endDate}` : '-';
    const files = (s.files || []).join(', ') || '-';
    const note = s.note || '';
    lines.push(`| ${name} | ${s.lastDate || '-'} | ${range} | ${files} | ${note} |`);
  }
  lines.push('');
  lines.push('## 読み方の例');
  lines.push('');
  lines.push('```');
  lines.push(
    'docs/marketing/data/gsc/latest/ctr-opportunities.json   # CTR改善余地 (pos5-20/低CTR)'
  );
  lines.push(
    'docs/marketing/data/ga4/latest/content-group.json       # content_group別 セッション/CV'
  );
  lines.push('docs/marketing/data/clarity/latest/ai-citations.json    # AI検索の引用クエリ + SoA');
  lines.push('```');
  lines.push('');
  writeFileSync(join(HUB, 'README.md'), `${lines.join('\n')}\n`);
}

/** CLI ログ (stderr にそろえて stdout は JSON 用に空ける流儀と両立) */
export function log(msg) {
  process.stderr.write(`${msg}\n`);
}
