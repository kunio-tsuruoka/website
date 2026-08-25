import { getAttribution } from '@/lib/attribution';
import { useTurnstile } from '@/lib/use-turnstile';
import type React from 'react';
import { useEffect, useState } from 'react';

type SubmitStatus = 'idle' | 'submitting' | 'error';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type CareersContactFormProps = {
  sitekey?: string;
};

const PROVENANCE_MAX_LENGTH = 80;
const PROVENANCE_PATTERN = /^[a-zA-Z0-9_\-./]+$/;

function sanitizeParam(raw: string | null): string {
  if (!raw) return '';
  if (raw.length > PROVENANCE_MAX_LENGTH) return '';
  return PROVENANCE_PATTERN.test(raw) ? raw : '';
}

const CareersContactForm = ({ sitekey }: CareersContactFormProps) => {
  const turnstileEnabled = !!sitekey;
  const {
    containerRef,
    token: turnstileToken,
    reset: resetTurnstile,
  } = useTurnstile(sitekey ?? '');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [source, setSource] = useState('');
  const [inquiryType, setInquiryType] = useState('recruitment_casual');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setSource(sanitizeParam(sp.get('source')) || 'careers');
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    if (turnstileEnabled && !turnstileToken) {
      setErrorMessage(
        'セキュリティチェックが完了していません。ページを再読み込みしてお試しください。'
      );
      setStatus('error');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedType = String(formData.get('type') || 'recruitment_casual');
    const rawMessage = String(formData.get('message') || '').trim();
    const data = {
      name: formData.get('from_name') || '',
      email: formData.get('reply_to'),
      message: rawMessage || '採用についての連絡です。',
      type: selectedType,
      company: formData.get('affiliation') || '',
      phone: formData.get('phone') || '',
      source,
      intent: 'recruitment',
      phase: '',
      buyingStage: '',
      turnstileToken: turnstileToken ?? '',
      ...getAttribution(),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.details || `送信に失敗しました (${response.status})`
        );
      }

      const eventParams: Record<string, string> = {
        form_id: 'careers-contact',
        form_type: selectedType,
      };
      if (source) eventParams.source = source;

      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        const thanksParams = new URLSearchParams({ from: 'careers' });
        if (source) thanksParams.set('source', source);
        window.location.href = `/thanks?${thanksParams.toString()}`;
      };
      const fallback = window.setTimeout(navigate, 1500);

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { ...eventParams, transport_type: 'beacon' });
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
      resetTurnstile();
    }
  };

  const isSubmitting = status === 'submitting';
  const submitDisabled = isSubmitting || (turnstileEnabled && !turnstileToken);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-8 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="type">
            ご用件 <span className="text-destructive">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="recruitment_casual">カジュアル面談を希望</option>
            <option value="recruitment_newgrad">新卒応募</option>
            <option value="recruitment_midcareer">中途応募</option>
          </select>
        </div>

        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="name">
            お名前 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="from_name"
            required
            autoComplete="name"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="email">
            メールアドレス <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="reply_to"
            required
            autoComplete="email"
            inputMode="email"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your-email@example.com"
          />
        </div>

        <div>
          <label
            className="block text-base font-medium text-foreground/80 mb-2"
            htmlFor="affiliation"
          >
            現所属 <span className="text-sm text-muted-foreground">（任意）</span>
          </label>
          <input
            type="text"
            id="affiliation"
            name="affiliation"
            autoComplete="organization"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="学校名・勤務先など"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="message">
            自己紹介・ご質問 <span className="text-sm text-muted-foreground">（任意）</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="経歴の要約、興味のある仕事、聞きたいことなど。空欄でも送れます。"
          />
        </div>

        <details className="group">
          <summary className="cursor-pointer text-base font-medium text-foreground/70 hover:text-primary-500 select-none list-none flex items-center gap-2">
            <span className="text-primary-500 group-open:rotate-90 transition-transform">▶</span>
            電話番号も記入する（任意）
          </summary>
          <div className="mt-4 pl-4 border-l-2 border-primary-100">
            <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="phone">
              電話番号
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="090-1234-5678"
            />
          </div>
        </details>

        <p className="text-sm text-muted-foreground">
          送信することで
          <a href="/privacy" className="text-primary-500 hover:text-primary-600 underline mx-1">
            プライバシーポリシー
          </a>
          に同意したものとみなします。
        </p>

        {status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-destructive font-medium mb-1">送信できませんでした</p>
            <p className="text-sm text-foreground/80">{errorMessage}</p>
            <p className="text-sm text-foreground/70 mt-2">
              繰り返し失敗する場合は、お手数ですが
              <a href="mailto:support@beekle.jp" className="text-primary-500 underline mx-1">
                support@beekle.jp
              </a>
              まで直接ご連絡ください。
            </p>
          </div>
        )}

        {turnstileEnabled && (
          <div className="flex flex-col items-center gap-2">
            <div ref={containerRef} aria-label="セキュリティチェック" />
          </div>
        )}

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={submitDisabled}
            className={`inline-flex justify-center items-center w-full md:w-auto px-10 py-4 rounded-md font-semibold text-white text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              submitDisabled
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
            }`}
          >
            {isSubmitting ? '送信中...' : 'この内容で送る'}
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            通常1〜2営業日以内に採用担当から返信します。
          </p>
        </div>
      </form>
    </div>
  );
};

export default CareersContactForm;
