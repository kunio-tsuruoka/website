import { Badge } from '@/components/ui/badge';
import {
  SCENARIO_TYPE_LABEL,
  type ScenarioType,
  type StoryScenario,
  type StorySpec,
  type UserStory,
  formatGherkin,
} from '@/lib/story-spec';
import { ToolButton } from './sheet';

const TYPE_BADGE: Record<ScenarioType, 'primaryLight' | 'muted' | 'outline'> = {
  normal: 'primaryLight',
  error: 'outline',
  boundary: 'muted',
};

const PRIORITY_BADGE: Record<UserStory['priority'], 'primaryLight' | 'muted'> = {
  必須: 'primaryLight',
  推奨: 'muted',
  任意: 'muted',
};

const KEYWORD_CLASS: Record<string, string> = {
  'Scenario:': 'text-primary-600',
  Given: 'text-neutral-500',
  When: 'text-primary-600',
  Then: 'text-accent-950',
  And: 'text-neutral-600',
};

function GherkinBlock({ scenario }: { scenario: StoryScenario }) {
  const lines = formatGherkin(scenario);
  return (
    <pre className="overflow-x-auto border-l-4 border-primary-500 bg-neutral-50 px-4 py-4 font-mono text-xs leading-7 text-accent-950">
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
              className={`mr-3 inline-block min-w-[5.5rem] font-bold ${KEYWORD_CLASS[keyword]}`}
            >
              {keyword}
            </span>
            <span className="text-accent-950">{rest}</span>
          </span>
        );
      })}
    </pre>
  );
}

function ScenarioCard({ scenario }: { scenario: StoryScenario }) {
  return (
    <article className="border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3">
        <Badge variant={TYPE_BADGE[scenario.type]} size="xs">
          {SCENARIO_TYPE_LABEL[scenario.type]}
        </Badge>
        <h4 className="text-sm font-bold text-accent-950">{scenario.title}</h4>
        <span className="ml-auto font-Poppins text-[11px] tracking-wide text-neutral-500">
          {scenario.id}
        </span>
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
      <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white px-5 py-4">
        <div>
          <p className="font-Poppins text-[11px] font-semibold tracking-[0.16em] text-primary-500">
            FEATURE
          </p>
          <p className="mt-1 text-sm font-semibold text-accent-950">
            {spec.title || 'ストーリーと受け入れ条件'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolButton variant="primary" onClick={onDownloadGherkin}>
            Gherkin（.feature）をダウンロード
          </ToolButton>
          <ToolButton onClick={onCopyGherkin}>Gherkinをコピー</ToolButton>
        </div>
      </div>

      {spec.stories.map((story, index) => (
        <section key={story.id} className="overflow-hidden rounded-lg border border-neutral-200">
          <header className="border-b border-neutral-200 bg-white px-5 py-5 md:px-7">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <p className="font-Poppins text-2xl font-bold text-primary-500">
                {String(index + 1).padStart(2, '0')}
                <span className="ml-3 text-xs tracking-[0.16em] text-neutral-500">{story.id}</span>
              </p>
              <Badge variant={PRIORITY_BADGE[story.priority]} size="xs">
                {story.priority}
              </Badge>
            </div>
            <h3 className="text-xl font-bold leading-snug text-accent-950">
              {story.role}が、{story.want}
            </h3>
            <p className="mt-3 border-l-4 border-primary-500 pl-4 text-sm leading-relaxed text-neutral-700">
              なぜなら、{story.benefit}
            </p>
          </header>
          {story.scenarios.length > 0 && (
            <div className="grid gap-3 bg-neutral-50 p-4 md:p-5">
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
