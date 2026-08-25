import { CheckCircle, Lightbulb, PhoneCall, Rocket, TestTube } from 'lucide-react';
import type React from 'react';

// 各Stepは「Beekleがすること」「お客様にお願いすること」「この段階で決まること」の3列で見せる。
// 金銭負担がないことと「リスクがない」ことは同義ではないため、リスクゼロ系の表現は使わない
// (tasks-v3 TASK-P0-05 / [VALUE-1] 総コスト = 価格 + 金銭以外の負担)。
interface ProcessStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  duration: string;
  cost: string;
  description: string;
  beekle: string[];
  customer: string[];
  decision: string;
  highlight?: boolean;
}

const processSteps: ProcessStep[] = [
  {
    icon: PhoneCall,
    title: 'お問い合わせ・業務理解',
    duration: '1-2時間',
    cost: '無料',
    description:
      '課題や実現したいことをお聞かせください。オンラインまたは訪問でのヒアリングで、何を検証すべきかを一緒に決めます。',
    beekle: ['業務フロー・利用者・課題の整理', '検証すべき仮説のご提案'],
    customer: ['現行業務・資料・関係者の共有'],
    decision: '何を検証するべきか（検証仮説）',
  },
  {
    icon: Lightbulb,
    title: 'ゼロスタート開発（検証用プロトタイプ）',
    duration: '1-2週間（目安）',
    cost: '初期費用0円',
    description:
      '最重要の仮説を確認できる検証用プロトタイプを開発します（成果物の譲渡を伴う納品ではありません）。',
    beekle: ['コア機能に絞った検証用プロトタイプ開発', '実業務で試せる形でのお試し提供（検証用）'],
    customer: ['検証用データ・サンプルの用意', '検証担当者の参加'],
    decision: '実物で何を確認するか',
    highlight: true,
  },
  {
    icon: TestTube,
    title: '実業務での確認・効果検証',
    duration: '1-2週間（目安）',
    cost: '無料',
    description:
      '実際の業務環境で試用いただき、業務適合・要件のズレ・データ・利用者の反応を確認します。',
    beekle: ['代表ケースでの効果確認', '効果の方向性・改善余地の整理'],
    customer: ['実業務に近いケースで触る', '利用者の反応・気づきの共有'],
    decision: '業務に合うか。何を直せば使えるか',
  },
  {
    icon: CheckCircle,
    title: '投資条件の整理',
    duration: '応相談',
    cost: '見積提示',
    description:
      '検証結果をもとに、次に投資する条件と見送り条件を整理します。見送りの場合、開発費用の負担はありません。動く実物があるため、投資する場合の見積もり精度が高くなります。',
    beekle: ['検証結果の整理', '本開発の見積・進め方のご提案'],
    customer: ['社内での投資判断'],
    decision: '次に投資する条件。PoC・MVP・本開発のどこから始めるか',
  },
  {
    icon: Rocket,
    title: '本開発・運用改善',
    duration: '継続的に対応',
    cost: '個別見積・保守契約',
    description:
      '検証で作ったものと学びをそのまま引き継いで本開発へ。公開後も保守サポートと継続改善を行います。',
    beekle: ['本番品質での開発・公開', '保守サポート・継続的な改善提案'],
    customer: ['フィードバックと優先順位の判断'],
    decision: '次に何を改善するか',
  },
];

const COLUMN_LABELS = {
  beekle: 'Beekleがすること',
  customer: 'お客様にお願いすること',
  decision: 'この段階で決まること',
} as const;

export const ProcessSteps = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {processSteps.map((step, idx) => (
            <div key={step.title} className="relative pb-8" data-step-index={idx}>
              {idx !== processSteps.length - 1 && (
                <div
                  className="absolute left-8 top-8 h-full w-px bg-neutral-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start">
                <span
                  className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-500 ${
                    step.highlight ? 'bg-primary-500 ring-2 ring-primary-100' : 'bg-primary-500'
                  }`}
                  style={{
                    transitionDelay: `${idx * 0.15 + 0.1}s`,
                  }}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </span>
                <div
                  className={`ml-6 flex-1 rounded-lg border p-6 transition-colors ${
                    step.highlight
                      ? 'border-primary-200 bg-primary-50/60'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                    {step.highlight && (
                      <span className="inline-flex items-center rounded-md bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                        初期費用0円
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="inline-flex items-center rounded-md bg-primary-50 px-3 py-1 text-sm font-medium text-primary-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${
                        step.cost === '初期費用0円' || step.cost === '無料'
                          ? 'text-secondary-500 bg-secondary-50'
                          : 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      {step.cost}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 leading-relaxed">{step.description}</p>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-md bg-gray-50 p-4">
                      <p className="text-xs font-bold text-primary-500 mb-2">
                        {COLUMN_LABELS.beekle}
                      </p>
                      <ul className="space-y-1.5">
                        {step.beekle.map((item) => (
                          <li key={item} className="flex items-start text-sm text-gray-600">
                            <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-sm bg-primary-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md bg-gray-50 p-4">
                      <p className="text-xs font-bold text-primary-500 mb-2">
                        {COLUMN_LABELS.customer}
                      </p>
                      <ul className="space-y-1.5">
                        {step.customer.map((item) => (
                          <li key={item} className="flex items-start text-sm text-gray-600">
                            <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-sm bg-primary-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
                      <p className="text-xs font-bold text-primary-600 mb-2">
                        {COLUMN_LABELS.decision}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                        {step.decision}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
