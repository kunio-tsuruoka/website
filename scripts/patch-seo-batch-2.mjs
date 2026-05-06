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
    id: 'web-system-cost-by-scale',
    title: 'Webシステム/Webサービス開発の費用相場：小規模300万〜大規模4,000万超のレンジ別解説',
    description:
      'Webシステム・Webサービス開発の費用相場を小規模(300〜800万)・中規模(1,000〜3,000万)・大規模(4,000万超)の3レンジで解説。規模ごとの工数・体制・落とし穴を実例で示し、自社プロジェクトのレンジ判定軸も提示します。',
  },
  {
    id: 'ears-requirements-syntax-guide',
    title: 'EARS記法とは？要件定義の曖昧さを排除する5パターンと書き方の実例',
    description:
      'EARS記法（EARS形式とも呼ばれる、Easy Approach to Requirements Syntax）の5パターンを実例で解説。要件定義の曖昧さを排除し、検証可能な受入条件・非機能要件の書き方を、ユーザーストーリーとの組み合わせ方も含めて紹介します。',
  },
];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

for (const t of TARGETS) {
  const before = await client.get({ endpoint: 'columns', contentId: t.id });
  console.log('===', t.id, '===');
  console.log('OLD title:      ', before.title);
  console.log('NEW title:      ', t.title);
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
  console.log('PATCH done.');
  console.log('after.title:      ', after.title);
  console.log('after.description:', after.description);
  console.log();
}

if (!APPLY) console.log('[dry-run] Pass --apply to PATCH MicroCMS.');
