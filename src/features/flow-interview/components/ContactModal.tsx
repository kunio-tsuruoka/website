import { trackCtaClick } from '@/lib/analytics';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useFlowInterviewStore } from '../store';
import { buildContactMessage } from '../utils/contact-message';

// 連絡先フォームのバリデーション（zod）。message は生成内容を自動同梱するためフォーム項目に含めない。
const ContactFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
  name: z.string().trim().max(100, '長すぎます').optional(),
  company: z.string().trim().max(100, '長すぎます').optional(),
});
type ContactFormValues = z.infer<typeof ContactFormSchema>;

// 在席のまま氏名/会社/メールを入力して /api/contact 経由で Slack 通知する。
// 「話すだけ発注準備」で作成した As-Is/To-Be/RFP を message に同梱する。
export function ContactModal() {
  const open = useFlowInterviewStore((s) => s.contactOpen);
  const intent = useFlowInterviewStore((s) => s.contactIntent);
  const closeContact = useFlowInterviewStore((s) => s.closeContact);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: { email: '', name: '', company: '' },
  });

  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  // ESC で閉じる（送信中は無効）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeContact();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isSubmitting, closeContact]);

  if (!open) return null;

  const onValid = async (values: ContactFormValues) => {
    setServerError('');
    const s = useFlowInterviewStore.getState();
    const message = buildContactMessage({
      diagram: s.diagram,
      suggestions: s.suggestions,
      suggestSummary: s.suggestSummary,
      rfpMarkdown: s.rfpMarkdown,
    });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name ?? '',
          company: values.company ?? '',
          message,
          type: 'consultation',
          source: 'flow-interview',
          intent,
          // 会話開始時に Turnstile 検証済みのセッション。サーバーで KV 実在を確認して再検証を免除。
          sessionId: s.sessionId ?? '',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setServerError(data.error || `送信に失敗しました (${res.status})`);
        return;
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          source: 'flow-interview',
          form_id: 'flow-interview-contact',
          intent,
          transport_type: 'beacon',
        });
      }
      trackCtaClick({ source: 'flow-interview', cta: 'contact-submitted', meta: { intent } });
      setDone(true);
    } catch {
      setServerError('通信エラーが発生しました。時間をおいて再度お試しください。');
    }
  };

  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景: クリックで閉じる（button なのでキーボード操作も可能） */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={() => !isSubmitting && closeContact()}
        className="absolute inset-0 bg-black/50 cursor-default"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-strong p-6 max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="text-center py-4">
            <h3 className="text-lg font-bold text-navy-950 mb-2">送信しました</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              作成した内容と一緒にBeekleへお送りしました。担当より折り返しご連絡します。
            </p>
            <button
              type="button"
              onClick={closeContact}
              className="px-6 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-navy-950">Beekleに相談する</h3>
              <button
                type="button"
                onClick={closeContact}
                aria-label="閉じる"
                className="text-gray-400 hover:text-gray-600 -mt-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <title>閉じる</title>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              ここまで作成した業務フロー・改善案・RFPを添えてお送りします。連絡先だけご入力ください。
            </p>

            <form onSubmit={handleSubmit(onValid)} className="space-y-3" noValidate>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="fc-email">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  id="fc-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={inputCls}
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="fc-name">
                  お名前
                </label>
                <input
                  id="fc-name"
                  autoComplete="name"
                  className={inputCls}
                  placeholder="山田 太郎"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label
                  className="block text-xs font-medium text-gray-600 mb-1"
                  htmlFor="fc-company"
                >
                  会社名
                </label>
                <input
                  id="fc-company"
                  autoComplete="organization"
                  className={inputCls}
                  placeholder="株式会社○○"
                  {...register('company')}
                />
                {errors.company && (
                  <p className="text-xs text-red-600 mt-1">{errors.company.message}</p>
                )}
              </div>

              {serverError && <p className="text-sm text-red-600">{serverError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-5 py-3 min-h-[48px] rounded-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold transition"
              >
                {isSubmitting ? '送信中…' : 'この内容で送信する'}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                送信内容はBeekle社内の確認用のみに使用します。
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
