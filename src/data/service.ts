import type { ServiceDetail } from '@/types/service';

export const services: ServiceDetail[] = [
  {
    id: 'web-mobile-development',
    title: 'WEBアプリ・モバイルアプリ開発',
    description: 'モバイルアプリの設計・プロトタイプ制作・デザイン・構築を行います。',
    longDescription:
      'アプリケーション・システム開発業務のみではなく、そもそもの解決したい課題は何なのか？といった要件定義やサービスデザインから始まり、サービスを継続的に発展させる運用フェーズまで幅広くサポートする事が可能です。マーケティングに精通しているメンバーも在籍しており、マーケティングの支援とアプリケーションの制作セットでお客様を支援することが可能です。',
    painPoints: [
      {
        title: '開発リソース不足',
        description:
          '社内のエンジニアリソースが限られており、新規開発や既存システムの改修に時間がかかっている',
      },
      {
        title: '保守性・拡張性の課題',
        description: '既存システムの技術的負債が蓄積し、新機能追加や改修に時間とコストがかかる',
      },
      {
        title: 'セキュリティ対策',
        description: '増加するサイバー攻撃やデータ漏洩リスクへの対応が追いついていない',
      },
      {
        title: 'ユーザー体験の最適化',
        description: 'システムの使いづらさによるユーザーからの不満や、業務効率の低下が発生している',
      },
    ],
    solutions: [
      {
        title: 'アジャイル開発プロセス',
        description: '継続的なフィードバックと改善を通じて、品質の高いシステムを迅速に提供',
        results: ['開発スピードの向上', '手戻りの最小化', '品質の確保'],
      },
      {
        title: 'モダンアーキテクチャの採用',
        description: '最新のテクノロジーとベストプラクティスを活用し、保守性と拡張性を確保',
        results: ['保守コストの削減', 'システム性能の向上', '将来の拡張性確保'],
      },
      {
        title: 'セキュアな開発・運用体制',
        description: '設計段階からセキュリティを考慮し、継続的なモニタリングと対策を実施',
        results: ['セキュリティリスクの低減', 'コンプライアンス対応', '信頼性の向上'],
      },
    ],
    caseStudies: [
      {
        title: '社内業務システムのリプレイス',
        challenge: 'レガシーシステムによる業務非効率と高額な運用コスト',
        solution: 'クラウドネイティブなマイクロサービスアーキテクチャへの移行',
        results: ['運用コスト40%削減', '処理時間60%短縮', 'ユーザー満足度90%達成'],
      },
      {
        title: 'モバイルアプリのUI/UX改善',
        challenge: '利用率低下と解約率の上昇',
        solution: 'ユーザー行動分析に基づく徹底的なUI/UX改善',
        results: ['継続率30%改善', 'ユーザー満足度25%向上', '機能利用率50%増加'],
      },
    ],
    features: [
      {
        title: 'フルスタック開発',
        description: 'フロントエンド、バックエンド、インフラまで一貫した開発体制で提供します。',
      },
      {
        title: 'クラウドネイティブ開発',
        description: 'AWS、GCP、Azureなど、主要クラウドサービスを活用した最適なインフラ構築。',
      },
      {
        title: 'セキュリティ対策',
        description: '脆弱性診断、セキュリティ監査、インシデント対応まで包括的に対応。',
      },
      {
        title: '運用保守サポート',
        description: '24時間365日の監視体制と、定期的な保守・アップデート対応の提供。',
      },
    ],
    benefits: [
      '要件定義から運用まで一貫したサポート',
      'セキュアで拡張性の高いシステム構築',
      '最新技術とベストプラクティスの採用',
      '継続的な改善と品質向上の実現',
    ],
    faq: [
      {
        question: '開発期間はどのくらいですか？',
        answer:
          '規模にもよりますが、小規模なシステムで3-4ヶ月、中規模で6-8ヶ月が目安です。段階的なリリースも可能です。',
      },
      {
        question: '既存システムの改修は可能ですか？',
        answer:
          '可能です。現状の課題を詳細に分析し、段階的な改善提案と実装を行います。必要に応じて、全面的なリプレイスも検討します。',
      },
      {
        question: '保守・運用体制はどうなっていますか？',
        answer:
          '24時間365日の監視体制を整えており、障害発生時の即時対応が可能です。また、定期的な保守点検とアップデートも含まれます。',
      },
    ],
  },
  {
    id: 'prototype-poc',
    title: 'プロトタイプ・POC作成',
    description:
      'プロダクトやサービスのアイデアをさまざまな形で具体化し、ニーズを検証。より良いアイデアへと昇華させます。',
    longDescription:
      '当社は、プロダクトやサービスのアイデアを様々な方法で実現可能な形に具体化し、ニーズがあるかを検証し、より効果的なアイデアに昇華することで、ユーザーにとって価値の高いプロダクトやサービスを作り上げることを目指しています。',
    painPoints: [
      {
        title: '市場投入の不確実性',
        description: '新規プロダクトの市場ニーズが不明確で、大規模開発のリスクが高い',
      },
      {
        title: '開発方向性の見極め',
        description: '複数のアプローチが考えられる中で、最適な技術選定や機能の優先順位付けが難しい',
      },
      {
        title: '予算と時間の制約',
        description: '限られたリソースの中で、効果的な検証を行う必要がある',
      },
      {
        title: 'ステークホルダーの合意形成',
        description: '社内外の関係者間で、プロダクトのビジョンや方向性の共有が困難',
      },
    ],
    solutions: [
      {
        title: '段階的な検証アプローチ',
        description: '仮説検証を小さな単位で繰り返し、リスクを最小化しながら開発を進めます',
        results: ['開発リスクの低減', '投資対効果の最大化', '早期の市場フィードバック獲得'],
      },
      {
        title: 'ユーザビリティテスト実施',
        description: '実際のユーザーによる検証を通じて、製品の改善点を特定します',
        results: ['ユーザーニーズの明確化', '機能優先順位の最適化', '使用性の向上'],
      },
    ],
    caseStudies: [
      {
        title: 'マッチングサービスのPOC開発',
        challenge: '新規決済サービスの技術的実現可能性の検証',
        solution: '4週間のスプリントで核となる機能のプロトタイプを開発',
        results: ['技術的な実現可能性を確認', '初期開発コストを70%削減', '本開発の期間を3ヶ月短縮'],
      },
      {
        title: '生成AIプロダクトのプロトタイピング',
        challenge: '技術実現性検証',
        solution: 'ユーザー目線のデザイン、ユースケース駆動開発、ベクトル検索の活用',
        results: ['設計サイクルを50%短縮', '製造コストを40%削減', 'ユーザーテストで高評価獲得'],
      },
    ],
    features: [
      {
        title: 'プロトタイプ開発',
        description: 'アイデアを素早く形にし、検証可能な状態まで作り上げます。',
      },
      {
        title: 'ユーザビリティ評価',
        description: '実際のユーザーの反応を観察し、改善点を洗い出します。',
      },
      {
        title: '実証実験支援',
        description: '本製品発注前の試作検証・実証実験のサポートを行います。',
      },
      {
        title: 'フィードバック分析',
        description: '収集したデータを分析し、製品改善への具体的な示唆を提供します。',
      },
    ],
    benefits: [
      '迅速なプロトタイプ作成による早期検証',
      '実ユーザーからのフィードバック獲得',
      'コスト効率の高い開発アプローチ',
      'リスクを最小限に抑えた製品開発',
    ],
    faq: [
      {
        question: 'プロトタイプ開発にはどのくらいの期間が必要ですか？',
        answer:
          '基本的な機能検証であれば3-4週間、より詳細な検証が必要な場合は2-3ヶ月程度を目安としています。完全にデザインは生成に任せて、プロトタイプを作る場合です。要件にもよるので詳しくはお問い合わせに',
      },
      {
        question: 'プロトタイプ開発後、本開発にスムーズに移行できますか？',
        answer:
          'はい。プロトタイプ開発時から本開発を見据えた技術選定を行い、スムーズな移行をサポートします。求められるビジネス要件・保守性を考えて技術選定をいたします',
      },
      {
        question: 'ユーザーテストはどのように行われますか？',
        answer:
          '対象となるユーザー層を選定し、実際の利用シーンを想定したタスクベースのテストを実施します。必要に応じてアンケートやインタビューも組み合わせます。',
      },
    ],
  },
  {
    id: 'global-service',
    title: '海外向けサービス・サイト作成',
    description: '海外向けのWebサイト・サービスのグロースハックを支援します。',
    longDescription:
      'グローバル展開を目指す企業様向けに、海外市場での成功を支援するための包括的なサービスを提供します。現地のユーザー習慣や文化的な違いを考慮した、効果的なデジタルプレゼンスの構築をサポートします。',
    painPoints: [
      {
        title: '言語・文化の壁',
        description: '各国の言語や文化的な違いに対応したコンテンツ作成に苦労している',
      },
      {
        title: '現地法規制対応',
        description: '各国の法令やコンプライアンス要件への対応が複雑',
      },
      {
        title: '決済・物流の課題',
        description: '国際決済や越境物流の仕組み構築に課題がある',
      },
      {
        title: 'マーケティング戦略',
        description: '現地市場でのプロモーション方法や集客戦略が不明確',
      },
    ],
    solutions: [
      {
        title: 'ローカライゼーション支援',
        description: '言語対応だけでなく、文化的な文脈を考慮したコンテンツ最適化を実施',
        results: ['現地ユーザーの理解度向上', 'ブランド親和性の向上', 'コンバージョン率の改善'],
      },
      {
        title: 'グローバルインフラ構築',
        description: '多言語・多通貨対応の システム基盤を構築します',
        results: ['システム統合の効率化', '運用コストの最適化', '拡張性の確保'],
      },
    ],
    caseStudies: [
      {
        title: 'アパレルEC の東南アジア展開',
        challenge: '現地の決済習慣や配送事情への対応',
        solution: '現地決済サービスとの連携と物流網の最適化',
        results: ['月間売上200%増', '配送時間30%短縮', '顧客満足度向上'],
      },
      {
        title: 'SaaSサービスのグローバル展開',
        challenge: '言語対応とサポート体制の構築',
        solution: '24時間体制のマルチリンガルサポート構築',
        results: ['海外売上比率40%達成', 'サポート応答時間60%改善', '解約率低減'],
      },
    ],
    features: [
      {
        title: '多言語対応Webサイト開発',
        description: '各国の言語や文化に適応したローカライゼーションを実施します。',
      },
      {
        title: '越境ECサポート',
        description: '国際決済や物流など、越境ECに必要な機能を実装します。',
      },
      {
        title: 'グローバルカスタマーサポート',
        description: '24時間体制の多言語カスタマーサポート体制を構築します。',
      },
    ],
    benefits: [
      '現地市場に最適化されたUX設計',
      '多言語・多通貨対応',
      '国際SEO対策',
      'グローバル展開のリスク低減',
    ],
    faq: [
      {
        question: '対応可能な言語は何がありますか？',
        answer:
          '英語、中国語、韓国語を中心に、東南アジア言語まで幅広く対応可能です。必要に応じて他言語にも対応いたします。',
      },
      {
        question: '海外向けマーケティングの効果測定はどうしていますか？',
        answer:
          'Google AnalyticsやSNS分析ツールを使用し、地域別のユーザー行動や集客効果を測定。月次でレポーティングを行います。',
      },
      {
        question: '越境ECの導入期間はどのくらいですか？',
        answer:
          '基本的な機能であれば3-4ヶ月、フル機能の場合は6-8ヶ月程度です。段階的なローンチも可能です。',
      },
    ],
  },
  {
    id: 'ai-development',
    title: '生成AI受託サービス',
    description: '生成AIを活用したプロダクト開発や、既存サービスへのAI機能の導入を支援します。',
    longDescription:
      'ChatGPTやStable Diffusionなどの生成AIを活用したサービス開発を支援します。ビジネスの課題に合わせて、最適なAIモデルの選定から、カスタマイズ、システム統合まで、包括的なサポートを提供します。',
    painPoints: [
      {
        title: '技術選定の難しさ',
        description: '急速に進化する生成AI技術の中から、最適なモデルやアーキテクチャの選定が困難',
      },
      {
        title: 'コスト管理',
        description: 'APIコストの予測が難しく、ビジネスモデルの構築に苦慮している',
      },
      {
        title: '精度・品質の担保',
        description: '生成結果の品質にばらつきがあり、ビジネス利用に耐える安定性の確保が課題',
      },
      {
        title: 'プロンプトエンジニアリング',
        description: '効果的なプロンプト設計とチューニングのノウハウが不足',
      },
    ],
    solutions: [
      {
        title: '最適モデル選定・検証',
        description: '用途に応じた生成AIモデルの選定と検証を実施',
        results: ['コスト効率の最適化', '処理速度の向上', '出力品質の改善'],
      },
      {
        title: 'プロンプト最適化',
        description: '業務特性を考慮した効果的なプロンプト設計とチューニング',
        results: ['生成精度の向上', '一貫性の確保', '運用効率の改善'],
      },
      {
        title: 'システム統合支援',
        description: '既存システムへのAI機能の統合と運用体制の構築',
        results: ['スムーズな導入', '安定した運用', '継続的な改善'],
      },
    ],
    caseStudies: [
      {
        title: 'AI文書作成支援システムの開発',
        challenge: '法務文書作成の効率化と品質向上',
        solution: 'GPTを活用した文書生成・チェックシステムの構築',
        results: ['作成時間70%削減', 'チェック漏れ90%削減', 'ユーザー満足度95%'],
      },
      {
        title: '画像生成AIの業務活用',
        challenge: '商品画像作成の効率化とコスト削減',
        solution: 'Stable Diffusionのファインチューニングと管理システム構築',
        results: ['制作コスト60%削減', '作成時間80%短縮', 'クオリティ一貫性の確保'],
      },
    ],
    features: [
      {
        title: 'AI導入コンサルティング',
        description: '業務分析に基づく最適なAI活用方法の提案と導入支援。',
      },
      {
        title: 'カスタムAI開発',
        description: '業務特性に合わせたAIモデルのカスタマイズと統合開発。',
      },
      {
        title: 'プロンプトエンジニアリング',
        description: '効果的なプロンプト設計とチューニングの実施。',
      },
      {
        title: '運用保守サポート',
        description: '継続的な精度改善と安定運用のサポート。',
      },
    ],
    benefits: [
      '最新AI技術の効果的な活用',
      'コスト効率の最適化',
      '高品質な生成結果の確保',
      'スムーズな業務統合',
    ],
    faq: [
      {
        question: 'どのような生成AIに対応していますか？',
        answer:
          'OpenAI GPT、Anthropic Claude、Stable Diffusion、Midjourney等、主要な生成AIモデルに対応しています。用途に応じて最適なモデルを選定・提案させていただきます。',
      },
      {
        question: 'APIコストはどのように最適化されますか？',
        answer:
          'キャッシュ戦略の導入や効率的なプロンプト設計により、APIコストを最小限に抑えます。また、使用量の予測とモニタリングにより、コストの透明性を確保します。',
      },
      {
        question: '生成結果の品質はどのように担保されますか？',
        answer:
          '入念なプロンプト設計とバリデーション処理の実装により、高品質な生成結果を確保します。また、人間によるレビューと組み合わせたハイブリッドな運用体制も構築可能です。',
      },
    ],
  },
  {
    id: 'no-code-development',
    title: 'ノーコードでのPOC開発',
    description: 'ノーコードツールを活用した迅速なプロトタイプ開発とビジネス検証を支援します。',
    longDescription:
      'Bubble、Webflow、Airtableなどのノーコードツールを活用し、最小限のコストと時間で機能するプロトタイプを開発。アイデアの検証からMVP開発まで、スピーディーな開発を実現します。',
    painPoints: [
      {
        title: '開発スピードの課題',
        description: '従来の開発手法では検証のスピードが遅く、市場機会を逃す可能性がある',
      },
      {
        title: '予算の制約',
        description: '初期段階での大規模な開発投資が難しい',
      },
      {
        title: '技術リソースの不足',
        description: '社内にエンジニアリソースがなく、アイデアの具現化が困難',
      },
      {
        title: '要件の不確実性',
        description: '市場ニーズや要件が不明確な段階での開発リスク',
      },
    ],
    solutions: [
      {
        title: 'ノーコード高速開発',
        description: '最適なノーコードツールを組み合わせた迅速な開発',
        results: ['開発期間の大幅短縮', 'コストの削減', '柔軟な改修対応'],
      },
      {
        title: '段階的な検証・改善',
        description: 'ユーザーフィードバックに基づく迅速な改善サイクル',
        results: ['市場フィードバックの早期獲得', '製品価値の向上', '開発リスクの低減'],
      },
    ],
    caseStudies: [
      {
        title: '業務システムの管理画面開発',
        challenge: '短期間での構築と検証',
        solution: 'Bubbleを活用したシステムの構築',
        results: ['４週間でのシステム構築', '初期費用80%削減', '検証の早期実現'],
      },
      {
        title: '社内業務効率化ツールの開発',
        challenge: '部門間の業務フロー改善と効率化',
        solution: 'Airtableとプロセス自動化ツールの連携',
        results: ['業務工数50%削減', 'データ入力ミス90%減', '部門間連携の強化'],
      },
    ],
    features: [
      {
        title: 'ツール選定・設計',
        description: '要件に最適なノーコードツールの選定と全体設計。',
      },
      {
        title: '高速プロトタイピング',
        description: '数週間単位での機能するプロトタイプの開発。',
      },
      {
        title: 'データ連携・自動化',
        description: '複数ツールの連携によるワークフロー自動化。',
      },
      {
        title: '改善サポート',
        description: 'ユーザーフィードバックに基づく迅速な改善実施。',
      },
    ],
    benefits: [
      '開発期間とコストの大幅削減',
      'アイデアの早期検証が可能',
      '柔軟な改修・拡張性',
      'エンジニアリソース不要',
    ],
    faq: [
      {
        question: 'どのようなノーコードツールを使用しますか？',
        answer:
          'Bubble、Webflow、Airtable、Zapier等、実績のある主要ツールを用途に応じて使用します。要件に応じて最適なツールを選定・提案させていただきます。',
      },
      {
        question: '本開発への移行は可能ですか？',
        answer:
          'はい、POCの結果を基に、必要に応じて従来の開発手法への移行も可能です。スケーラビリティやパフォーマンスの要件を考慮し、最適な移行計画を立案します。',
      },
      {
        question: '開発期間はどのくらいですか？',
        answer:
          '基本的な機能であれば1ヶ月、より複雑な機能でも2-3ヶ月程度で開発可能です。要件の複雑さにより変動しますので、詳細はご相談ください。',
      },
    ],
  },
];
