import { readFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const envText = readFileSync('.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const TARGETS = [
  {
    id: 'requirements-definition-template',
    title:
      '要件定義書のテンプレート・サンプル｜EARS記法とユーザーストーリーの実例＋Word/Markdown無料DL',
    description:
      'システム開発の要件定義書を、初めてでも書けるテンプレート＋サンプル実例集にまとめました。EARS記法の5パターン、ユーザーストーリーの書き方、両者の併用例まで実例付きで解説。Word/Markdown形式の要件定義書テンプレートを無料ダウンロードできます。',
  },
  {
    id: 'ai-era-development-flow',
    title: 'AI受託開発・生成AI開発の流れと進め方｜PoCからプロトタイプ・本番化までの全工程',
    description:
      'AI受託開発・生成AI開発の流れを、PoC→プロトタイプ→本番化の3フェーズで解説。発注前に押さえるべき検証ポイント、ユーザー視点での要件定義、失敗を防ぐ進め方を実務に即して紹介します。AI開発を委託・依頼する側の意思決定に役立つ情報をまとめました。',
  },
  {
    id: 'cdp-product-comparison',
    title: 'CDP比較・選び方ガイド｜Treasure Data・Salesforce CDP・自社開発の3パターンを徹底比較',
    description:
      'CDPツールの代表例 Treasure Data・Salesforce CDP・自社開発（BigQuery等のデータ基盤）の3パターンを、機能・コスト・運用負荷・拡張性で徹底比較。CDPベンダー選定の判断軸を、情シス・マーケ部門向けに業界別（製造業・アパレル・金融）の使い分けまで踏み込んで解説します。',
  },
];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

for (const t of TARGETS) {
  const before = await client.get({ endpoint: 'columns', contentId: t.id });
  console.log('===', t.id, '===');
  console.log('OLD title:      ', before.title);
  console.log('NEW title:      ', t.title, `(${t.title.length}文字)`);
  console.log('OLD description:', before.description);
  console.log('NEW description:', t.description);
  console.log();

  if (!APPLY) continue;

  await client.update({
    endpoint: 'columns',
    contentId: t.id,
    content: { title: t.title, description: t.description },
  });

  const after = await client.get({ endpoint: 'columns', contentId: t.id });
  console.log('PATCH done. after.title:', after.title);
  console.log();
}

if (!APPLY) console.log('[dry-run] Pass --apply to PATCH MicroCMS.');
