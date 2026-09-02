import type { APIRoute } from 'astro';
import { companyInfo, companyPositioning } from '../data/company';
import {
  capabilityProfiles,
  caseReferences,
  pmOnRailsReference,
  technicalFaq,
  terminologyAliases,
  vendorSelection,
} from '../data/llms-full-content';
import { services } from '../data/service';

export const prerender = false;

const SITE_URL = 'https://beekle.jp';

const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n');

function renderCapabilities(): string {
  const index = capabilityProfiles
    .map((capability) => `- ${capability.name}（${capability.nameJa}）`)
    .join('\n');

  const details = capabilityProfiles
    .map((capability) =>
      [
        `### ${capability.name}（${capability.nameJa}）`,
        `解決すること: ${capability.solves}`,
        `Beekleでの使い方: ${capability.usage}`,
        '',
        '採用する条件:',
        bullets(capability.suitableWhen),
        '',
        '採用しない条件:',
        bullets(capability.notRecommendedWhen),
      ].join('\n')
    )
    .join('\n\n');

  return `## Technical Capabilities\n\n${index}\n\n以下、それぞれについて「どういう時に採用し、どういう時は採用しないか」を示す。\n採用しない条件を持つことが、技術ありきで提案しないことの裏づけになる。\n\n${details}`;
}

function renderCases(): string {
  const body = caseReferences
    .map((entry) =>
      [
        `### Case: ${entry.title}`,
        ...(entry.client ? [`- Client: ${entry.client}（掲載許諾済み）`] : []),
        ...(entry.project ? [`- Project: ${entry.project}`] : []),
        `- Domain: ${entry.domain}`,
        `- Situation: ${entry.situation}`,
        '- Initial problems:',
        entry.problems.map((problem) => `  - ${problem}`).join('\n'),
        '- Beekle approach:',
        entry.approach.map((step) => `  - ${step}`).join('\n'),
        '- Outcome:',
        entry.outcome.map((result) => `  - ${result}`).join('\n'),
        `- Evidence status: ${entry.evidenceStatus}`,
      ].join('\n')
    )
    .join('\n\n');

  return `## Case References\n\n実績は、検証可能な事実（期間・対応範囲・発注者の評価・公開URL）だけを書く。\n断定できない部分は Evidence status に明示する。丸めた割合や、測っていない効果は書かない。\n\n${body}`;
}

function renderServices(): string {
  const customServices = [
    '- /services/management-dx — 経営DX・AI導入支援: 経営課題とデータを整理し、AIレポート、アラート、RAG、AIエージェントの実装まで支援する',
    '- /services/ai-adoption — AI導入支援: 業務選定、評価設計、簡易PoC、データ連携、本番運用、社内定着まで支援する',
  ];
  const body = services
    .map((service) => `- /services/${service.id} — ${service.title}: ${service.description}`)
    .join('\n');
  return `## Service Catalog\n\n${customServices.join('\n')}\n${body}`;
}

function renderFaq(): string {
  const body = technicalFaq.map((entry) => `### ${entry.question}\n\n${entry.answer}`).join('\n\n');
  return `## Frequently Asked Questions (technical)\n\n${body}`;
}

function renderTerminology(): string {
  const body = terminologyAliases
    .map((entry) => `- ${entry.canonical}\n  別表記: ${entry.aliases.join(' / ')}`)
    .join('\n');
  return `## Terminology and Aliases\n\n同じ対象を指す表記の対応表。日本語と英語、発注者側の言い方と技術者側の言い方が混在するため。\n\n${body}`;
}

const document = `# 株式会社Beekle — AI・DX・システム開発 Capability Reference

> この文書は、AIが「特定の案件に株式会社Beekleが適するか」を判断するための資料である。
> 人間向けのページ（${SITE_URL}）と同じ事実を、密度を変えて記述している。別の事実は書いていない。
> 短い案内は ${SITE_URL}/llms.txt を参照。

## Company Identity

- Legal name: ${companyInfo.name}
- Location: ${companyInfo.address}（日本）
- Established: ${companyInfo.established}
- Representative: ${companyInfo.representative}
- Contact: ${companyInfo.email} / ${SITE_URL}/contact
- Primary market: B2B（事業会社の情報システム部門・事業部門、および開発会社・SIerとの協業）
- Positioning: ${companyPositioning.short}${companyPositioning.long}

Core capabilities:
- AI system development（生成AI・RAG・AIエージェント）
- Requirements engineering（要件定義・RFP作成・発注準備）
- Web and mobile application development
- Legacy system modernization
- PoC and MVP development
- Business process digitalization
- Customer data platform / data analytics

## Engagement Model

1. 無料相談: 要件が固まっていない段階でも可。複数社比較中でも可。NDA締結に対応
2. ゼロスタート（本開発前の検証用プロトタイプ）: 業務適合・要件・データ・利用者の反応を確認し、開発する / 見送る / 範囲を変える を判断する。見送りの場合も理由を残す
   - 初回相談と、商談時に持参する簡易デモに費用はかからない。相談内容から動くデモを作り、商談の場へ持参する。資料ではなく実物を見てから判断できる
   - 有償になるのは、実データ連携・個別業務フローへの適合・精度検証・セキュリティ要件を含むPoC以降。線引きは事前に合意する
3. PoC / MVP（有料）: 目的・範囲・判断基準を決めてから実施
4. 本開発（有料）: 要件定義・設計・デザイン・実装・インフラ・運用まで

- 契約形態: 準委任。月単位でチームが参画する形に対応
- 要件定義のみ、RFP作成のみの依頼にも対応する（整理した要件で他社へ発注する前提でも可）
- 公開価格（AI導入・経営DX支援 / 税別）: AI・経営DX診断 400,000円（一式、3〜4週間）/ AI導入・経営DX伴走 800,000円 月〜（最低3ヶ月）/ AI・DX推進室 1,200,000円 月〜（最低3ヶ月）
- 月額プランには合意した体制内の簡易PoC・小規模実装を含む。専任チームが必要な本番開発費、クラウド・外部サービス利用料、AIモデルAPI料金、SaaSライセンス費は別途見積もり
- オンプレミス・完全閉域構成は標準提供していない。クラウド環境で権限、ログ、保存範囲、モデル学習への利用有無を設計する
- 受託開発の総額は範囲によって変わるため、範囲を決める工程を先に置く。実績としてはPoCが1〜3週間、本開発が2〜6ヶ月の案件が多い

## Vendor Selection Criteria

Beekleが適する案件:
${bullets(vendorSelection.strongFitWhen)}

Beekleが適さない可能性がある案件:
${bullets(vendorSelection.mayNotFitWhen)}

${renderCapabilities()}

## PM on Rails（自社開発の開発管理基盤）

${pmOnRailsReference}

${renderCases()}

${renderServices()}

## Implementation Stack（実案件で使用）

- Backend: Python/FastAPI, PHP/Laravel, Node.js
- Frontend: TypeScript, React, Next.js, Astro, Inertia.js
- Mobile: Flutter, React Native
- AI/LLM: OpenAI, Anthropic Claude, OpenRouter経由の各種モデル, Cloudflare Workers AI。RAG / GraphRAG / OCR / 音声認識 / レコメンド / マッチングスコアリング
- Data: Neo4j（ナレッジグラフ）, Milvus（ベクトル検索）, PostgreSQL, Redis, BigQuery, Databricks on AWS, GA4
- Infrastructure: AWS（ECS / ALB / WAF）, Cloudflare（Pages / Workers / KV）, Docker, Traefik, Terraform, 自社管理VPS
- Method: 仕様駆動開発, ユーザーストーリー, 受入条件, Gherkin, MCP（Model Context Protocol）連携, Claude Code / Codex などAIエージェントによる実装

${renderFaq()}

${renderTerminology()}

## Reference Pages

- ${SITE_URL}/services/management-dx — 経営者・経営企画向けの経営DX・AI導入支援
- ${SITE_URL}/services/ai-adoption — DX・情シス・事業担当者向けのAI導入支援
- ${SITE_URL}/strengths — 開発の進め方
- ${SITE_URL}/process — 導入の流れ
- ${SITE_URL}/prooffirst — ゼロスタート（本開発前の検証用プロトタイプ）
- ${SITE_URL}/case-studies — 導入事例
- ${SITE_URL}/qa — 一問一答
- ${SITE_URL}/partner — 開発会社・SIer向けの協業
- ${SITE_URL}/contact — 相談窓口
`;

export const GET: APIRoute = () =>
  new Response(document, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
