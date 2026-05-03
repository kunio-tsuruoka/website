import { trackCtaClick } from '@/lib/analytics';
import { useState } from 'react';

type Goal = 'dx' | 'new-app' | 'requirements' | 'rfp';

const GOALS: Array<{
  id: Goal;
  emoji: string;
  title: string;
  description: string;
  recommendedHref: string;
  recommendedLabel: string;
  reason: string;
}> = [
  {
    id: 'dx',
    emoji: '🔁',
    title: 'いまの業務を見直して DX したい',
    description: '紙やExcel、属人化した業務を整理して、AIや自動化を入れたい',
    recommendedHref: '/tools/flow-mapper',
    recommendedLabel: '業務フロー可視化ツールから始める',
    reason:
      '現状の業務を担当ごとに洗い出すのが先。「どこをDXするか」は可視化しないと議論できません。',
  },
  {
    id: 'new-app',
    emoji: '✨',
    title: '新しいシステムやアプリを作りたい',
    description: 'やりたいことが頭にあるが、要件としてまだ言語化できていない',
    recommendedHref: '/tools/story-builder',
    recommendedLabel: 'ユーザーストーリー作成ツールから始める',
    reason:
      'まず「やりたいこと」を言葉にして、ユースケースとシナリオに落とすのが先。フロー整理は後でも追いつきます。',
  },
  {
    id: 'requirements',
    emoji: '📋',
    title: 'すでに要件は出ているが、取捨選択したい',
    description: '社内ヒアリングやベンダー提案で要件は溜まっている。優先順位を決めたい',
    recommendedHref: '/tools/scope-manager',
    recommendedLabel: 'スコープ管理ツールから始める',
    reason: 'ビジネス価値・現場で使えるか・コストの3軸で「作る／後回し／作らない」を判定します。',
  },
  {
    id: 'rfp',
    emoji: '📑',
    title: 'すぐにRFP（提案依頼書）を書きたい',
    description: '開発会社に渡す資料を、章立てに沿って手早く形にしたい',
    recommendedHref: '/tools/rfp-builder',
    recommendedLabel: 'RFPドラフト自動生成から始める',
    reason: '基本情報だけ入れても章立てされたRFPテンプレが作れます。後から各ツールを足してOK。',
  },
];

export function ToolWizard() {
  const [selected, setSelected] = useState<Goal | null>(null);
  const goal = GOALS.find((g) => g.id === selected);

  return (
    <section className="bg-white rounded-2xl shadow-soft border-2 border-primary-200 p-6 md:p-8">
      <h2 className="text-lg md:text-xl font-bold text-primary-900 mb-2">
        どこから始めるか迷ったら
      </h2>
      <p className="text-sm text-gray-700 mb-5">
        いま一番困っていることに近いものを選んでください。最適なツールをご案内します。
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelected(g.id)}
            className={`text-left p-4 rounded-xl border-2 transition-colors min-h-[44px] ${
              selected === g.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden>
                {g.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{g.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{g.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {goal && (
        <div className="mt-5 p-5 bg-gradient-to-br from-primary-50 to-white rounded-xl border-2 border-primary-300">
          <p className="text-sm text-primary-900 mb-3 leading-relaxed">{goal.reason}</p>
          <a
            href={goal.recommendedHref}
            onClick={() =>
              trackCtaClick({
                source: 'tool-wizard',
                cta: goal.id,
                meta: { dest: goal.recommendedHref },
              })
            }
            className="inline-flex items-center justify-center px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 shadow-soft"
          >
            {goal.recommendedLabel} →
          </a>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            必要に応じて他のツールも組み合わせて使えます。すべてブラウザ完結・会員登録不要・データは端末にのみ保存されます。
          </p>
        </div>
      )}
    </section>
  );
}
