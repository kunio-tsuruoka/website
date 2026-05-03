import { STORY_TEMPLATES } from '@/data/story-builder-templates';
import { trackToolEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

const MAX_IMPORT_BYTES = 2_000_000;

type EarsType = '常時' | 'イベント駆動' | '状態駆動' | 'オプション' | '異常系';
type Priority = '必須' | '推奨' | '任意';

type Requirement = {
  id: string;
  type: EarsType;
  priority: Priority;
  origin: string;
  text: string;
  category?: string;
};

type UseCase = {
  id: string;
  name: string;
  summary: string;
  actors: { main: string; related: string[] };
  businessValue: string[];
  preconditions: string[];
  happy: Requirement[];
  unwanted: Requirement[];
  boundary: Requirement[];
  ui: { element: string; content: string }[];
  notifications: string[];
  checklist: string[];
};

type ApiResult = {
  title: string;
  intro: string;
  story: { systemName: string; role: string; want: string; benefit: string };
  usecase: UseCase;
};

const SAMPLE_TEXT = `社内の経費精算をスマホアプリでやれるようにしたい。
営業担当者が出張先でタクシーや電車を使ったときに、写真で領収書を撮ってその場で申請できるようにしたい。
帰社後に紙の領収書をまとめる手間をなくして、月末の精算作業を減らしたい。
承認は上長が行い、承認後は経理に自動で連携される想定。`;

const PRIORITY_STYLE: Record<Priority, string> = {
  必須: 'bg-red-100 text-red-700',
  推奨: 'bg-orange-100 text-orange-700',
  任意: 'bg-gray-100 text-gray-600',
};

const TYPE_STYLE: Record<EarsType, string> = {
  常時: 'bg-blue-100 text-blue-700',
  イベント駆動: 'bg-primary-100 text-primary-700',
  状態駆動: 'bg-cyan-100 text-cyan-700',
  オプション: 'bg-purple-100 text-purple-700',
  異常系: 'bg-amber-100 text-amber-800',
};

export function StoryBuilder() {
  const [description, setDescription] = useState(SAMPLE_TEXT);
  const [happyCount, setHappyCount] = useState(5);
  const [unwantedCount, setUnwantedCount] = useState(4);
  const [boundaryCount, setBoundaryCount] = useState(2);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeFiredRef = useRef(false);
  const exportCountRef = useRef(0);

  useEffect(() => {
    trackToolEvent('tool_start', { tool: 'story-builder' });
  }, []);

  const fireExportEvent = (format: string) => {
    exportCountRef.current += 1;
    trackToolEvent('tool_export', { tool: 'story-builder', meta: { format } });
    if (!completeFiredRef.current && result && exportCountRef.current >= 1) {
      completeFiredRef.current = true;
      trackToolEvent('tool_complete', {
        tool: 'story-builder',
        meta: { exports: exportCountRef.current },
      });
    }
  };

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setError(`ファイルが大きすぎます（${Math.round(MAX_IMPORT_BYTES / 1_000_000)}MBまで）`);
      e.target.value = '';
      return;
    }
    try {
      const isDocx =
        file.name.toLowerCase().endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let text: string;
      if (isDocx) {
        const mammoth = await import('mammoth/mammoth.browser');
        const buffer = await file.arrayBuffer();
        const out = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = out.value;
      } else {
        text = await file.text();
      }
      setDescription(text.trim());
      setResult(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? `読み込みエラー: ${err.message}` : 'ファイルを読み込めませんでした'
      );
    } finally {
      e.target.value = '';
    }
  }

  function loadSample() {
    setDescription(SAMPLE_TEXT);
    setResult(null);
    setError(null);
    trackToolEvent('tool_load_sample', { tool: 'story-builder' });
  }

  function clearAll() {
    setDescription('');
    setResult(null);
    setError(null);
  }

  async function generate() {
    if (!description.trim()) {
      setError('やりたいことを文章で書いてください');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, happyCount, unwantedCount, boundaryCount }),
      });
      const data = (await res.json()) as
        | ({ success: true } & ApiResult)
        | { success: false; error: string; detail?: string };
      if (!data.success) {
        throw new Error(data.error + (data.detail ? `: ${data.detail}` : ''));
      }
      const { success: _ignored, ...rest } = data;
      setResult(rest);
      trackToolEvent('tool_save', { tool: 'story-builder', meta: { source: 'ai-generate' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function downloadMarkdown() {
    if (!result) return;
    const md = buildMarkdown(result);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.usecase.id || 'user-story'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    fireExportEvent('markdown');
  }

  function copyMarkdown() {
    if (!result) return;
    navigator.clipboard.writeText(buildMarkdown(result));
    fireExportEvent('clipboard');
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900">1. やりたいことを文章で書く</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-primary-500 border border-primary-200 rounded-md hover:bg-primary-50"
            >
              ファイルを読み込む（.txt / .md / .docx）
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={importFile}
              className="hidden"
            />
            <select
              defaultValue=""
              onChange={(e) => {
                const tpl = STORY_TEMPLATES.find((t) => t.id === e.target.value);
                if (!tpl) return;
                setDescription(tpl.text);
                setResult(null);
                setError(null);
                trackToolEvent('tool_load_template', {
                  tool: 'story-builder',
                  meta: { template: tpl.id },
                });
                e.target.value = '';
              }}
              className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-primary-700 bg-primary-50 border-2 border-primary-200 rounded-md hover:bg-primary-100 cursor-pointer"
            >
              <option value="" disabled>
                業界別テンプレートから始める ▾
              </option>
              {STORY_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（{t.industry}）
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadSample}
              className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-primary-500 border border-primary-200 rounded-md hover:bg-primary-50"
            >
              サンプルを試す
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              クリア
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          作りたいシステムや機能を、ふだんの言葉で書いてください。AIが
          <strong>ユースケース仕様書</strong>
          （概要・登場人物・正常系/異常系/境界値・確認チェック）に 整理します。出力は
          <strong>スコープ管理ツールに取り込み可能</strong>な形式です。
        </p>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          placeholder="例：社内の経費精算をスマホアプリでやれるようにしたい..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 leading-relaxed"
        />

        <p className="mt-4 text-xs text-gray-600">
          AIに何件ずつ生成させますか?
          <span className="ml-2 text-gray-400">
            （正常系=うまくいく場合／異常系=エラー時／境界値=制限ぎりぎり）
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <CountSelect
            label="正常系"
            value={happyCount}
            onChange={setHappyCount}
            options={[3, 5, 6, 8]}
          />
          <CountSelect
            label="異常系"
            value={unwantedCount}
            onChange={setUnwantedCount}
            options={[3, 4, 5, 6, 8]}
          />
          <CountSelect
            label="境界値"
            value={boundaryCount}
            onChange={setBoundaryCount}
            options={[1, 2, 3, 5]}
          />
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className={cn(
              'px-5 py-2 text-sm font-semibold text-white rounded-md',
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
            )}
          >
            {loading ? 'AIが整理中…（30〜60秒）' : 'AIで仕様書を生成'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {result && (
        <>
          <Card title={`2. ${result.title}`}>
            {result.intro && (
              <p className="text-sm text-gray-700 leading-relaxed">{result.intro}</p>
            )}
            <div className="mt-4 p-4 bg-primary-50/60 border border-primary-100 rounded-lg">
              <p className="text-xs font-semibold text-primary-700 mb-1">ユーザーストーリー</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">{result.story.role}</span>として、
                <span className="font-semibold">{result.story.want}</span>。
                {result.story.benefit && (
                  <>
                    <br />
                    なぜなら、<span className="font-semibold">{result.story.benefit}</span>から。
                  </>
                )}
              </p>
            </div>
          </Card>

          <Card title={`3. ユースケース ${result.usecase.id}. ${result.usecase.name}`}>
            <Section heading="概要">
              <p className="text-sm text-gray-700 leading-relaxed">{result.usecase.summary}</p>
            </Section>

            <Section heading="登場人物">
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>主役：</strong> {result.usecase.actors.main}
                </li>
                {result.usecase.actors.related.length > 0 && (
                  <li>
                    <strong>関係者：</strong> {result.usecase.actors.related.join('、')}
                  </li>
                )}
              </ul>
            </Section>

            {result.usecase.businessValue.length > 0 && (
              <Section heading="ビジネス価値">
                <BulletList items={result.usecase.businessValue} />
              </Section>
            )}

            {result.usecase.preconditions.length > 0 && (
              <Section heading="前提">
                <BulletList items={result.usecase.preconditions} />
              </Section>
            )}

            <Section heading="シナリオ">
              {result.usecase.happy.length > 0 && (
                <ReqGroup label="正常系" reqs={result.usecase.happy} />
              )}
              {result.usecase.unwanted.length > 0 && (
                <ReqGroup label="異常系" reqs={result.usecase.unwanted} />
              )}
              {result.usecase.boundary.length > 0 && (
                <ReqGroup label="境界値" reqs={result.usecase.boundary} />
              )}
            </Section>

            {result.usecase.ui.length > 0 && (
              <Section heading="画面で見えるもの">
                <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-gray-600 font-semibold w-1/3">
                        要素
                      </th>
                      <th className="px-3 py-2 text-left text-xs text-gray-600 font-semibold">
                        内容
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.usecase.ui.map((u) => (
                      <tr key={u.element} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-700 align-top">{u.element}</td>
                        <td className="px-3 py-2 text-gray-700">{u.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}

            {result.usecase.notifications.length > 0 && (
              <Section heading="メール／通知">
                <BulletList items={result.usecase.notifications} />
              </Section>
            )}

            {result.usecase.checklist.length > 0 && (
              <Section heading="確認チェック">
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {result.usecase.checklist.map((c) => (
                    <li key={c} className="flex gap-2">
                      <input type="checkbox" className="mt-1" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </Card>

          <Card title="4. エクスポート">
            <p className="text-sm text-gray-600 mb-3">
              スコープ管理ツールに取り込める Markdown
              形式で出力します。「作る／後回し／作らない」の判定は{' '}
              <a href="/tools/scope-manager" className="text-primary-500 hover:underline">
                スコープ管理ツール
              </a>
              でどうぞ。
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadMarkdown}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600"
              >
                Markdownをダウンロード
              </button>
              <button
                type="button"
                onClick={copyMarkdown}
                className="px-4 py-2 text-sm font-semibold text-primary-500 border border-primary-300 rounded-md hover:bg-primary-50"
              >
                クリップボードにコピー
              </button>
            </div>
            <details className="mt-4">
              <summary className="text-sm text-gray-600 cursor-pointer">Markdownプレビュー</summary>
              <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                {buildMarkdown(result)}
              </pre>
            </details>
          </Card>
        </>
      )}
    </div>
  );
}

function CountSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  options: number[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}件
          </option>
        ))}
      </select>
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="text-sm font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
        {heading}
      </h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 leading-relaxed">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

function ReqGroup({ label, reqs }: { label: string; reqs: Requirement[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs font-bold text-gray-600 mb-2">{label}</h4>
      <ul className="space-y-2">
        {reqs.map((r) => (
          <li key={r.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs text-gray-700">{r.id}</span>
              <span className={cn('px-2 py-0.5 text-xs rounded-full', TYPE_STYLE[r.type])}>
                {r.type}
              </span>
              <span className={cn('px-2 py-0.5 text-xs rounded-full', PRIORITY_STYLE[r.priority])}>
                {r.priority}
              </span>
              {r.category && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {r.category}
                </span>
              )}
              <span className="text-xs text-gray-400">由来: {r.origin}</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildMarkdown(r: ApiResult): string {
  const lines: string[] = [];
  const u = r.usecase;

  lines.push(`# ${r.title}`);
  lines.push('');
  if (r.intro) {
    lines.push('## このドキュメントについて');
    lines.push('');
    lines.push(r.intro);
    lines.push('');
  }

  lines.push('## ストーリー');
  lines.push('');
  lines.push(`- **対象システム**: ${r.story.systemName}`);
  lines.push(`- **誰が（As a）**: ${r.story.role}`);
  lines.push(`- **何をしたい（I want）**: ${r.story.want}`);
  lines.push(`- **なぜ（So that）**: ${r.story.benefit}`);
  lines.push('');

  lines.push(`## ${u.id}. ${u.name}`);
  lines.push('');

  lines.push('### 概要');
  lines.push('');
  lines.push(u.summary);
  lines.push('');

  lines.push('### 登場人物');
  lines.push('');
  lines.push(`- **主役**: ${u.actors.main}`);
  if (u.actors.related.length > 0) {
    lines.push(`- **関係者**: ${u.actors.related.join('、')}`);
  }
  lines.push('');

  if (u.businessValue.length > 0) {
    lines.push('### ビジネス価値');
    lines.push('');
    for (const v of u.businessValue) lines.push(`- ${v}`);
    lines.push('');
  }

  if (u.preconditions.length > 0) {
    lines.push('### 前提');
    lines.push('');
    for (const v of u.preconditions) lines.push(`- ${v}`);
    lines.push('');
  }

  lines.push('### シナリオ');
  lines.push('');

  if (u.happy.length > 0) {
    lines.push('#### 正常系');
    lines.push('');
    for (const req of u.happy) lines.push(...renderReq(req));
    lines.push('');
  }

  if (u.unwanted.length > 0) {
    lines.push('#### 異常系');
    lines.push('');
    for (const req of u.unwanted) lines.push(...renderReq(req));
    lines.push('');
  }

  if (u.boundary.length > 0) {
    lines.push('#### 境界値');
    lines.push('');
    for (const req of u.boundary) lines.push(...renderReq(req));
    lines.push('');
  }

  if (u.ui.length > 0) {
    lines.push('### 画面で見えるもの');
    lines.push('');
    lines.push('| 要素 | 内容 |');
    lines.push('|---|---|');
    for (const ui of u.ui) lines.push(`| ${ui.element} | ${ui.content} |`);
    lines.push('');
  }

  if (u.notifications.length > 0) {
    lines.push('### メール／通知');
    lines.push('');
    for (const n of u.notifications) lines.push(`- ${n}`);
    lines.push('');
  }

  if (u.checklist.length > 0) {
    lines.push('### 確認チェック');
    lines.push('');
    for (const c of u.checklist) lines.push(`- [ ] ${c}`);
    lines.push('');
  }

  return lines.join('\n');
}

function renderReq(r: Requirement): string[] {
  const origin = r.category ? `${r.origin}/${r.category}` : r.origin;
  return [`- **${r.id}**（${r.type}・${r.priority}・由来:${origin}）`, `  ${r.text}`];
}
