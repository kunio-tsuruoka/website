import type { StorySpec } from '@/lib/story-spec';
import { Eyebrow, FieldLabel, Sheet, SheetBody, ToolButton, fieldClass } from './sheet';

export function AsIsToBePanel({
  spec,
  onChange,
  onRegenerate,
  regenerating,
}: {
  spec: StorySpec;
  onChange: (spec: StorySpec) => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3 md:px-7">
        <p className="text-sm text-neutral-700">
          生成結果はそのまま渡さず、現場の言葉に直してから次へ進みます。直した内容はストーリーとRFPにそのまま載ります。
        </p>
        <ToolButton type="button" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? '現状だけ直しています…' : '現状と目指す姿だけ再整理する'}
        </ToolButton>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        <Sheet
          accent="neutral"
          className="rounded-none border-0 border-b border-l-4 border-l-neutral-300 md:border-b-0 md:border-r"
        >
          <SheetBody>
            <Eyebrow>01 AS-IS</Eyebrow>
            <h3 className="mb-4 text-xl font-bold leading-snug text-accent-950">
              いまどうやっているか
            </h3>
            <label className="block">
              <FieldLabel>現状の要約</FieldLabel>
              <textarea
                value={spec.asIs.summary}
                onChange={(e) =>
                  onChange({ ...spec, asIs: { ...spec.asIs, summary: e.target.value } })
                }
                rows={4}
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block">
              <FieldLabel>登場人物（1行に1人）</FieldLabel>
              <textarea
                value={spec.asIs.actors.join('\n')}
                onChange={(e) =>
                  onChange({ ...spec, asIs: { ...spec.asIs, actors: e.target.value.split('\n') } })
                }
                rows={3}
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block">
              <FieldLabel>使っているもの（1行に1つ）</FieldLabel>
              <textarea
                value={spec.asIs.tools.join('\n')}
                onChange={(e) =>
                  onChange({ ...spec, asIs: { ...spec.asIs, tools: e.target.value.split('\n') } })
                }
                rows={3}
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block">
              <FieldLabel>困りごと（1行に1つ）</FieldLabel>
              <textarea
                value={spec.asIs.pains.join('\n')}
                onChange={(e) =>
                  onChange({ ...spec, asIs: { ...spec.asIs, pains: e.target.value.split('\n') } })
                }
                rows={4}
                className={fieldClass}
              />
            </label>
          </SheetBody>
        </Sheet>

        <Sheet accent="primary" className="rounded-none border-0 border-l-4 border-l-primary-500">
          <SheetBody>
            <Eyebrow>02 TO-BE</Eyebrow>
            <h3 className="mb-4 text-xl font-bold leading-snug text-accent-950">
              どうなっていたいか
            </h3>
            <label className="block">
              <FieldLabel>目指す姿の要約</FieldLabel>
              <textarea
                value={spec.toBe.summary}
                onChange={(e) =>
                  onChange({ ...spec, toBe: { ...spec.toBe, summary: e.target.value } })
                }
                rows={4}
                className={fieldClass}
              />
            </label>
            <label className="mt-4 block">
              <FieldLabel>実現したいこと（1行に1つ）</FieldLabel>
              <textarea
                value={spec.toBe.outcomes.join('\n')}
                onChange={(e) =>
                  onChange({
                    ...spec,
                    toBe: { ...spec.toBe, outcomes: e.target.value.split('\n') },
                  })
                }
                rows={4}
                className={fieldClass}
              />
            </label>
          </SheetBody>
        </Sheet>
      </div>

      <div className="border-t border-neutral-200 bg-white px-5 py-5 md:px-7">
        <label className="block">
          <FieldLabel>案件の名前</FieldLabel>
          <input
            value={spec.title}
            onChange={(e) => onChange({ ...spec, title: e.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block">
          <FieldLabel>背景</FieldLabel>
          <textarea
            value={spec.background}
            onChange={(e) => onChange({ ...spec, background: e.target.value })}
            rows={3}
            className={fieldClass}
          />
        </label>
      </div>
    </div>
  );
}
