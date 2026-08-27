import type { StorySpec } from '@/lib/story-spec';
import { Eyebrow, Sheet, SheetBody } from './sheet';

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500">{title}</p>
      <ul className="space-y-2 text-sm leading-relaxed text-accent-950">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-px w-3 flex-shrink-0 bg-neutral-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="mt-4 border-t border-neutral-200 pt-4 text-sm leading-relaxed text-neutral-700">
      <span className="mr-2 font-semibold text-accent-950">{label}</span>
      {value}
    </p>
  );
}

export function AsIsToBePanel({ spec }: { spec: StorySpec }) {
  return (
    <div className="grid gap-0 overflow-hidden rounded-lg border border-neutral-200 md:grid-cols-2">
      <Sheet
        accent="neutral"
        className="rounded-none border-0 border-b border-l-4 border-l-neutral-300 md:border-b-0 md:border-r"
      >
        <SheetBody>
          <Eyebrow>01 AS-IS</Eyebrow>
          <p className="mb-1 text-xs font-semibold tracking-wide text-neutral-500">現状</p>
          <h3 className="mb-4 text-xl font-bold leading-snug text-accent-950">
            いまどうやっているか
          </h3>
          <p className="text-base leading-relaxed text-accent-950">
            {spec.asIs.summary || '（未整理）'}
          </p>
          <Meta label="登場人物" value={spec.asIs.actors.join('、')} />
          <Meta label="使っているもの" value={spec.asIs.tools.join('、')} />
          <List title="困りごと" items={spec.asIs.pains} />
        </SheetBody>
      </Sheet>

      <Sheet accent="primary" className="rounded-none border-0 border-l-4 border-l-primary-500">
        <SheetBody>
          <Eyebrow>02 TO-BE</Eyebrow>
          <p className="mb-1 text-xs font-semibold tracking-wide text-neutral-500">目指す姿</p>
          <h3 className="mb-4 text-xl font-bold leading-snug text-accent-950">
            どうなっていたいか
          </h3>
          <p className="text-base leading-relaxed text-accent-950">
            {spec.toBe.summary || '（未整理）'}
          </p>
          <List title="実現したいこと" items={spec.toBe.outcomes} />
        </SheetBody>
      </Sheet>

      {spec.background && (
        <div className="border-t border-neutral-200 bg-white px-5 py-5 md:col-span-2 md:px-7">
          <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500">背景</p>
          <p className="text-sm leading-relaxed text-accent-950">{spec.background}</p>
        </div>
      )}
    </div>
  );
}
