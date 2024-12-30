interface ArticleCategory {
    id: string;
    title: string;
    articles: {
      number: string;
      title: string;
      slug: string;
    }[];
  }
  
  export const articleCategories: ArticleCategory[] = [
    {
      id: "development-basics",
      title: "システム開発の基本",
      articles: [
        {
          number: "01",
          title: "システム開発プロセスの概要",
          slug: "development-process"
        },
        {
          number: "02",
          title: "要件定義の重要性と進め方",
          slug: "requirement-definition"
        },
        {
          number: "03",
          title: "アジャイル開発とウォーターフォール開発",
          slug: "agile-vs-waterfall"
        },
        {
          number: "04",
          title: "プロジェクトマネジメントの基礎",
          slug: "project-management"
        },
        {
          number: "05",
          title: "開発環境の構築とツール選定",
          slug: "development-environment"
        },
        {
          number: "06",
          title: "チーム開発の進め方",
          slug: "team-development"
        },
        {
          number: "07",
          title: "品質管理と保守の基礎知識",
          slug: "quality-maintenance"
        }
      ]
    },
    {
      id: "tech-selection",
      title: "技術選定とアーキテクチャ",
      articles: [
        {
          number: "01",
          title: "フロントエンド技術の選び方",
          slug: "frontend-tech"
        },
        {
          number: "02",
          title: "バックエンド技術の選定基準",
          slug: "backend-tech"
        },
        {
          number: "03",
          title: "データベース設計のポイント",
          slug: "database-design"
        },
        {
          number: "04",
          title: "クラウドサービスの活用方法",
          slug: "cloud-services"
        }
      ]
    },
    {
      id: "modern-development",
      title: "モダン開発手法",
      articles: [
        {
          number: "01",
          title: "マイクロサービスの実践",
          slug: "microservices"
        },
        {
          number: "02",
          title: "コンテナ化とDockerの活用",
          slug: "containerization"
        },
        {
          number: "03",
          title: "CI/CDパイプラインの構築",
          slug: "cicd"
        },
        {
          number: "04",
          title: "DevOpsの導入と実践",
          slug: "devops"
        }
      ]
    },
    {
      id: "security",
      title: "セキュリティと運用",
      articles: [
        {
          number: "01",
          title: "セキュリティ設計の基礎",
          slug: "security-basics"
        },
        {
          number: "02",
          title: "認証・認可の実装ガイド",
          slug: "auth-implementation"
        },
        {
          number: "03",
          title: "インフラ監視の実践",
          slug: "infrastructure-monitoring"
        },
        {
          number: "04",
          title: "障害対応とリカバリー",
          slug: "incident-response"
        }
      ]
    }
  ];
  
  export type { ArticleCategory };