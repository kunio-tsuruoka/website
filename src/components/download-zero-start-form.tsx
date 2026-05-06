import type React from 'react';
import { useState } from 'react';

type SubmitStatus = 'idle' | 'submitting' | 'error';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const PHASE_OPTIONS = [
  { value: 'info_gathering', label: '情報収集中（具体的な検討はこれから）' },
  { value: 'considering', label: '社内で具体的に検討中' },
  { value: 'comparing', label: '他社と比較検討中' },
  { value: 'rfp_planned', label: '提案・見積依頼を予定' },
] as const;

const DownloadZeroStartForm = () => {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('reply_to') || '').trim();
    const company = String(formData.get('company_name') || '').trim();
    const name = String(formData.get('from_name') || '').trim();
    const phaseValue = String(formData.get('phase_value') || '').trim();
    const phaseLabel =
      PHASE_OPTIONS.find((o) => o.value === phaseValue)?.label || phaseValue || '未選択';
    const note = String(formData.get('note') || '').trim();

    const noteBlock = note ? `\nご質問・補足:\n${note}` : '※ご質問・補足はありません';
    const message = `【ゼロスタート開発 サービスデックDL】\n検討段階: ${phaseLabel}\n${noteBlock}`;

    const payload = {
      type: 'download_zero_start',
      email,
      name,
      company,
      message,
      source: 'download-zero-start',
      phase: phaseValue,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.details || `送信に失敗しました (${response.status})`
        );
      }

      const eventParams: Record<string, string> = {
        form_id: 'download-zero-start',
        form_type: 'download_zero_start',
        source: 'download-zero-start',
        phase: phaseValue || 'unknown',
      };

      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        window.location.href = '/thanks?from=zero-start';
      };
      const fallback = window.setTimeout(navigate, 1500);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          ...eventParams,
          transport_type: 'beacon',
          value: 10,
          currency: 'JPY',
        });
        window.gtag('event', 'download_request', {
          ...eventParams,
          file_name: 'beekle-zero-start-sales-deck.pdf',
          transport_type: 'beacon',
        });
        window.gtag('event', 'form_submit', {
          ...eventParams,
          transport_type: 'beacon',
          event_callback: () => {
            window.clearTimeout(fallback);
            navigate();
          },
        });
      } else {
        window.clearTimeout(fallback);
        navigate();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="bg-white rounded-[32px] shadow-soft p-8 md:p-10 border border-primary-100">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-accent-950 mb-2">
          資料ダウンロードフォーム
        </h2>
        <p className="text-sm text-foreground/70">
          フォーム送信後、ダウンロードページへ遷移します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="dl-email">
            メールアドレス <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="dl-email"
            name="reply_to"
            required
            autoComplete="email"
            inputMode="email"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your-email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="dl-company">
            会社名 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="dl-company"
            name="company_name"
            required
            autoComplete="organization"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="株式会社○○"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="dl-name">
            お名前 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="dl-name"
            name="from_name"
            required
            autoComplete="name"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="dl-phase">
            検討段階 <span className="text-destructive">*</span>
          </label>
          <select
            id="dl-phase"
            name="phase_value"
            required
            defaultValue=""
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="" disabled>
              選択してください
            </option>
            {PHASE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2" htmlFor="dl-note">
            ご質問・補足（任意）
          </label>
          <textarea
            id="dl-note"
            name="note"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="検討中のシステムの概要や、特に知りたい点などあればご記入ください"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          送信することで
          <a href="/privacy" className="text-primary-500 hover:text-primary-600 underline mx-1">
            プライバシーポリシー
          </a>
          に同意したものとみなします。営業目的の一斉メール配信は行いません。
        </p>

        {status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl"
          >
            <p className="text-destructive font-medium mb-1">送信できませんでした</p>
            <p className="text-sm text-foreground/80">{errorMessage}</p>
            <p className="text-sm text-foreground/70 mt-2">
              繰り返し失敗する場合は
              <a href="mailto:support@beekle.jp" className="text-primary-500 underline mx-1">
                support@beekle.jp
              </a>
              までご連絡ください。
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center items-center w-full px-8 py-4 min-h-[52px] rounded-full font-semibold text-white text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 shadow-soft hover:shadow-medium focus:ring-primary-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <title>送信中</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                送信中...
              </>
            ) : (
              '資料をダウンロードする（無料）'
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            通常2営業日以内に担当者からご連絡する場合があります（不要な場合は資料DLのみで完結します）。
          </p>
        </div>
      </form>
    </div>
  );
};

export default DownloadZeroStartForm;
