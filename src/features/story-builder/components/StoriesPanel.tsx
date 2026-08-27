import { Badge } from '@/components/ui/badge';
import {
  SCENARIO_TYPES,
  SCENARIO_TYPE_LABEL,
  STORY_PRIORITIES,
  type ScenarioType,
  type StoryScenario,
  type StorySpec,
  type UserStory,
  createBlankScenario,
  createBlankStory,
} from '@/lib/story-spec';
import { FieldLabel, ToolButton, fieldClass } from './sheet';

const TYPE_BADGE: Record<ScenarioType, 'primaryLight' | 'muted' | 'outline'> = {
  normal: 'primaryLight',
  error: 'outline',
  boundary: 'muted',
};

function patchStory(spec: StorySpec, storyId: string, next: UserStory): StorySpec {
  return {
    ...spec,
    stories: spec.stories.map((story) => (story.id === storyId ? next : story)),
  };
}

function GherkinFields({
  scenario,
  onChange,
}: {
  scenario: StoryScenario;
  onChange: (scenario: StoryScenario) => void;
}) {
  return (
    <div className="grid gap-3 border-l-4 border-primary-500 bg-neutral-50 px-4 py-4">
      <label className="block">
        <FieldLabel>シナリオ名</FieldLabel>
        <input
          value={scenario.title}
          onChange={(e) => onChange({ ...scenario, title: e.target.value })}
          placeholder="例：出張先で領収書を申請する"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <FieldLabel>前提（Given）</FieldLabel>
        <textarea
          value={scenario.given}
          onChange={(e) => onChange({ ...scenario, given: e.target.value })}
          rows={2}
          placeholder="例：営業担当が出張中である"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <FieldLabel>操作（When）</FieldLabel>
        <textarea
          value={scenario.when}
          onChange={(e) => onChange({ ...scenario, when: e.target.value })}
          rows={2}
          placeholder="例：領収書を撮影して申請する"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <FieldLabel>期待する結果（Then）</FieldLabel>
        <textarea
          value={scenario.outcome}
          onChange={(e) => onChange({ ...scenario, outcome: e.target.value })}
          rows={3}
          placeholder="例：上長に承認依頼が届く"
          className={fieldClass}
        />
      </label>
    </div>
  );
}

function ScenarioEditor({
  scenario,
  onChange,
  onRemove,
}: {
  scenario: StoryScenario;
  onChange: (scenario: StoryScenario) => void;
  onRemove: () => void;
}) {
  return (
    <article className="border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3">
        <label className="sr-only" htmlFor={`type-${scenario.id}`}>
          シナリオの種類
        </label>
        <select
          id={`type-${scenario.id}`}
          value={scenario.type}
          onChange={(e) => onChange({ ...scenario, type: e.target.value as ScenarioType })}
          className="min-h-[44px] rounded-md border border-neutral-300 bg-white px-2 text-sm text-accent-950"
        >
          {SCENARIO_TYPES.map((type) => (
            <option key={type} value={type}>
              {SCENARIO_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
        <Badge variant={TYPE_BADGE[scenario.type]} size="xs">
          {SCENARIO_TYPE_LABEL[scenario.type]}
        </Badge>
        <span className="ml-auto font-Poppins text-[11px] tracking-wide text-neutral-500">
          {scenario.id}
        </span>
        <ToolButton type="button" variant="ghost" onClick={onRemove}>
          このシナリオを消す
        </ToolButton>
      </div>
      <GherkinFields scenario={scenario} onChange={onChange} />
    </article>
  );
}

export function StoriesPanel({
  spec,
  onChange,
  onDownloadGherkin,
  onCopyGherkin,
  onRegenerateStory,
  regeneratingStoryId,
}: {
  spec: StorySpec;
  onChange: (spec: StorySpec) => void;
  onDownloadGherkin: () => void;
  onCopyGherkin: () => void;
  onRegenerateStory: (storyId: string) => void;
  regeneratingStoryId: string | null;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white px-5 py-4">
        <div>
          <p className="font-Poppins text-[11px] font-semibold tracking-[0.16em] text-primary-500">
            FEATURE
          </p>
          <p className="mt-1 text-sm font-semibold text-accent-950">
            {spec.title || 'ストーリーと受け入れ条件'}
          </p>
          <p className="mt-1 text-sm text-neutral-700">
            誰が／何を／なぜと、前提／操作／結果を現場の言葉で直します。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolButton variant="primary" onClick={onDownloadGherkin}>
            Gherkin（.feature）をダウンロード
          </ToolButton>
          <ToolButton onClick={onCopyGherkin}>Gherkinをコピー</ToolButton>
          <ToolButton
            type="button"
            onClick={() =>
              onChange({
                ...spec,
                stories: [...spec.stories, createBlankStory(spec.stories.length)],
              })
            }
          >
            ストーリーを足す
          </ToolButton>
        </div>
      </div>

      {spec.stories.map((story, index) => (
        <section key={story.id} className="overflow-hidden rounded-lg border border-neutral-200">
          <header className="border-b border-neutral-200 bg-white px-5 py-5 md:px-7">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <p className="font-Poppins text-2xl font-bold text-primary-500">
                {String(index + 1).padStart(2, '0')}
                <span className="ml-3 text-xs tracking-[0.16em] text-neutral-500">{story.id}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="sr-only" htmlFor={`priority-${story.id}`}>
                  優先度
                </label>
                <select
                  id={`priority-${story.id}`}
                  value={story.priority}
                  onChange={(e) =>
                    onChange(
                      patchStory(spec, story.id, {
                        ...story,
                        priority: e.target.value as UserStory['priority'],
                      })
                    )
                  }
                  className="min-h-[44px] rounded-md border border-neutral-300 bg-white px-3 text-sm text-accent-950"
                >
                  {STORY_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <ToolButton
                  type="button"
                  onClick={() => onRegenerateStory(story.id)}
                  disabled={regeneratingStoryId === story.id}
                >
                  {regeneratingStoryId === story.id
                    ? 'このストーリーだけ直しています…'
                    : 'このストーリーだけ再整理する'}
                </ToolButton>
                {spec.stories.length > 1 && (
                  <ToolButton
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onChange({
                        ...spec,
                        stories: spec.stories.filter((item) => item.id !== story.id),
                      })
                    }
                  >
                    このストーリーを消す
                  </ToolButton>
                )}
              </div>
            </div>
            <h3 className="mb-4 text-xl font-bold leading-snug text-accent-950">
              {story.role || '（誰）'}が、{story.want || '（何を）'}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <FieldLabel>誰が</FieldLabel>
                <input
                  value={story.role}
                  onChange={(e) =>
                    onChange(patchStory(spec, story.id, { ...story, role: e.target.value }))
                  }
                  placeholder="例：営業担当"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <FieldLabel>何を</FieldLabel>
                <input
                  value={story.want}
                  onChange={(e) =>
                    onChange(patchStory(spec, story.id, { ...story, want: e.target.value }))
                  }
                  placeholder="例：出張先で領収書を申請する"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="mt-3 block">
              <FieldLabel>なぜ</FieldLabel>
              <textarea
                value={story.benefit}
                onChange={(e) =>
                  onChange(patchStory(spec, story.id, { ...story, benefit: e.target.value }))
                }
                rows={2}
                placeholder="例：月末にまとめる手間をなくす"
                className={fieldClass}
              />
            </label>
          </header>
          <div className="grid gap-3 bg-neutral-50 p-4 md:p-5">
            {story.scenarios.map((scenario) => (
              <ScenarioEditor
                key={scenario.id}
                scenario={scenario}
                onChange={(next) =>
                  onChange(
                    patchStory(spec, story.id, {
                      ...story,
                      scenarios: story.scenarios.map((item) =>
                        item.id === scenario.id ? next : item
                      ),
                    })
                  )
                }
                onRemove={() =>
                  onChange(
                    patchStory(spec, story.id, {
                      ...story,
                      scenarios: story.scenarios.filter((item) => item.id !== scenario.id),
                    })
                  )
                }
              />
            ))}
            <ToolButton
              type="button"
              onClick={() =>
                onChange(
                  patchStory(spec, story.id, {
                    ...story,
                    scenarios: [
                      ...story.scenarios,
                      createBlankScenario(story.id, story.scenarios, 'normal'),
                    ],
                  })
                )
              }
            >
              シナリオを足す
            </ToolButton>
          </div>
        </section>
      ))}
    </div>
  );
}
