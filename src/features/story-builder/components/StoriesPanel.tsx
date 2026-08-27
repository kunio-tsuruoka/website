import {
  SCENARIO_TYPE_LABEL,
  type ScenarioType,
  type StoryScenario,
  type StorySpec,
  type UserStory,
} from '@/lib/story-spec';

const TYPE_STYLE: Record<ScenarioType, string> = {
  normal: 'bg-primary-100 text-primary-800',
  error: 'bg-amber-100 text-amber-900',
  boundary: 'bg-cyan-100 text-cyan-900',
};

const PRIORITY_STYLE: Record<UserStory['priority'], string> = {
  必須: 'bg-red-100 text-red-800',
  推奨: 'bg-orange-100 text-orange-800',
  任意: 'bg-gray-100 text-gray-700',
};

function ScenarioCard({ scenario }: { scenario: StoryScenario }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TYPE_STYLE[scenario.type]}`}
        >
          {SCENARIO_TYPE_LABEL[scenario.type]}
        </span>
        <h4 className="text-sm font-bold text-gray-900">{scenario.title}</h4>
        <span className="text-xs text-gray-500 font-mono">{scenario.id}</span>
      </div>
      <dl className="space-y-2 text-sm leading-relaxed">
        {scenario.given && (
          <div>
            <dt className="text-xs font-semibold text-gray-500">前提</dt>
            <dd className="text-gray-800">{scenario.given}</dd>
          </div>
        )}
        {scenario.when && (
          <div>
            <dt className="text-xs font-semibold text-gray-500">操作</dt>
            <dd className="text-gray-800">{scenario.when}</dd>
          </div>
        )}
        {scenario.outcome && (
          <div>
            <dt className="text-xs font-semibold text-gray-500">結果</dt>
            <dd className="text-gray-800 whitespace-pre-wrap">{scenario.outcome}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export function StoriesPanel({ spec }: { spec: StorySpec }) {
  return (
    <div className="space-y-5">
      {spec.stories.map((story) => (
        <section
          key={story.id}
          className="rounded-lg border border-neutral-200 bg-white p-5 md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-mono text-gray-500 mb-1">{story.id}</p>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {story.role}が、{story.want}
              </h3>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${PRIORITY_STYLE[story.priority]}`}
            >
              {story.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">なぜなら、{story.benefit}</p>
          {story.scenarios.length > 0 && (
            <div className="grid gap-3">
              {story.scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
