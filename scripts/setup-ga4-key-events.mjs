// GA4 のキーイベント (旧コンバージョン) を Admin API で作成する。
// 既に存在するイベントは PATCH で countingMethod を ONCE_PER_EVENT に揃える。
//
// 使い方: node scripts/setup-ga4-key-events.mjs
// 必要: ~/.gcp-keys/ga4-mcp-beekle.json (analytics.edit scope を持つ SA)
// 詳細: .claude/rules/gcp-workspace.md

import { homedir } from 'node:os';
import { join } from 'node:path';
import { GoogleAuth } from 'google-auth-library';

const PROPERTY_ID = '355503040';
const KEY_FILE = join(homedir(), '.gcp-keys', 'ga4-mcp-beekle.json');
const TARGET_EVENTS = ['form_submit', 'generate_lead', 'contact_complete'];

const auth = new GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/analytics.edit'],
});

const client = await auth.getClient();
const tokenRes = await client.getAccessToken();
const token = tokenRes.token;
if (!token) throw new Error('access token を取得できませんでした');

const base = `https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}/keyEvents`;

const listRes = await fetch(base, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!listRes.ok) {
  const body = await listRes.text();
  throw new Error(`keyEvents list 失敗 ${listRes.status}: ${body}`);
}
const listJson = await listRes.json();
const existing = new Map((listJson.keyEvents || []).map((ke) => [ke.eventName, ke]));

console.log(`既存キーイベント: ${[...existing.keys()].join(', ') || '(なし)'}`);

for (const eventName of TARGET_EVENTS) {
  const found = existing.get(eventName);
  if (found) {
    console.log(`- ${eventName}: 既に存在 (${found.name}) — スキップ`);
    continue;
  }

  const createRes = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName,
      countingMethod: 'ONCE_PER_EVENT',
    }),
  });

  if (!createRes.ok) {
    const body = await createRes.text();
    console.error(`- ${eventName}: 作成失敗 ${createRes.status}: ${body}`);
    continue;
  }
  const created = await createRes.json();
  console.log(`- ${eventName}: 作成OK (${created.name})`);
}

console.log('\n完了。GA4 管理画面 > イベント > キーイベント で確認できます。');
