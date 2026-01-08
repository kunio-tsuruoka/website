import React from 'react';
import {
  CheckCircle,
  Lightbulb,
  PhoneCall,
  Rocket,
  TestTube,
} from 'lucide-react';

interface ProcessStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  duration: string;
  cost: string;
  description: string;
  details: string[];
  highlight?: boolean;
}

const processSteps: ProcessStep[] = [
  {
    icon: PhoneCall,
    title: 'お問い合わせ・ヒアリング',
    duration: '1-2時間',
    cost: '無料',
    description:
      '課題や実現したいことをお聞かせください。オンラインまたは訪問でのヒアリングを実施します。',
    details: ['現状の課題ヒアリング', '実現したいことの確認', '大まかな方向性の提案'],
  },
  {
    icon: Lightbulb,
    title: 'ゼロスタート開発',
    duration: '1-2週間',
    cost: '初期費用0円',
    description:
      '初期費用0円で、動くプロトタイプを開発。実際の業務で試せる形でお届けします。',
    details: [
      'コア機能のMVP開発',
      '実業務で試せる形での納品',
      'リスクなしで効果を確認',
      '買取しなくても費用負担なし',
    ],
    highlight: true,
  },
  {
    icon: TestTube,
    title: '実機テスト・効果検証',
    duration: '1-2週間',
    cost: '無料',
    description:
      '実際の業務環境で試用いただき、効果を数値で確認。ROIやコスト削減効果を可視化します。',
    details: [
      '実業務環境での試用',
      '効果の数値化・可視化',
      'ROI・コスト削減効果の算出',
      '本格導入判断材料の提供',
    ],
  },
  {
    icon: CheckCircle,
    title: '導入判断・本開発へ',
    duration: '応相談',
    cost: '見積提示',
    description:
      '効果を確認できたら、本格開発へ進みます。既に動く基盤があるため、精度の高い見積もりと短期間での展開が可能です。',
    details: [
      '採用の場合：本開発・拡張へスムーズ移行',
      '見送りの場合：費用負担なし・リスクゼロ',
      '動く基盤があるため見積精度が高い',
      '短期間での本番展開が可能',
    ],
  },
  {
    icon: Rocket,
    title: '運用開始・継続改善',
    duration: '継続的に対応',
    cost: '保守契約',
    description:
      '本番環境での運用を開始。保守サポートや追加機能開発も柔軟に対応します。',
    details: [
      'システムの本番稼働',
      '保守サポート対応',
      '追加機能の開発',
      '継続的な改善提案',
    ],
  },
];

export const ProcessSteps = () => {
  const [visibleSteps, setVisibleSteps] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-step-index') || '0');
            setVisibleSteps((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('[data-step-index]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {processSteps.map((step, idx) => (
            <div
              key={step.title}
              className="relative pb-8"
              data-step-index={idx}
              style={{
                opacity: visibleSteps.has(idx) ? 1 : 0,
                transform: visibleSteps.has(idx)
                  ? 'translateY(0)'
                  : 'translateY(30px)',
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.15}s`,
              }}
            >
              {idx !== processSteps.length - 1 && (
                <div
                  className="absolute left-8 top-8 h-full w-0.5 bg-gradient-to-b from-primary-300 to-transparent"
                  style={{
                    opacity: visibleSteps.has(idx) ? 1 : 0,
                    transition: `opacity 0.8s ease ${idx * 0.15 + 0.3}s`,
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start">
                <span
                  className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                    step.highlight
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg'
                      : 'bg-primary-500'
                  } ${visibleSteps.has(idx) ? 'scale-100 rotate-0' : 'scale-75 rotate-180'}`}
                  style={{
                    transitionDelay: `${idx * 0.15 + 0.1}s`,
                  }}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </span>
                <div
                  className={`ml-6 flex-1 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 ${
                    step.highlight
                      ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                    {step.highlight && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white animate-pulse">
                        おすすめ
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center text-sm text-primary-500 font-medium bg-primary-50 px-3 py-1 rounded-full transition-all hover:bg-primary-100 hover:scale-105">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {step.duration}
                    </span>
                    <span
                      className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full transition-all hover:scale-105 ${
                        step.cost === '初期費用0円' || step.cost === '無料'
                          ? 'text-secondary-500 bg-secondary-50 hover:bg-secondary-100'
                          : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {step.cost}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 leading-relaxed">{step.description}</p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((detail, detailIdx) => (
                      <li
                        key={detail}
                        className="flex items-start text-gray-600"
                        style={{
                          opacity: visibleSteps.has(idx) ? 1 : 0,
                          transform: visibleSteps.has(idx)
                            ? 'translateX(0)'
                            : 'translateX(-20px)',
                          transition: `all 0.4s ease ${
                            idx * 0.15 + 0.3 + detailIdx * 0.1
                          }s`,
                        }}
                      >
                        <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
