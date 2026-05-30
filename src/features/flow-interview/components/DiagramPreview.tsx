import { diagramToSvg } from '@/features/flow-mapper/utils/svg';
import { trackCtaClick, trackToolEvent } from '@/lib/analytics';
import { writeHandoff } from '@/lib/tool-handoff';
import { useMemo } from 'react';
import { useFlowInterviewStore } from '../store';

export function DiagramPreview() {
  const diagram = useFlowInterviewStore((s) => s.diagram);
  const hasSteps = diagram.steps.length > 0;

  const svg = useMemo(
    () => (hasSteps ? diagramToSvg(diagram, '現状フロー（As-Is）') : ''),
    [diagram, hasSteps]
  );

  const openInFlowMapper = () => {
    writeHandoff({
      from: 'flow-interview',
      target: 'flow-mapper',
      payload: JSON.stringify(diagram),
    });
    trackToolEvent('tool_export', {
      tool: 'flow-mapper',
      meta: { variant: 'flow-interview', format: 'handoff-flow-mapper' },
    });
    window.location.href = '/tools/flow-mapper';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-navy-950">現状フロー（As-Is）プレビュー</h3>
        <span className="text-xs text-gray-500">{diagram.steps.length} ステップ</span>
      </div>

      <div className="flex-1 min-h-[320px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
        {hasSteps ? (
          // diagramToSvg が生成する安全な自前SVG文字列（ユーザー入力は label として埋め込まれるが
          // flow-mapper 側で組み立てたSVGをそのまま再利用）。
          // biome-ignore lint/security/noDangerouslySetInnerHtml: 自前生成のSVG文字列を描画するため必要
          <div className="min-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="h-full min-h-[300px] flex items-center justify-center text-center text-sm text-gray-400 px-6">
            会話を進めると、ここに現状の業務フロー図がリアルタイムで描かれます。
          </div>
        )}
      </div>

      {hasSteps && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <a
            href="/contact?source=flow-interview&intent=flow-improve"
            onClick={() => trackCtaClick({ source: 'flow-interview', cta: 'contact-from-preview' })}
            className="flex-1 inline-flex justify-center items-center px-5 py-3 min-h-[48px] rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition"
          >
            この業務フローをBeekleに相談する
          </a>
          <button
            type="button"
            onClick={openInFlowMapper}
            className="inline-flex justify-center items-center px-5 py-3 min-h-[48px] rounded-full border border-gray-300 hover:border-primary-400 text-gray-700 text-sm font-medium transition"
          >
            自分で編集する（フローマッパー）
          </button>
        </div>
      )}
    </div>
  );
}
