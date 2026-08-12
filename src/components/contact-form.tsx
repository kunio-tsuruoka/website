import { getAttribution } from '@/lib/attribution';
import { consumeContactPrefill } from '@/lib/contact-prefill';
import { useTurnstile } from '@/lib/use-turnstile';
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

type ContactFormProps = {
  sitekey?: string;
};

type IntentGuide = {
  title: string;
  body: string;
  placeholder: string;
  emptyMessage: string;
};

const PROVENANCE_MAX_LENGTH = 80;
const PROVENANCE_PATTERN = /^[a-zA-Z0-9_\-./]+$/;
const DEFAULT_MESSAGE_PLACEHOLDER =
  '空欄でも送信できます。現状の課題、使いたいデータ、検討中のサービス、概算を知りたい内容などがあればご記入ください。';

const INTENT_TYPE_MAP: Record<string, string> = {
  'ai-accuracy': 'ai',
  'ai-development': 'ai',
  'ai-requirements': 'ai',
  'cdp-selection': 'cdp',
  'cost-breakdown': 'estimate',
  'document-ai-search': 'ai',
  'genai-adoption': 'ai',
  'genai-roi': 'ai',
  'pm-on-rails-ai-cost': 'pm_on_rails',
  'pm-on-rails-cost': 'estimate',
  'pm-on-rails-rag': 'ai',
  'pm-on-rails-requirements': 'pm_on_rails',
  'pm-on-rails-rfp': 'pm_on_rails',
  'quote-comparison': 'estimate',
  'rag-accuracy': 'ai',
  'rag-evaluation': 'ai',
  'rag-fit': 'ai',
  'rag-system-development': 'ai',
  'requirements-conversion': 'requirements',
  'requirements-guide': 'requirements',
  'requirements-process': 'requirements',
  'requirements-template': 'requirements',
  rfp: 'requirements',
};

const INTENT_GUIDES: Record<string, IntentGuide> = {
  'cdp-selection': {
    title: 'CDP選定の前提整理として受け付けます',
    body: '製品名が決まっていなくても、統合対象データ、施策ユースケース、運用体制から確認できます。',
    placeholder:
      '例: 比較中のCDP、統合したいデータ、使いたい施策、現状の運用体制などがあればご記入ください。',
    emptyMessage: 'CDP選定の前提整理について相談したいです。',
  },
  'genai-roi': {
    title: '生成AI導入の費用対効果整理として受け付けます',
    body: '対象業務、削減できそうな時間、品質リスク、社内説明に必要な材料を分けて確認します。',
    placeholder:
      '例: AI化したい業務、月間件数、現在かかっている時間、稟議で説明したい内容などがあればご記入ください。',
    emptyMessage: '生成AI導入の費用対効果について相談したいです。',
  },
  'pm-on-rails-ai-cost': {
    title: 'AI開発の費用前提整理として受け付けます',
    body: 'PoC、評価、データ、権限、運用を分けて、見積もり前に確認すべき前提を整理します。',
    placeholder:
      '例: 作りたいAI機能、使いたいデータ、PoCか本番化か、概算を知りたい範囲などがあればご記入ください。',
    emptyMessage: 'AI開発の費用前提について相談したいです。',
  },
  'pm-on-rails-cost': {
    title: '見積もり前提の整理として受け付けます',
    body: 'RFP、要件、既存見積もりから、範囲・非機能・運用・追加費用の前提を確認します。',
    placeholder:
      '例: 見積もりで不安な点、比較中の範囲、RFPや既存資料の要点などがあればご記入ください。',
    emptyMessage: '見積もり前提の整理について相談したいです。',
  },
  'pm-on-rails-rag': {
    title: 'RAGの用途・要件整理として受け付けます',
    body: '社内文書、想定質問、根拠、権限、評価方法を分けて、作るべき範囲を確認します。',
    placeholder:
      '例: 対象文書、想定質問、利用部署、回答精度や権限で不安な点などがあればご記入ください。',
    emptyMessage: 'RAGの用途と要件整理について相談したいです。',
  },
  'pm-on-rails-requirements': {
    title: 'RFP・As-Isからの要件定義相談として受け付けます',
    body: 'RFP、As-Is、議事録があれば、最初の返信でユースケース候補と抜けやすい受入条件を返します。',
    placeholder:
      '例: RFPやAs-Isの要点、今止まっている箇所、決めきれていない要件などがあればご記入ください。',
    emptyMessage: 'RFP・As-Isからの要件定義について相談したいです。',
  },
  'pm-on-rails-rfp': {
    title: 'RFP提出前の論点確認として受け付けます',
    body: '提案が比較不能になりそうな前提、受入条件、見積もり範囲の抜けを確認します。',
    placeholder:
      '例: RFPの目的、依頼予定の範囲、比較で不安な点、既存資料の要点などがあればご記入ください。',
    emptyMessage: 'RFP提出前の論点確認について相談したいです。',
  },
  'rag-accuracy': {
    title: 'AI回答の精度課題として受け付けます',
    body: '回答ミスの原因を、検索、生成、評価データ、権限設計のどこで起きているか切り分けます。',
    placeholder:
      '例: 間違いやすい質問、対象文書、根拠表示の有無、社内利用で不安な点などがあればご記入ください。',
    emptyMessage: 'AI回答の精度課題について相談したいです。',
  },
  'rag-evaluation': {
    title: 'RAG評価設計の相談として受け付けます',
    body: '既存RAG、PoC中、これから構築のどれでも、質問例と文書構造から評価方法を確認します。',
    placeholder:
      '例: 評価したいRAG、想定質問、正解データの有無、改善したい回答パターンなどがあればご記入ください。',
    emptyMessage: 'RAG評価設計について相談したいです。',
  },
  'rag-system-development': {
    title: '社内文書検索AI/RAG構築の相談として受け付けます',
    body: '必要な文書、権限、質問例、評価方法を確認し、導入可否と最初の作り方を整理します。',
    placeholder:
      '例: 対象文書、利用部署、検索したい内容、セキュリティや回答精度の不安などがあればご記入ください。',
    emptyMessage: '社内文書検索AI/RAG構築について相談したいです。',
  },
  'requirements-conversion': {
    title: '現場要望を発注要件へ変換する相談として受け付けます',
    body: '現場の要望メモを、見積もりや提案依頼に使えるユースケースと受入条件へ分けて整理します。',
    placeholder:
      '例: 現場から出ている要望、誰が使うか、今の業務で困っている点などがあればご記入ください。',
    emptyMessage: '現場要望を発注要件へ変換する相談をしたいです。',
  },
  'requirements-template': {
    title: '要件定義テンプレートの記入相談として受け付けます',
    body: 'テンプレートの空欄や記入済みメモから、発注に足りない論点を確認します。',
    placeholder:
      '例: 埋められない項目、作りたい機能、運用条件、社内で決めきれていない点などがあればご記入ください。',
    emptyMessage: '要件定義テンプレートの記入について相談したいです。',
  },
};

function sanitizeParam(raw: string | null): string {
  if (!raw) return '';
  if (raw.length > PROVENANCE_MAX_LENGTH) return '';
  return PROVENANCE_PATTERN.test(raw) ? raw : '';
}

function normalizeIntent(intent: string): string {
  return intent.replace(/-mid$/, '');
}

// 流入 intent → 相談種別 select の初期値。該当なしは空（既定 consultation のまま）。
function intentToType(intent: string): string {
  const normalized = normalizeIntent(intent);
  if (INTENT_TYPE_MAP[normalized]) return INTENT_TYPE_MAP[normalized];
  if (normalized.startsWith('partner')) return 'partner';
  if (normalized.startsWith('ai-development')) return 'ai';
  if (normalized.startsWith('genai-adoption')) return 'ai';
  if (normalized.startsWith('cdp')) return 'cdp';
  if (normalized.startsWith('dx')) return 'dx';
  if (normalized.startsWith('estimate')) return 'estimate';
  if (normalized.startsWith('pm-on-rails')) return 'pm_on_rails';
  if (normalized.startsWith('rag')) return 'ai';
  if (normalized.startsWith('requirements')) return 'requirements';
  if (normalized.startsWith('rfp')) return 'requirements';
  if (normalized.startsWith('tech-review')) return 'tech_review';
  return '';
}

function getIntentGuide(intent: string): IntentGuide | undefined {
  return INTENT_GUIDES[normalizeIntent(intent)];
}

const ContactForm = ({ sitekey }: ContactFormProps) => {
  const turnstileEnabled = !!sitekey;
  const {
    containerRef,
    token: turnstileToken,
    reset: resetTurnstile,
  } = useTurnstile(sitekey ?? '');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [provenance, setProvenance] = useState<Provenance>({ source: '', intent: '', phase: '' });
  // ツール（話すだけ発注準備 等）からの引き継ぎ内容を message に反映する
  const [message, setMessage] = useState('');
  // 流入元の intent から相談種別を初期選択し、入力の手間を減らす（Slack 通知の分類精度も上がる）
  const [inquiryType, setInquiryType] = useState('consultation');
  const intentGuide = getIntentGuide(provenance.intent);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const intent = sanitizeParam(sp.get('intent'));
    setProvenance({
      source: sanitizeParam(sp.get('source')),
      intent,
      phase: sanitizeParam(sp.get('phase')),
    });
    const mappedType = intentToType(intent);
    if (mappedType) setInquiryType(mappedType);
    const prefill = consumeContactPrefill();
    if (prefill) setMessage(prefill);
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
    const selectedType = String(formData.get('type') || 'consultation');
    const rawMessage = String(formData.get('message') || '').trim();
    const data = {
      name: formData.get('from_name') || '',
      email: formData.get('reply_to'),
      message:
        rawMessage || intentGuide?.emptyMessage || `相談内容は未記入です。種別: ${selectedType}`,
      type: selectedType,
      company: formData.get('company_name') || '',
      phone: formData.get('phone') || '',
      source: provenance.source,
      intent: provenance.intent,
      phase: provenance.phase,
      turnstileToken: turnstileToken ?? '',
      // 流入元（入口ページ・参照元・UTM・GA client_id）を問い合わせ通知へ同送
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
        form_id: 'contact',
        form_type: typeof data.type === 'string' ? data.type : 'unknown',
      };
      if (provenance.source) eventParams.source = provenance.source;
      if (provenance.intent) eventParams.intent = provenance.intent;
      if (provenance.phase) eventParams.phase = provenance.phase;

      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        const thanksParams = new URLSearchParams();
        if (provenance.source) thanksParams.set('source', provenance.source);
        if (provenance.intent) thanksParams.set('intent', provenance.intent);
        if (provenance.phase) thanksParams.set('phase', provenance.phase);
        const query = thanksParams.toString();
        window.location.href = query ? `/thanks?${query}` : '/thanks';
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
    <div className="bg-white rounded-[32px] shadow-soft p-8 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        {intentGuide && (
          <div className="border-l-4 border-primary-400 bg-primary-50 px-4 py-3">
            <p className="text-sm font-bold text-primary-800">{intentGuide.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/75">{intentGuide.body}</p>
          </div>
        )}

        <div>
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="type">
            ご相談内容の種別 <span className="text-destructive">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="consultation">まずは相談したい</option>
            <option value="estimate">見積もり妥当性・概算費用を聞きたい</option>
            <option value="requirements">作りたいもの・依頼内容を整理したい</option>
            <option value="pm_on_rails">RFP・As-Isから要件定義を進めたい</option>
            <option value="web">Webアプリ開発について</option>
            <option value="mobile">モバイルアプリ開発について</option>
            <option value="prototype">15分で開発方針を整理したい</option>
            <option value="ai">社内資料や業務データをAIで使いたい</option>
            <option value="cdp">顧客データを整理・活用したい</option>
            <option value="dx">業務改善・AI導入について</option>
            <option value="tech_review">社内データ・既存システムの不安を相談したい</option>
            <option value="global">海外向けサービス開発について</option>
            <option value="partner">開発パートナー・協業のご相談（開発会社・SIer様）</option>
            <option value="other">その他</option>
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
          <label className="block text-base font-medium text-foreground/80 mb-2" htmlFor="message">
            ご相談内容・補足（任意）
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-input focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder={intentGuide?.placeholder ?? DEFAULT_MESSAGE_PLACEHOLDER}
          />
          <p className="text-sm text-muted-foreground mt-2">
            まとまっていなくて構いません。返信時にこちらから具体的に質問します。
          </p>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-base font-medium text-foreground/70 hover:text-primary-500 select-none list-none flex items-center gap-2">
            <span className="text-primary-500 group-open:rotate-90 transition-transform">▶</span>
            会社名・電話番号も記入する（任意）
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

        {turnstileEnabled && (
          <div className="flex flex-col items-center gap-2">
            <div ref={containerRef} aria-label="セキュリティチェック" />
          </div>
        )}

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={submitDisabled}
            className={`inline-flex justify-center items-center w-full md:w-auto px-10 py-4 rounded-full font-semibold text-white text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              submitDisabled
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
              'この内容で送る'
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
