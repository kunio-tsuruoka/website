import type { StorySpec } from '@/lib/story-spec';

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-gray-600 mb-1.5">{title}</p>
      <ul className="space-y-1.5 text-sm text-gray-800 leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AsIsToBePanel({ spec }: { spec: StorySpec }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6">
        <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">現状 As-Is</p>
        <h3 className="text-lg font-bold text-gray-900 mb-3">いまどうやっているか</h3>
        <p className="text-sm text-gray-800 leading-relaxed">{spec.asIs.summary || '（未整理）'}</p>
        {spec.asIs.actors.length > 0 && (
          <p className="mt-4 text-sm text-gray-700">
            <span className="font-semibold">登場人物: </span>
            {spec.asIs.actors.join('、')}
          </p>
        )}
        {spec.asIs.tools.length > 0 && (
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-semibold">使っているもの: </span>
            {spec.asIs.tools.join('、')}
          </p>
        )}
        <List title="困りごと" items={spec.asIs.pains} />
      </section>

      <section className="rounded-lg border border-primary-200 bg-primary-50/40 p-5 md:p-6">
        <p className="text-xs font-semibold tracking-wide text-primary-700 mb-2">目指す姿 To-Be</p>
        <h3 className="text-lg font-bold text-gray-900 mb-3">どうなっていたいか</h3>
        <p className="text-sm text-gray-800 leading-relaxed">{spec.toBe.summary || '（未整理）'}</p>
        <List title="実現したいこと" items={spec.toBe.outcomes} />
      </section>

      {spec.background && (
        <section className="md:col-span-2 rounded-lg border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">背景</h3>
          <p className="text-sm text-gray-800 leading-relaxed">{spec.background}</p>
        </section>
      )}
    </div>
  );
}
