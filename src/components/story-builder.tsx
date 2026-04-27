import {
  type EarsRequirement,
  type UserStory,
  expandHappyPath,
  getEarsTypeLabel,
  toMarkdown,
} from '@/lib/ears';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Scenario = {
  id: string;
  category: string;
  condition: string;
  expected: string;
  earsText: string;
};

const SAMPLE: { systemName: string; story: UserStory } = {
  systemName: '社内経費精算システム',
  story: {
    role: '営業担当者',
    want: '出張時の交通費を写真添付で申請する',
    benefit: '帰社後に紙の領収書をまとめる手間をなくしたい',
  },
};

export function StoryBuilder() {
  const [systemName, setSystemName] = useState(SAMPLE.systemName);
  const [story, setStory] = useState<UserStory>(SAMPLE.story);
  const [happyReqs, setHappyReqs] = useState<EarsRequirement[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSample() {
    setSystemName(SAMPLE.systemName);
    setStory(SAMPLE.story);
    setHappyReqs([]);
    setScenarios([]);
    setError(null);
  }

  function generateHappy() {
    if (!story.want.trim()) {
      setError('「やりたいこと（I want）」は必須です');
      return;
    }
    setError(null);
    setHappyReqs(expandHappyPath(story, systemName));
  }

  async function generateScenarios() {
    if (!story.want.trim()) {
      setError('「やりたいこと（I want）」は必須です');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName,
          story,
          happyPath: happyReqs.map((r) => r.text),
          count,
        }),
      });
      const data = (await res.json()) as
        | { success: true; scenarios: Scenario[] }
        | { success: false; error: string; detail?: string };
      if (!data.success) {
        throw new Error(data.error + (data.detail ? `: ${data.detail}` : ''));
      }
      setScenarios(data.scenarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : '異常系の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function downloadMarkdown() {
    const md = buildFullMarkdown(story, systemName, happyReqs, scenarios);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-story.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setSystemName('');
    setStory({ role: '', want: '', benefit: '' });
    setHappyReqs([]);
    setScenarios([]);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">1. ユーザーストーリーを入力</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="px-3 py-1.5 text-xs font-semibold text-primary-500 border border-primary-200 rounded-md hover:bg-primary-50"
            >
              サンプルを試す
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              クリア
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <Field
            label="どんなシステム？"
            hint="作ろうとしているサービスやアプリの名前"
            value={systemName}
            onChange={setSystemName}
            placeholder="例：社内経費精算システム"
          />
          <Field
            label="誰が使う？"
            hint="そのシステムを実際に使う人。役職・立場・職種で書きます（As a）"
            value={story.role}
            onChange={(v) => setStory({ ...story, role: v })}
            placeholder="例：営業担当者"
          />
          <Field
            label="何をしたい？"
            hint="その人がシステムでやりたい行動を、1文で（I want）"
            value={story.want}
            onChange={(v) => setStory({ ...story, want: v })}
            placeholder="例：出張時の交通費を写真添付で申請する"
            required
          />
          <Field
            label="なぜしたい？（得たい価値）"
            hint="それができると何がうれしいか。本当の目的（So that）"
            value={story.benefit}
            onChange={(v) => setStory({ ...story, benefit: v })}
            placeholder="例：帰社後に紙の領収書をまとめる手間をなくしたい"
          />
        </div>

        <div className="mt-5 p-4 bg-primary-50/60 border border-primary-100 rounded-lg">
          <p className="text-xs font-semibold text-primary-700 mb-1">ストーリー文プレビュー</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-semibold">{story.role || '〇〇'}</span> として、
            <span className="font-semibold">{story.want || '〇〇したい'}</span>。
            {story.benefit && (
              <>
                <br />
                なぜなら、<span className="font-semibold">{story.benefit}</span> から。
              </>
            )}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateHappy}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600"
          >
            正常系を展開（テンプレート）
          </button>
          <label className="flex items-center gap-2">
            <span className="text-xs text-gray-600">異常系シナリオ数</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              {[3, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}件
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generateScenarios}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-semibold text-white rounded-md',
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent-950 hover:bg-accent-800'
            )}
          >
            {loading ? '生成中…' : '異常系を生成（AI）'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* 正常系 */}
      {happyReqs.length > 0 && (
        <ResultBlock title="2. 正常系（EARS要求文）">
          <ul className="space-y-3">
            {happyReqs.map((r) => (
              <EarsRow key={r.id} req={r} />
            ))}
          </ul>
        </ResultBlock>
      )}

      {/* 異常系 */}
      {scenarios.length > 0 && (
        <ResultBlock title={`3. 異常系シナリオ（${scenarios.length}件）`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-600">
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-3 py-2 font-semibold">カテゴリ</th>
                  <th className="px-3 py-2 font-semibold">発生条件</th>
                  <th className="px-3 py-2 font-semibold">期待挙動</th>
                  <th className="px-3 py-2 font-semibold">EARS</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-2 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{s.condition}</td>
                    <td className="px-3 py-2 text-gray-700">{s.expected}</td>
                    <td className="px-3 py-2 text-gray-600 leading-relaxed">{s.earsText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultBlock>
      )}

      {/* エクスポート */}
      {(happyReqs.length > 0 || scenarios.length > 0) && (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. エクスポート</h2>
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
              onClick={() =>
                navigator.clipboard.writeText(
                  buildFullMarkdown(story, systemName, happyReqs, scenarios)
                )
              }
              className="px-4 py-2 text-sm font-semibold text-primary-500 border border-primary-300 rounded-md hover:bg-primary-50"
            >
              クリップボードにコピー
            </button>
          </div>
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer">Markdownプレビュー</summary>
            <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              {buildFullMarkdown(story, systemName, happyReqs, scenarios)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
      />
    </label>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EarsRow({ req }: { req: EarsRequirement }) {
  return (
    <li className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-xs text-gray-700">{req.id}</span>
        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
          {getEarsTypeLabel(req.type)}
        </span>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">{req.text}</p>
    </li>
  );
}

function buildFullMarkdown(
  story: UserStory,
  systemName: string,
  happyReqs: EarsRequirement[],
  scenarios: Scenario[]
): string {
  let md = toMarkdown(story, systemName, happyReqs);
  if (scenarios.length === 0) return md;

  md += '\n## 異常系シナリオ\n\n';
  for (const s of scenarios) {
    md += `- **${s.id}**（Unwanted・${s.category}）\n`;
    md += `  ${s.earsText}\n`;
    md += `  - 発生条件: ${s.condition}\n`;
    md += `  - 期待挙動: ${s.expected}\n`;
  }
  return md;
}
