import type { FlowDiagram, SolutionTemplate, Suggestion, SuggestionKind } from '../types';

// ソリューションテンプレート: 各 SuggestionKind に対する代表的解決策と削減率の目安。
// ユーザーが「どんなシステムで・どれだけ削減できるか」を書けない問題を解決する。
// 削減率は経験則ベース（業界平均）。実プロジェクトでは要件次第で変動するが議論の起点に有効。
export const SOLUTIONS: Record<SuggestionKind, SolutionTemplate[]> = {
  automation: [
    {
      name: 'API連携',
      description: 'API連携で手作業の転記を撤廃。受発注・在庫・請求などの定型データを自動同期',
      examples: 'Zapier / Make / 自社API / Webhook / iPaaS',
      reductionPct: 90,
      reductionRange: '80〜100%',
    },
    {
      name: 'RPA',
      description: 'RPAツールで画面操作を自動化。既存システムを変えずに定型作業を実行',
      examples: 'UiPath / Power Automate / WinActor',
      reductionPct: 80,
      reductionRange: '70〜95%',
    },
    {
      name: 'OCR＋構造化',
      description: 'OCRで紙・画像を読み取り、AIで構造化データに変換',
      examples: 'AI inside / Microsoft Form Recognizer / Google Document AI',
      reductionPct: 75,
      reductionRange: '60〜90%',
    },
    {
      name: 'Webフォーム化',
      description: '紙・FAX・電話による受付をWebフォーム＋入力規則に置換',
      examples: 'HubSpot / Typeform / Google Forms / 自社フォーム',
      reductionPct: 85,
      reductionRange: '70〜100%',
    },
  ],
  ai: [
    {
      name: 'LLMによる自動判定',
      description: 'GPT/Claude等のLLMで自然言語判定を自動化。判断基準が言語化できる場合に有効',
      examples: 'GPT-4 / Claude / Gemini / 社内RAG',
      reductionPct: 85,
      reductionRange: '70〜95%',
    },
    {
      name: '機械学習分類モデル',
      description: '過去データで学習した分類モデルで判定。判断パターンが安定している場合に有効',
      examples: 'BigQuery ML / Vertex AutoML / scikit-learn',
      reductionPct: 90,
      reductionRange: '80〜99%',
    },
    {
      name: 'ルールエンジン',
      description: 'if-thenルールで条件分岐を自動化（AIなしでも判定が決定的なら最有力）',
      examples: 'Drools / 自社実装 / スプレッドシート連携',
      reductionPct: 95,
      reductionRange: '90〜100%',
    },
  ],
  parallel: [
    {
      name: '並行処理化',
      description: '直列で進めていた工程を並列化。複数担当・複数システムが同時進行',
      examples: 'ワークフローツール / 並行ジョブ / プロジェクト管理ツール',
      reductionPct: 50,
      reductionRange: '30〜70%',
    },
    {
      name: '事前承認ルール',
      description: '金額閾値や取引先信頼度で承認を不要化、自動承認',
      examples: '権限委譲 / 自動承認ルール',
      reductionPct: 80,
      reductionRange: '60〜100%',
    },
    {
      name: '通知の自動化',
      description: '待ち時間中の進捗通知を自動化し、確認の往復を削減',
      examples: 'Slack/Teams連携 / メール自動送信',
      reductionPct: 60,
      reductionRange: '40〜80%',
    },
  ],
  priority: [],
  tool: [],
};

// As-Is を分析し、To-Be で検討すべき改善候補を提案する。
// ルールベース（手作業ツール・待ち・pain・判断ステップ・ツール未設定）。
export function suggestImprovements(d: FlowDiagram): Suggestion[] {
  const out: Suggestion[] = [];
  const manualToolPattern = /excel|エクセル|電話|fax|ファクス|紙|手作業|手動|手書き|転記|印刷/i;
  const aiDecisionPattern = /確認|判断|チェック|審査|可否|判定|分類|分別|仕分け|レビュー/;

  for (const s of d.steps) {
    // 1) 手作業 × 高所要時間 → 自動化候補
    if (
      s.durationMin >= 10 &&
      (manualToolPattern.test(s.tool) || manualToolPattern.test(s.label))
    ) {
      out.push({
        stepId: s.id,
        kind: 'automation',
        title: `「${s.label}」(${s.durationMin}分) は自動化候補`,
        message: `${s.tool ? `${s.tool}による` : ''}手作業を、API連携／RPA／OCR で削減できる可能性。To-Be ではシステム化を検討。`,
      });
    }
    // 2) 判断ステップは原則すべて AI／ルールエンジン候補
    if (s.type === 'decision') {
      const matchedKeyword = aiDecisionPattern.test(s.label);
      out.push({
        stepId: s.id,
        kind: 'ai',
        title: `「${s.label}」は AI 自動判定候補`,
        message: matchedKeyword
          ? 'ルールが言語化できればLLM／分類モデルで自動化できる。判断基準が安定している場合に向く。'
          : '判断ステップは AI／ルールエンジンで省力化候補。判断基準が言語化できれば自動化できる。',
      });
    }
    // 3) 待ち時間
    if (s.type === 'wait' && s.durationMin > 0) {
      out.push({
        stepId: s.id,
        kind: 'parallel',
        title: `「${s.label}」は待ち時間（${s.durationMin}分）`,
        message: '並行処理化、事前承認ルール、通知の自動化などで削減候補。',
      });
    }
    // 4) pain 記入あり
    if (s.pain && s.pain.trim().length > 0) {
      out.push({
        stepId: s.id,
        kind: 'priority',
        title: `「${s.label}」は課題が明示されている`,
        message: `課題: ${s.pain.slice(0, 60)}${s.pain.length > 60 ? '…' : ''}。To-Be で最優先で潰す対象。`,
      });
    }
    // 5) ツール未設定 + タスク → ツール導入検討
    if (s.type === 'task' && !s.tool.trim() && s.durationMin >= 5) {
      out.push({
        stepId: s.id,
        kind: 'tool',
        title: `「${s.label}」はツール未設定`,
        message:
          '何を使って実施しているか明示。明確化することで重複作業や属人化が見える化され、改善対象が決まる。',
      });
    }
  }
  return out;
}
