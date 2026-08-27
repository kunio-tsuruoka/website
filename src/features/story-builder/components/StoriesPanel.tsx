import {
  SCENARIO_TYPE_LABEL,
  type ScenarioType,
  type StoryScenario,
  type StorySpec,
  type UserStory,
  formatGherkin,
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

const KEYWORD_STYLE: Record<string, string> = {
  'Scenario:': 'bg-gray-800 text-white',
  Given: 'bg-slate-800 text-white',
  When: 'bg-primary-600 text-white',
  Then: 'bg-emerald-700 text-white',
  And: 'bg-emerald-700 text-white',
};

function GherkinBlock({ scenario }: { scenario: StoryScenario }) {
  const lines = formatGherkin(scenario);
  return (
    <pre className="mt-3 overflow-x-auto rounded-md border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-gray-800">
      {lines.map((line, i) => {
        const match = line.match(/^( *)(Scenario:|Given|When|Then|And)\s+(.*)$/);
        if (!match) {
          return (
            <span key={`${scenario.id}-${i}`} className="block">
              {line}
            </span>
          );
        }
        const indent = match[1];
        const keyword = match[2];
        const rest = match[3];
        return (
          <span key={`${scenario.id}-${i}`} className="block">
            {indent}
            <span
              className={`mr-2 inline-block min-w-[4.5rem] rounded px-1.5 py-0.5 text-[10px] font-bold ${KEYWORD_STYLE[keyword] ?? 'bg-gray-700 text-white'}`}
            >
              {keyword}
            </span>
            {rest}
          </span>
        );
      })}
    </pre>
  );
}

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
      <GherkinBlock scenario={scenario} />
    </article>
  );
}

export function StoriesPanel({
  spec,
  onDownloadGherkin,
  onCopyGherkin,
}: {
  spec: StorySpec;
  onDownloadGherkin: () => void;
  onCopyGherkin: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownloadGherkin}
          className="min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600"
        >
          Gherkin（.feature）をダウンロード
        </button>
        <button
          type="button"
          onClick={onCopyGherkin}
          className="min-h-[44px] px-4 py-2 text-sm font-semibold text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50"
        >
          Gherkinをコピー
        </button>
      </div>
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
