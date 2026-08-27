import { STORY_TEMPLATES } from '@/data/story-builder-templates';
import { trackToolEvent } from '@/lib/analytics';
import { buildShareUrl, clearShareHash, readSharedFromHash } from '@/lib/share-url';
import type { ChatTurn, ReviseMode } from '@/lib/story-revise';
import {
  type StorySpec,
  formatGherkinFeature,
  formatRfpMarkdown,
  formatScopeMarkdown,
  isStorySpec,
} from '@/lib/story-spec';
import { consumeHandoff, writeHandoff } from '@/lib/tool-handoff';
import { markToolSaved } from '@/lib/tool-storage';
import { useEffect, useRef, useState } from 'react';
import { AsIsToBePanel } from './components/AsIsToBePanel';
import { ReviseChat } from './components/ReviseChat';
import { RfpPanel } from './components/RfpPanel';
import { StoriesPanel } from './components/StoriesPanel';
import { type Step, WorkspaceSteps } from './components/WorkspaceSteps';
import { Eyebrow, Sheet, SheetBody, ToolButton } from './components/sheet';

const MAX_IMPORT_BYTES = 2_000_000;
export const STORAGE_KEY = 'beekle-story-builder-v2';

const SAMPLE_TEXT = `社内の経費精算をスマホアプリでやれるようにしたい。
営業担当者が出張先でタクシーや電車を使ったときに、写真で領収書を撮ってその場で申請できるようにしたい。
帰社後に紙の領収書をまとめる手間をなくして、月末の精算作業を減らしたい。
承認は上長が行い、承認後は経理に自動で連携される想定。`;

type Stored = {
  description?: string;
  spec?: StorySpec | null;
  chat?: ChatTurn[];
};

type LoadingKind = ReviseMode | null;

export function StoryBuilder() {
  const [description, setDescription] = useState('');
  const [spec, setSpec] = useState<StorySpec | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [step, setStep] = useState<Step>('input');
  const [loadingKind, setLoadingKind] = useState<LoadingKind>(null);
  const [loadingStoryId, setLoadingStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeFiredRef = useRef(false);
  const exportCountRef = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (parsed.description) setDescription(parsed.description);
        if (parsed.spec && isStorySpec(parsed.spec)) {
          setSpec(parsed.spec);
          setStep('asis');
        }
        if (Array.isArray(parsed.chat)) setChat(parsed.chat);
      }
    } catch {
      // ignore
    }
    const handoff = consumeHandoff('story-builder');
    if (handoff) {
      setDescription(handoff.payload);
      setSpec(null);
      setError(null);
      setStep('input');
    }
    const shared = readSharedFromHash<{ description: string; spec: StorySpec | null }>();
    if (shared?.description) {
      const ok = confirm('共有URLから読み込みます。現在の内容は上書きされます。続けますか？');
      if (ok) {
        setDescription(shared.description);
        if (shared.spec && isStorySpec(shared.spec)) {
          setSpec(shared.spec);
          setStep('asis');
        } else {
          setSpec(null);
        }
      }
      clearShareHash();
    }
    trackToolEvent('tool_start', { tool: 'story-builder' });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!spec && !description) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ description, spec, chat }));
      markToolSaved('story-builder');
    } catch (err) {
      console.warn('[story-builder] localStorage 書き込み失敗:', err);
    }
  }, [description, spec, chat, hydrated]);

  const fireExportEvent = (format: string) => {
    exportCountRef.current += 1;
    trackToolEvent('tool_export', { tool: 'story-builder', meta: { format } });
    if (!completeFiredRef.current && spec) {
      completeFiredRef.current = true;
      trackToolEvent('tool_complete', {
        tool: 'story-builder',
        meta: { exports: exportCountRef.current },
      });
    }
  };

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setError(`ファイルが大きすぎます（${Math.round(MAX_IMPORT_BYTES / 1_000_000)}MBまで）`);
      e.target.value = '';
      return;
    }
    try {
      const isDocx =
        file.name.toLowerCase().endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let text: string;
      if (isDocx) {
        const mammoth = await import('mammoth/mammoth.browser');
        const buffer = await file.arrayBuffer();
        const out = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = out.value;
      } else {
        text = await file.text();
      }
      setDescription(text.trim());
      setSpec(null);
      setError(null);
      setStep('input');
    } catch (err) {
      setError(
        err instanceof Error ? `読み込みエラー: ${err.message}` : 'ファイルを読み込めませんでした'
      );
    } finally {
      e.target.value = '';
    }
  }

  async function requestSpec(body: {
    mode: ReviseMode;
    instruction?: string;
    storyId?: string;
  }): Promise<{ spec: StorySpec; note?: string }> {
    const res = await fetch('/api/tools/generate-scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        spec,
        mode: body.mode,
        instruction: body.instruction,
        storyId: body.storyId,
      }),
    });
    const data = (await res.json()) as
      | { success: true; spec: StorySpec; note?: string }
      | { success: false; error: string; detail?: string };
    if (!data.success) {
      throw new Error(data.error + (data.detail ? `: ${data.detail}` : ''));
    }
    if (!isStorySpec(data.spec)) {
      throw new Error('生成結果の形式が想定と違います。もう一度試してください');
    }
    return { spec: data.spec, note: data.note };
  }

  async function generate() {
    if (!description.trim()) {
      setError('やりたいこと、またはいま困っていることを書いてください');
      return;
    }
    setLoadingKind('full');
    setError(null);
    try {
      const data = await requestSpec({ mode: 'full' });
      setSpec(data.spec);
      setChat([]);
      setStep('asis');
      trackToolEvent('tool_save', { tool: 'story-builder', meta: { source: 'ai-generate' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setLoadingKind(null);
    }
  }

  async function regenerateAsIs() {
    setLoadingKind('asis');
    setError(null);
    try {
      const data = await requestSpec({ mode: 'asis' });
      setSpec(data.spec);
      trackToolEvent('tool_save', { tool: 'story-builder', meta: { source: 'ai-asis' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '再整理に失敗しました');
    } finally {
      setLoadingKind(null);
    }
  }

  async function regenerateStory(storyId: string) {
    setLoadingKind('story');
    setLoadingStoryId(storyId);
    setError(null);
    try {
      const data = await requestSpec({ mode: 'story', storyId });
      setSpec(data.spec);
      trackToolEvent('tool_save', {
        tool: 'story-builder',
        meta: { source: 'ai-story', storyId },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '再整理に失敗しました');
    } finally {
      setLoadingKind(null);
      setLoadingStoryId(null);
    }
  }

  async function reviseByChat(instruction: string) {
    setLoadingKind('revise');
    setError(null);
    setChat((prev) => [...prev, { role: 'user', content: instruction }]);
    try {
      const data = await requestSpec({ mode: 'revise', instruction });
      setSpec(data.spec);
      setChat((prev) => [...prev, { role: 'assistant', content: data.note || '直しました。' }]);
      trackToolEvent('tool_save', { tool: 'story-builder', meta: { source: 'ai-revise' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話での修正に失敗しました');
    } finally {
      setLoadingKind(null);
    }
  }

  function fileStem(): string {
    return spec?.title.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40) || 'story-spec';
  }

  function downloadText(content: string, filename: string, format: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    fireExportEvent(format);
  }

  function downloadGherkin() {
    if (!spec) return;
    downloadText(formatGherkinFeature(spec), `${fileStem()}.feature`, 'gherkin-feature');
  }

  function copyGherkin() {
    if (!spec) return;
    void navigator.clipboard.writeText(formatGherkinFeature(spec));
    fireExportEvent('gherkin-clipboard');
  }

  function downloadRfp() {
    if (!spec) return;
    downloadText(formatRfpMarkdown(spec), `${fileStem()}.md`, 'rfp-markdown');
  }

  function copyRfp() {
    if (!spec) return;
    void navigator.clipboard.writeText(formatRfpMarkdown(spec));
    fireExportEvent('rfp-clipboard');
  }

  function sendToScopeManager() {
    if (!spec) return;
    writeHandoff({
      from: 'story-builder',
      target: 'scope-manager',
      payload: formatScopeMarkdown(spec),
    });
    fireExportEvent('handoff-scope-manager');
    window.location.href = '/tools/scope-manager';
  }

  async function copyShareUrl() {
    const { url, tooLong } = buildShareUrl('/tools/story-builder', { description, spec });
    if (tooLong && !confirm('共有URLが長くなっています。続行しますか？')) return;
    try {
      await navigator.clipboard.writeText(url);
      fireExportEvent('share-url');
    } catch {
      setError('クリップボードへのコピーに失敗しました。');
    }
  }

  return (
    <div>
      <WorkspaceSteps step={step} hasSpec={!!spec} onChange={setStep} />

      {step === 'input' && (
        <Sheet accent="primary">
          <SheetBody>
            <Eyebrow>01 INPUT</Eyebrow>
            <h2 className="mb-2 text-xl font-bold text-accent-950">
              いまの業務と、こうしたいを書く
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-neutral-700">
              専門用語は不要です。誰が、何を、どの道具でやっていて、どこが困っているか。そのあとどうしたいかが分かれば十分です。
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              <ToolButton type="button" onClick={() => fileInputRef.current?.click()}>
                ファイルを読み込む
              </ToolButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={importFile}
                className="hidden"
              />
              <select
                defaultValue=""
                onChange={(e) => {
                  const tpl = STORY_TEMPLATES.find((t) => t.id === e.target.value);
                  if (!tpl) return;
                  setDescription(tpl.text);
                  setSpec(null);
                  setError(null);
                  trackToolEvent('tool_load_template', {
                    tool: 'story-builder',
                    meta: { template: tpl.id },
                  });
                  e.target.value = '';
                }}
                className="min-h-[44px] rounded-md border border-primary-500 bg-white px-4 py-2 text-sm font-semibold text-primary-500"
              >
                <option value="" disabled>
                  業界別の例から始める
                </option>
                {STORY_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}（{t.industry}）
                  </option>
                ))}
              </select>
              <ToolButton
                type="button"
                onClick={() => {
                  setDescription(SAMPLE_TEXT);
                  setSpec(null);
                  setError(null);
                  trackToolEvent('tool_load_sample', { tool: 'story-builder' });
                }}
              >
                サンプルを入れる
              </ToolButton>
              <ToolButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setDescription('');
                  setSpec(null);
                  setError(null);
                  setStep('input');
                }}
              >
                クリア
              </ToolButton>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              placeholder="例：出張のあと、紙の領収書を月末にまとめて申請している。なくしたり、承認が遅れたりする。スマホでその場申請できるようにしたい。"
              className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-accent-950 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ToolButton
                type="button"
                variant="primary"
                onClick={generate}
                disabled={loadingKind !== null}
              >
                {loadingKind === 'full'
                  ? '整理しています…（1〜2分）'
                  : '現状・ストーリー・RFPに整理する'}
              </ToolButton>
              {spec && (
                <ToolButton type="button" variant="ghost" onClick={() => setStep('asis')}>
                  前回の整理結果を見る
                </ToolButton>
              )}
            </div>
            {error && (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </SheetBody>
        </Sheet>
      )}

      {loadingKind && (
        <div className="mb-5 border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-700">
          <p className="font-semibold text-accent-950">
            {loadingKind === 'full' && '整理しています（1〜2分）'}
            {loadingKind === 'asis' && '現状と目指す姿だけ直しています'}
            {loadingKind === 'story' && '指定したストーリーだけ直しています'}
            {loadingKind === 'revise' && '指示どおり直しています'}
          </p>
          <p className="mt-1">
            {loadingKind === 'full'
              ? '書いた内容を、現状と目指す姿、ストーリー、Gherkin、RFPの章立てに分けています。'
              : '指示していない箇所はそのまま残します。'}
          </p>
        </div>
      )}

      {error && step !== 'input' && (
        <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === 'asis' && spec && (
        <AsIsToBePanel
          spec={spec}
          onChange={setSpec}
          onRegenerate={regenerateAsIs}
          regenerating={loadingKind === 'asis'}
        />
      )}
      {step === 'stories' && spec && (
        <StoriesPanel
          spec={spec}
          onChange={setSpec}
          onDownloadGherkin={downloadGherkin}
          onCopyGherkin={copyGherkin}
          onRegenerateStory={regenerateStory}
          regeneratingStoryId={loadingStoryId}
        />
      )}
      {step === 'rfp' && spec && (
        <RfpPanel
          spec={spec}
          onDownload={downloadRfp}
          onCopy={copyRfp}
          onSendScope={sendToScopeManager}
          onCopyShare={copyShareUrl}
        />
      )}

      {spec && step !== 'input' && (
        <ReviseChat messages={chat} loading={loadingKind === 'revise'} onSubmit={reviseByChat} />
      )}

      {spec && step !== 'input' && (
        <div className="mt-5 flex flex-wrap gap-2">
          {step !== 'asis' && (
            <ToolButton type="button" onClick={() => setStep('asis')}>
              現状と目指す姿
            </ToolButton>
          )}
          {step !== 'stories' && (
            <ToolButton type="button" onClick={() => setStep('stories')}>
              ストーリーを直す
            </ToolButton>
          )}
          {step !== 'rfp' && (
            <ToolButton type="button" variant="primary" onClick={() => setStep('rfp')}>
              RFPに進む
            </ToolButton>
          )}
        </div>
      )}
    </div>
  );
}
