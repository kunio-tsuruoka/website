import { diagramToSvg } from '@/features/flow-mapper/utils/svg';
import { trackCtaClick, trackToolEvent } from '@/lib/analytics';
import { writeHandoff } from '@/lib/tool-handoff';
import { useMemo, useState } from 'react';
import { useFlowInterviewStore } from '../store';
import { DiagramEditor } from './DiagramEditor';

export function DiagramPreview({ onEdit }: { onEdit: () => void }) {
  const diagram = useFlowInterviewStore((s) => s.diagram);
  const openContact = useFlowInterviewStore((s) => s.openContact);
  const hasSteps = diagram.steps.length > 0;
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');

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

  const tabCls = (active: boolean) =>
    `px-3 py-1.5 text-xs font-semibold rounded-full transition ${
      active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-sm font-bold text-navy-950">現状フロー（As-Is）</h3>
        {hasSteps && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={tabCls(mode === 'preview')}
            >
              プレビュー
            </button>
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={tabCls(mode === 'edit')}
            >
              編集
            </button>
          </div>
        )}
      </div>

      {mode === 'edit' && hasSteps ? (
        <div className="flex-1 min-h-[320px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
          <DiagramEditor onChange={onEdit} />
        </div>
      ) : (
        <div className="flex-1 min-h-[320px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
          {hasSteps ? (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: 自前生成のSVG文字列を描画するため必要
            <div className="min-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-center text-sm text-gray-400 px-6">
              会話を進めると、ここに現状の業務フロー図がリアルタイムで描かれます。
            </div>
          )}
        </div>
      )}

      {hasSteps && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              trackCtaClick({ source: 'flow-interview', cta: 'contact-from-preview' });
              openContact('flow-improve');
            }}
            className="flex-1 inline-flex justify-center items-center px-5 py-3 min-h-[48px] rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition"
          >
            この業務フローをBeekleに相談する
          </button>
          <button
            type="button"
            onClick={openInFlowMapper}
            className="inline-flex justify-center items-center px-5 py-3 min-h-[48px] rounded-full border border-gray-300 hover:border-primary-400 text-gray-700 text-sm font-medium transition"
            title="コスト試算やPNG/SVG出力など高度な編集"
          >
            高度な編集（フローマッパー）
          </button>
        </div>
      )}
    </div>
  );
}
