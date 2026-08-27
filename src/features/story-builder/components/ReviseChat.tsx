import type { ChatTurn } from '@/lib/story-revise';
import { useState } from 'react';
import { FieldLabel, ToolButton, fieldClass } from './sheet';

export function ReviseChat({
  messages,
  loading,
  onSubmit,
}: {
  messages: ChatTurn[];
  loading: boolean;
  onSubmit: (instruction: string) => void;
}) {
  const [draft, setDraft] = useState('');

  return (
    <section className="mt-5 rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4 md:px-7">
        <p className="font-Poppins text-[11px] font-semibold tracking-[0.16em] text-primary-500">
          REVISE
        </p>
        <h3 className="mt-1 text-lg font-bold text-accent-950">会話で直す</h3>
        <p className="mt-1 text-sm text-neutral-700">
          「上長の承認は後回しでいい」のように、直してほしいことだけ書く。指示したところ以外は残します。
        </p>
      </div>
      {messages.length > 0 && (
        <ol className="space-y-3 border-b border-neutral-200 px-5 py-4 md:px-7">
          {messages.map((turn, i) => (
            <li key={`${turn.role}-${i}`}>
              <p className="text-xs font-semibold tracking-wide text-neutral-500">
                {turn.role === 'user' ? '指示' : '反映'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-accent-950">{turn.content}</p>
            </li>
          ))}
        </ol>
      )}
      <form
        className="px-5 py-4 md:px-7"
        onSubmit={(e) => {
          e.preventDefault();
          const instruction = draft.trim();
          if (!instruction || loading) return;
          setDraft('');
          onSubmit(instruction);
        }}
      >
        <label className="block">
          <FieldLabel>直してほしいこと</FieldLabel>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="例：上長の承認は必須じゃない。後回しでいい。"
            className={fieldClass}
          />
        </label>
        <div className="mt-3">
          <ToolButton type="submit" variant="primary" disabled={loading || !draft.trim()}>
            {loading ? '直しています…' : 'この指示で直す'}
          </ToolButton>
        </div>
      </form>
    </section>
  );
}
