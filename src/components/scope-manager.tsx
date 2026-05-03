import { trackToolEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

type Score = 0 | 1 | 2 | 3;
type Verdict = '未判定' | '作る' | '後回し' | '作らない';
type Priority = '必須' | '推奨' | '任意' | string;

type Requirement = {
  id: string;
  category: string;
  type: string;
  priority: Priority;
  origin: string;
  body: string;
  businessValue: Score;
  usability: Score;
  techCost: Score;
  verdict: Verdict;
  notes: string;
};

const STORAGE_KEY = 'beekle-scope-manager-v1';
const SAMPLE_URL = '/docs/user-stories-sample.md';

const VERDICT_OPTIONS: Verdict[] = ['未判定', '作る', '後回し', '作らない'];

const VERDICT_STYLE: Record<Verdict, string> = {
  未判定: 'bg-gray-100 text-gray-600 border-gray-300',
  作る: 'bg-green-100 text-green-700 border-green-400',
  後回し: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  作らない: 'bg-gray-200 text-gray-500 border-gray-400 line-through',
};

const PRIORITY_STYLE: Record<string, string> = {
  必須: 'bg-red-100 text-red-700',
  推奨: 'bg-orange-100 text-orange-700',
  任意: 'bg-gray-100 text-gray-600',
};

const COST_LABEL: Record<Score, string> = { 0: '-', 1: '低', 2: '中', 3: '高' };

function parseMarkdown(md: string): Requirement[] {
  const reqs: Requirement[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(
      /^- \*\*(REQ-[A-Za-z0-9-]+)\*\*（([^・）]+)・([^・）]+)・由来:([^）]+)）\s*$/
    );
    if (!m) {
      i++;
      continue;
    }
    const [, id, type, priority, origin] = m;
    const bodyLines: string[] = [];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (/^- \*\*REQ-/.test(next) || /^#{1,6}\s/.test(next) || /^---\s*$/.test(next)) break;
      if (next.startsWith('  ')) {
        bodyLines.push(next.trim());
      } else if (next.trim() === '') {
        if (bodyLines.length > 0) break;
      } else {
        break;
      }
      i++;
    }
    const categoryMatch = id.match(/^REQ-([A-Za-z]+-\d+)-/);
    reqs.push({
      id,
      category: categoryMatch?.[1] ?? '',
      type: type.trim(),
      priority: priority.trim(),
      origin: origin.trim(),
      body: bodyLines.join(' ').trim(),
      businessValue: 0,
      usability: 0,
      techCost: 0,
      verdict: '未判定',
      notes: '',
    });
  }
  return reqs;
}

function suggestVerdict(r: Requirement): Verdict {
  if (r.businessValue === 0 || r.usability === 0 || r.techCost === 0) return r.verdict;
  const techEase = (4 - r.techCost) as Score;
  const scores: Score[] = [r.businessValue, r.usability, techEase];
  if (scores.some((s) => s === 1)) return '作らない';
  const hCount = scores.filter((s) => s === 3).length;
  if (hCount >= 2) return '作る';
  return '後回し';
}

function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: Score;
  onChange: (v: Score) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex gap-0.5" role="radiogroup">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`${n}つ星`}
          onClick={() => onChange(n === value ? 0 : (n as Score))}
          className={cn(
            'w-6 h-6 text-lg leading-none transition-colors',
            n <= value ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function CostPicker({ value, onChange }: { value: Score; onChange: (v: Score) => void }) {
  return (
    <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
      {([1, 2, 3] as Score[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          className={cn(
            'px-2 py-1 text-xs font-semibold transition-colors',
            value === n
              ? n === 1
                ? 'bg-green-500 text-white'
                : n === 2
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          {COST_LABEL[n]}
        </button>
      ))}
    </div>
  );
}

function VerdictBadge({ value, onChange }: { value: Verdict; onChange: (v: Verdict) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Verdict)}
      className={cn(
        'px-2 py-1 text-xs font-semibold rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-300',
        VERDICT_STYLE[value]
      )}
    >
      {VERDICT_OPTIONS.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
}

function exportCsv(rows: Requirement[]): string {
  const header = [
    'ID',
    'カテゴリ',
    '種別',
    '優先度',
    '要求文',
    'ビジネス価値',
    '現場で使えるか',
    '技術コスト',
    '判定',
    'メモ',
  ];
  const csvEscape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.category,
        r.type,
        r.priority,
        r.body,
        r.businessValue,
        r.usability,
        COST_LABEL[r.techCost],
        r.verdict,
        r.notes,
      ]
        .map((v) => csvEscape(String(v ?? '')))
        .join(',')
    );
  }
  return lines.join('\n');
}

function exportMarkdown(rows: Requirement[]): string {
  const star = (n: Score) => (n === 0 ? '-' : '★'.repeat(n));
  const lines: string[] = [];
  lines.push('# スコープ管理 結果（優先度判定）');
  lines.push('');
  lines.push(
    '| ID | カテゴリ | 優先度 | 要求文 | ビジネス価値 | 現場で使えるか | 技術コスト | 判定 | メモ |'
  );
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    const body = r.body.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const notes = r.notes.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(
      `| ${r.id} | ${r.category} | ${r.priority} | ${body} | ${star(r.businessValue)} | ${star(r.usability)} | ${COST_LABEL[r.techCost]} | ${r.verdict} | ${notes} |`
    );
  }
  return lines.join('\n');
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type State = { markdown: string; requirements: Requirement[] };

export function ScopeManager() {
  const [markdown, setMarkdown] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'すべて'>('すべて');
  const [filterCategory, setFilterCategory] = useState<string>('すべて');
  const [search, setSearch] = useState('');
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [parseHint, setParseHint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: State = JSON.parse(raw);
        if (parsed.markdown) setMarkdown(parsed.markdown);
        if (Array.isArray(parsed.requirements)) setRequirements(parsed.requirements);
        setLoadedFromStorage(true);
      }
    } catch {
      // ignore
    }
    trackToolEvent('tool_start', { tool: 'scope-manager' });
  }, []);

  const completeFiredRef = useRef(false);
  const exportCountRef = useRef(0);
  const fireExportEvent = (format: string) => {
    exportCountRef.current += 1;
    trackToolEvent('tool_export', { tool: 'scope-manager', meta: { format } });
    if (!completeFiredRef.current && requirements.length >= 3 && exportCountRef.current >= 1) {
      completeFiredRef.current = true;
      trackToolEvent('tool_complete', {
        tool: 'scope-manager',
        meta: { requirements: requirements.length, exports: exportCountRef.current },
      });
    }
  };

  // persist
  useEffect(() => {
    if (!loadedFromStorage && requirements.length === 0 && markdown === '') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ markdown, requirements }));
    } catch {
      // storage full or unavailable - ignore
    }
  }, [markdown, requirements, loadedFromStorage]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of requirements) if (r.category) set.add(r.category);
    return ['すべて', ...Array.from(set).sort()];
  }, [requirements]);

  const filtered = useMemo(() => {
    return requirements.filter((r) => {
      if (filterVerdict !== 'すべて' && r.verdict !== filterVerdict) return false;
      if (filterCategory !== 'すべて' && r.category !== filterCategory) return false;
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        if (!`${r.id} ${r.body} ${r.type} ${r.priority}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [requirements, filterVerdict, filterCategory, search]);

  const counts = useMemo(() => {
    const c: Record<Verdict, number> = { 未判定: 0, 作る: 0, 後回し: 0, 作らない: 0 };
    for (const r of requirements) c[r.verdict]++;
    return c;
  }, [requirements]);

  const onParse = () => {
    const parsed = parseMarkdown(markdown);
    if (parsed.length === 0) {
      setParseHint(
        '要求文を1件も検出できませんでした。`- **REQ-XXX-NNN**（種別・優先度・由来:XX）` の形式が含まれているかご確認ください。'
      );
      return;
    }
    // merge: 既存スコアを引き継ぐ
    const prev = new Map(requirements.map((r) => [r.id, r]));
    const merged = parsed.map((p) => {
      const existing = prev.get(p.id);
      return existing
        ? {
            ...p,
            businessValue: existing.businessValue,
            usability: existing.usability,
            techCost: existing.techCost,
            verdict: existing.verdict,
            notes: existing.notes,
          }
        : p;
    });
    setRequirements(merged);
    setParseHint(
      `${parsed.length}件の要求文を抽出しました。${requirements.length > 0 ? '既存スコアは引き継ぎました。' : ''}`
    );
  };

  const onLoadSample = async () => {
    trackToolEvent('tool_load_sample', { tool: 'scope-manager' });
    try {
      const res = await fetch(SAMPLE_URL);
      const text = await res.text();
      setMarkdown(text);
      setParseHint('サンプルを読み込みました。「要求文を抽出」を押してください。');
    } catch {
      setParseHint('サンプルの読み込みに失敗しました。');
    }
  };

  const updateRow = (id: string, patch: Partial<Requirement>) => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        if ('businessValue' in patch || 'usability' in patch || 'techCost' in patch) {
          next.verdict = next.verdict === '未判定' ? suggestVerdict(next) : next.verdict;
        }
        return next;
      })
    );
  };

  const onClear = () => {
    if (!confirm('入力したMarkdownと評価結果をすべてクリアします。よろしいですか？')) return;
    setMarkdown('');
    setRequirements([]);
    setParseHint(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const onApplyAutoVerdict = () => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.businessValue === 0 || r.usability === 0 || r.techCost === 0) return r;
        return { ...r, verdict: suggestVerdict(r) };
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* 入力エリア */}
      <section className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              1. ユーザーストーリー仕様書(Markdown)を読み込む
            </h2>
            <p className="text-sm text-gray-600">
              `- **REQ-XXX-NNN**（種別・優先度・由来:XX）` の形式で書かれた要求文を自動抽出します。
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 shadow-soft transition-colors"
            >
              まずサンプルで試す
            </button>
            <label className="inline-flex items-center px-4 py-3 min-h-[44px] text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
              .md ファイルを開く
              <input
                type="file"
                accept=".md,.markdown,.txt"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  setMarkdown(text);
                  setParseHint('ファイルを読み込みました。「要求文を抽出」を押してください。');
                }}
              />
            </label>
          </div>
        </div>

        {markdown.trim() === '' && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>初めての方へ</strong>: まず「<strong>まずサンプルで試す</strong>
            」を押すと、注文管理システムの要求文サンプルが入ります。 自分の要件を入れる場合は、
            <a href="/tools/story-builder" className="underline hover:text-blue-700">
              ユーザーストーリー作成ツール
            </a>
            で作ったMarkdownを貼り付けてください。
          </div>
        )}

        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder={'ここにMarkdownを貼り付け、または「まずサンプルで試す」を押してください。'}
          className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y"
        />

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button
            type="button"
            onClick={onParse}
            disabled={markdown.trim() === ''}
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            要求文を抽出
          </button>
          {requirements.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              クリア
            </button>
          )}
          {parseHint && <span className="text-sm text-gray-600">{parseHint}</span>}
        </div>
      </section>

      {/* 集計＆ツールバー */}
      {requirements.length > 0 && (
        <section className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">2. 優先度を判定する</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(VERDICT_OPTIONS as Verdict[]).map((v) => (
              <div key={v} className={cn('rounded-xl p-4 border-2', VERDICT_STYLE[v])}>
                <div className="text-xs font-semibold opacity-80">{v}</div>
                <div className="text-2xl font-bold">{counts[v]}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="要求文を検索"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'すべて' ? 'カテゴリ: すべて' : `カテゴリ: ${c}`}
                </option>
              ))}
            </select>
            <select
              value={filterVerdict}
              onChange={(e) => setFilterVerdict(e.target.value as Verdict | 'すべて')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="すべて">判定: すべて</option>
              {VERDICT_OPTIONS.map((v) => (
                <option key={v} value={v}>{`判定: ${v}`}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={onApplyAutoVerdict}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              title="3項目すべてに評価がある行に対して、判定を自動推定します"
            >
              判定を自動推定
            </button>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadFile('scope-result.csv', exportCsv(requirements), 'text/csv');
                  fireExportEvent('csv');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                CSV出力
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadFile('scope-result.md', exportMarkdown(requirements), 'text/markdown');
                  fireExportEvent('markdown');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Markdown出力
              </button>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto -mx-6 md:-mx-8">
            <div className="inline-block min-w-full px-6 md:px-8">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">
                    <th className="px-2 py-3 whitespace-nowrap">ID</th>
                    <th className="px-2 py-3 whitespace-nowrap">優先度</th>
                    <th className="px-2 py-3 whitespace-nowrap">種別</th>
                    <th className="px-2 py-3 min-w-[280px]">要求文</th>
                    <th className="px-2 py-3 whitespace-nowrap">ビジネス価値</th>
                    <th className="px-2 py-3 whitespace-nowrap">現場で使えるか</th>
                    <th className="px-2 py-3 whitespace-nowrap">技術コスト</th>
                    <th className="px-2 py-3 whitespace-nowrap">判定</th>
                    <th className="px-2 py-3 min-w-[160px]">メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-3 align-top whitespace-nowrap font-mono text-xs text-gray-700">
                        {r.id}
                      </td>
                      <td className="px-2 py-3 align-top whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-semibold',
                            PRIORITY_STYLE[r.priority] ?? 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-2 py-3 align-top whitespace-nowrap text-xs text-gray-600">
                        {r.type}
                      </td>
                      <td className="px-2 py-3 align-top text-gray-800 leading-relaxed">
                        {r.body}
                      </td>
                      <td className="px-2 py-3 align-top">
                        <StarPicker
                          value={r.businessValue}
                          onChange={(v) => updateRow(r.id, { businessValue: v })}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <StarPicker
                          value={r.usability}
                          onChange={(v) => updateRow(r.id, { usability: v })}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <CostPicker
                          value={r.techCost}
                          onChange={(v) => updateRow(r.id, { techCost: v })}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <VerdictBadge
                          value={r.verdict}
                          onChange={(v) => updateRow(r.id, { verdict: v })}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <input
                          type="text"
                          value={r.notes}
                          onChange={(e) => updateRow(r.id, { notes: e.target.value })}
                          placeholder="議事メモなど"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-300"
                        />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        条件に合う要求文がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            データはお使いのブラウザにのみ保存されます（サーバーには送信されません）。別の端末で続きを行いたい場合はCSV/Markdown出力をご利用ください。
          </p>
        </section>
      )}
    </div>
  );
}
