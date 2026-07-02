/**
 * 全コラムを「AIっぽさ」指標でスキャンする（読み取り専用・監査）。
 * 参照: .claude/rules/content.md（note.com yusuke_motoyama 由来）
 *
 *   node --env-file=.env scripts/scan-ai-tells.mjs
 */
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// 純比喩に限定（設計書/仕様書/検索エンジン等の正当語は除外）
const CLICHE = /羅針盤|車の両輪|両輪|潤滑油|スパイス|レシピ|筋トレ|DNA|血肉|屋台骨/g;

const count = (s, re) => (s.match(re) || []).length;

const all = [];
let offset = 0;
while (true) {
  const r = await client.get({
    endpoint: 'columns',
    contentId: undefined,
    queries: { fields: 'id,content,description', limit: 100, offset },
  });
  all.push(...r.contents);
  if (all.length >= r.totalCount) break;
  offset += 100;
}

const rows = all.map((c) => {
  // description も含める（meta/og/twitter/JSON-LD に展開されるため見逃すと本番に露出）
  const s = `${c.content || ''}\n${c.description || ''}`;
  const emdash = count(s, /——/g);
  const dq = count(s, /“[^”]*”/g);
  const slash = count(s, /[^\s>]／[^\s<]/g); // 全角スラッシュ概念並列
  const cliche = count(s, CLICHE);
  return { id: c.id, emdash, dq, slash, cliche, primary: emdash + dq };
});

const flagged = rows.filter((r) => r.primary > 0 || r.slash > 0 || r.cliche > 0);
flagged.sort((a, b) => b.primary - a.primary || b.slash + b.cliche - (a.slash + a.cliche));

console.log(`全 ${all.length} 記事中、該当 ${flagged.length} 記事\n`);
console.log('emdash  dq   ／   比喩  slug');
console.log('-----------------------------------------');
for (const r of flagged) {
  const mark = r.primary >= 4 ? ' ★' : '';
  console.log(
    `${String(r.emdash).padStart(4)}  ${String(r.dq).padStart(3)}  ${String(r.slash).padStart(3)}  ${String(r.cliche).padStart(3)}   ${r.id}${mark}`
  );
}

const tot = rows.reduce(
  (a, r) => ({
    emdash: a.emdash + r.emdash,
    dq: a.dq + r.dq,
    slash: a.slash + r.slash,
    cliche: a.cliche + r.cliche,
  }),
  { emdash: 0, dq: 0, slash: 0, cliche: 0 }
);
console.log(
  `\n合計: em dash ${tot.emdash} / 二重引用符 ${tot.dq} / 全角／ ${tot.slash} / 比喩 ${tot.cliche}`
);
console.log('★ = 主指標(em dash+二重引用符)4件以上の優先是正候補');
