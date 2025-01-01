
import { Database, LineChart, PhoneCall, Settings, Users } from 'lucide-react';

const processSteps = [
  {
    icon: PhoneCall,
    title: '初回無料相談',
    duration: '30分',
    description: 'お客様の課題やご要望をヒアリングし、最適なソリューションを提案いたします。',
    details: ['現状の課題ヒアリング', '予算・スケジュールの確認', '概算見積りの提示'],
  },
  {
    icon: Users,
    title: '要件定義',
    duration: '2-4週間',
    description: '具体的な要件を整理し、プロジェクト計画を策定します。',
    details: ['ビジネス要件の整理', '機能要件の定義', 'システム構成の検討', 'スケジュール策定'],
  },
  {
    icon: Database,
    title: '基本設計・詳細設計',
    duration: '4-8週間',
    description: 'システムの詳細な設計を行い、開発の基盤を固めます。',
    details: [
      'システムアーキテクチャの設計',
      'データベース設計',
      '画面設計・API設計',
      'セキュリティ設計',
    ],
  },
  {
    icon: LineChart,
    title: '開発・テスト',
    duration: '8-12週間',
    description: '設計に基づいて実装を進め、品質を確保します。',
    details: [
      'フロントエンド/バックエンド開発',
      '単体テスト・結合テスト',
      '性能テスト・セキュリティテスト',
      'ユーザー受入テスト',
    ],
  },
  {
    icon: Settings,
    title: 'リリース・運用保守',
    duration: '継続的に対応',
    description: '本番環境への展開と、安定的な運用体制を確立します。',
    details: ['システムの本番展開', '運用手順の整備', '監視体制の確立', '保守・メンテナンス対応'],
  },
];

export const ProcessSteps = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {processSteps.map((step, idx) => (
            <div key={step.title} className="relative pb-8">
              {idx !== processSteps.length - 1 && (
                <div
                  className="absolute left-8 top-8 h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start">
                <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-600">
                  <step.icon className="h-8 w-8 text-white" />
                </span>
                <div className="ml-6">
                  <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">所要期間：{step.duration}</p>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center text-gray-500">
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        {detail}
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
