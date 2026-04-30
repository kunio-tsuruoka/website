import type React from 'react';
import { useEffect, useState } from 'react';

type SubmitStatus = 'idle' | 'submitting' | 'error';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Provenance = {
  source: string;
  intent: string;
  phase: string;
};

const PROVENANCE_MAX_LENGTH = 80;
const PROVENANCE_PATTERN = /^[a-zA-Z0-9_\-./]+$/;

function sanitizeParam(raw: string | null): string {
  if (!raw) return '';
  if (raw.length > PROVENANCE_MAX_LENGTH) return '';
  return PROVENANCE_PATTERN.test(raw) ? raw : '';
}

const ContactForm = () => {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [provenance, setProvenance] = useState<Provenance>({ source: '', intent: '', phase: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setProvenance({
      source: sanitizeParam(sp.get('source')),
      intent: sanitizeParam(sp.get('intent')),
      phase: sanitizeParam(sp.get('phase')),
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('from_name') || '',
      email: formData.get('reply_to'),
      message: formData.get('message'),
      type: formData.get('type'),
      company: formData.get('company_name') || '',
      phone: formData.get('phone') || '',
      source: provenance.source,
      intent: provenance.intent,
      phase: provenance.phase,
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

      if (typeof window.gtag === 'function') {
        const eventParams: Record<string, string> = {
          form_id: 'contact',
          form_type: typeof data.type === 'string' ? data.type : 'unknown',
        };
        if (provenance.source) eventParams.source = provenance.source;
        if (provenance.intent) eventParams.intent = provenance.intent;
        if (provenance.phase) eventParams.phase = provenance.phase;
        window.gtag('event', 'generate_lead', eventParams);
        window.gtag('event', 'form_submit', eventParams);
      }

      window.location.href = '/thanks';
    } catch (error) {
      const msg = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="bg-white rounded-[32px] shadow-soft p-8 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="type">
            ご相談内容の種別 <span className="text-destructive">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue="consultation"
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="consultation">まずは相談したい</option>
            <option value="web">Webアプリ開発について</option>
            <option value="mobile">モバイルアプリ開発について</option>
            <option value="prototype">プロトタイプ・POC作成について</option>
            <option value="ai">AI/AIエージェント開発について</option>
            <option value="global">海外向けサービス開発について</option>
            <option value="other">その他</option>
          </select>
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
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="message">
            ご相談内容 <span className="text-destructive">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="現状の課題や、検討中のサービス・規模感などを簡単にご記入ください。詳細はやりとりの中で詰めて参ります。"
          />
          <p className="text-sm text-muted-foreground mt-2">
            ざっくりで構いません。返信時にこちらから具体的に質問させていただきます。
          </p>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-base font-medium text-foreground/70 hover:text-primary-500 select-none list-none flex items-center gap-2">
            <span className="text-primary-500 group-open:rotate-90 transition-transform">▶</span>
            会社名・お名前・電話番号も記入する（任意）
          </summary>
          <div className="space-y-6 mt-4 pl-4 border-l-2 border-primary-100">
            <div>
              <label
                className="block text-base font-medium text-foreground/80 mb-2"
                htmlFor="company"
              >
                会社名
              </label>
              <input
                type="text"
                id="company"
                name="company_name"
                autoComplete="organization"
                className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="株式会社○○"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="name">
                お名前
              </label>
              <input
                type="text"
                id="name"
                name="from_name"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label
                className="block text-base font-medium text-foreground/80 mb-2"
                htmlFor="phone"
              >
                電話番号
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="03-1234-5678"
              />
            </div>
          </div>
        </details>

        <input type="hidden" name="to_name" value="管理者" />

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
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl"
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

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center items-center w-full md:w-auto px-10 py-4 rounded-full font-semibold text-white text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSubmitting
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 shadow-soft hover:shadow-medium focus:ring-primary-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
              '無料で相談する'
            )}
          </button>
          <p className="text-sm text-muted-foreground mt-4">
            通常1〜2営業日以内に担当者からご返信します。
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
