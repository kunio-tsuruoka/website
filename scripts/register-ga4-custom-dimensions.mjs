// GA4 イベントスコープ カスタムディメンションを登録する
// 使い方: node scripts/register-ga4-custom-dimensions.mjs
// 認証: SA キー (~/.gcp-keys/ga4-mcp-beekle.json) + analytics.edit スコープ
// 注意: 登録は前方適用のみ。過去データには遡及しない。
import { homedir } from 'node:os';
import { join } from 'node:path';
import { GoogleAuth } from 'google-auth-library';

const PROPERTY_ID = '355503040';
const KEY_FILE = join(homedir(), '.gcp-keys', 'ga4-mcp-beekle.json');
const BASE = `https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}/customDimensions`;

// 現サイトが送るイベントパラメータ (src/lib/analytics.ts, 各フォーム参照)
const DIMENSIONS = [
  {
    parameterName: 'source',
    displayName: 'CTA Source',
    description: 'CTA/フォームの流入元 (data-cta-source, ?source=, ?ref=)',
  },
  {
    parameterName: 'cta',
    displayName: 'CTA ID',
    description: '押されたCTAの識別子 (data-cta-id: contact / download-zero-start 等)',
  },
  {
    parameterName: 'phase',
    displayName: 'Consideration Phase',
    description: '資料DLフォームの検討段階 (info_gathering/considering/comparing/rfp_planned)',
  },
  {
    parameterName: 'tool',
    displayName: 'Tool Name',
    description: 'ツールイベントの対象 (flow-mapper/story-builder/scope-manager)',
  },
];

async function main() {
  const auth = new GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/analytics.edit'],
  });
  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 既存を取得して重複登録を防ぐ
  const listRes = await fetch(`${BASE}?pageSize=200`, { headers });
  const listJson = await listRes.json();
  if (!listRes.ok) {
    throw new Error(`list failed ${listRes.status}: ${JSON.stringify(listJson)}`);
  }
  const existing = new Set((listJson.customDimensions ?? []).map((d) => d.parameterName));

  for (const d of DIMENSIONS) {
    if (existing.has(d.parameterName)) {
      console.log(`SKIP  ${d.parameterName} (already registered)`);
      continue;
    }
    const res = await fetch(BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parameterName: d.parameterName,
        displayName: d.displayName,
        description: d.description,
        scope: 'EVENT',
      }),
    });
    const json = await res.json();
    if (res.ok) {
      console.log(`OK    ${d.parameterName} -> ${json.name} ("${d.displayName}")`);
    } else {
      console.log(
        `FAIL  ${d.parameterName} ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
