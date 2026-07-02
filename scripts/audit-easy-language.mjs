// neta.txt 観点（やさしい言葉）でコラム全件を監査する
// 検出軸:
//  A) 専門用語の素出し（カタカナ略語 / 業界用語が「ノー解説」で本文に出る）
//  B) 二重否定 / 婉曲（「珍しくない」「少なくない」「〜ないことはない」等）
//  C) 強調定型句（「に他なりません」「と言っても過言ではありません」「実はXなのです」等のAI tells）
//  D) 漢語重さ（「〜を実施する」「〜することにより」「〜を踏まえ」「〜化」連発 等）
//
// 出力: claudedocs/easy-language-audit-YYYY-MM-DD.md
//   - サマリ（カテゴリ別、軸別）
//   - ヒット密度ランキング（重い順 = 直し甲斐がある順）
//   - 各記事のサンプルヒット（軸ごとに最大3例）

import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

function stripHtml(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============ A) 専門用語 / カタカナ略語の素出し ============
// 略語自体は記事の主題上必要なものも多いので、「直近30字以内に解説がない」場合だけ重さを加点
const JARGON_TERMS = [
  'SEO',
  'CVR',
  'CV率',
  'UI/UX',
  'UI',
  'UX',
  'KPI',
  'KGI',
  'ROI',
  'LTV',
  'CAC',
  'CRM',
  'SFA',
  'MA',
  'BPR',
  'PoC',
  'MVP',
  'RFP',
  'RFI',
  'SoR',
  'SoE',
  'BI',
  'ETL',
  'CDP',
  'DMP',
  'DWH',
  'API',
  'SaaS',
  'IaaS',
  'PaaS',
  'KGI',
  'OKR',
  'PMF',
  'ARR',
  'MRR',
  'NPS',
  'CES',
  'ROAS',
  'CPA',
  'CPC',
  'RFM',
  'AsIs',
  'ToBe',
  'FM',
  'WBS',
  'PMO',
];
function detectJargonRaw(text) {
  const hits = [];
  for (const term of JARGON_TERMS) {
    // 「（〜）」「とは」「すなわち」「つまり」「= 〜」が直前後30字以内にあれば「解説あり」扱い
    const re = new RegExp(
      `(.{0,30})\\b${term.replace(/[.*+?^${}()|[\]\\\\]/g, '\\\\$&')}\\b(.{0,30})`,
      'g'
    );
    for (const m of text.matchAll(re)) {
      const window = (m[1] || '') + (m[2] || '');
      const explained = /[（(][^）)]{1,30}[）)]|とは|すなわち|つまり|=\s*|意味します|呼ばれ/.test(
        window
      );
      if (!explained) hits.push({ term, snippet: m[0] });
      if (hits.length >= 20) break;
    }
    if (hits.length >= 20) break;
  }
  return hits;
}

// ============ B) 二重否定 / 婉曲 ============
const DOUBLE_NEG_PATTERNS = [
  /[ぁ-んァ-ヶ一-龯]{1,6}(ない|なく)はない/g,
  /[ぁ-んァ-ヶ一-龯]{1,6}ない(こと|もの)は(ない|ありません)/g,
  /[ぁ-んァ-ヶ一-龯]{1,6}と(言えなくもない|いえなくもない)/g,
  /珍しくない|少なくない|無関係ではない|無縁ではない|不可能ではない|稀ではない|まれではない/g,
];
function detectDoubleNeg(text) {
  const hits = [];
  for (const p of DOUBLE_NEG_PATTERNS) {
    const re = new RegExp(p.source, 'g');
    for (const m of text.matchAll(re)) {
      hits.push({ kind: 'double_neg', snippet: contextOf(text, m.index, 30) });
      if (hits.length >= 10) break;
    }
  }
  return hits;
}

// ============ C) 強調定型句（AI tells） ============
const CLICHE_PATTERNS = [
  { re: /に他なりません|に他ならない|に他ならず/g, kind: 'cliche_hokanaranai' },
  { re: /と言っても過言ではありません|と言っても過言ではない/g, kind: 'cliche_kagonde' },
  { re: /まさに[^。]{1,20}(と言える|と呼べる|と言うべき)/g, kind: 'cliche_masani' },
  { re: /いわば[^。]{1,20}(のようなもの|のような存在)/g, kind: 'cliche_iwaba' },
  { re: /実は[^。]{1,20}なのです/g, kind: 'cliche_jitsuwa' },
  { re: /自[分身]が(思う|考える|感じる|抱く|描く)/g, kind: 'ai_tell_jibun' },
];
function detectCliche(text) {
  const hits = [];
  for (const { re, kind } of CLICHE_PATTERNS) {
    const r = new RegExp(re.source, 'g');
    for (const m of text.matchAll(r)) {
      hits.push({ kind, snippet: contextOf(text, m.index, 30) });
      if (hits.length >= 10) break;
    }
  }
  return hits;
}

// ============ D) 漢語重さ ============
const KANGO_PATTERNS = [
  { re: /を実施(する|します|し)/g, kind: 'kango_jisshi' }, // 「やる」「行う」で済む
  { re: /することにより/g, kind: 'kango_niyori' }, // 「することで」
  { re: /を踏まえ(て|ると)/g, kind: 'kango_fumae' }, // 「ふまえて」
  { re: /を鑑み(て|ると)/g, kind: 'kango_kangami' }, // 「考えて」
  { re: /[一-龯]化を(図る|進める|目指す)/g, kind: 'kango_ka' }, // 「〜化を図る」
  { re: /の重要性|の必要性/g, kind: 'kango_jusei' }, // 「が大事」「が要る」
  {
    re: /[ぁ-んァ-ヶ一-龯](することが)(大事|重要|必要|肝心|不可欠)です/g,
    kind: 'kango_taiji_renpatsu',
  },
  { re: /多岐にわたる|多岐に渡る/g, kind: 'kango_taki' },
  { re: /[一-龯]{4,}化/g, kind: 'kango_long_ka' }, // 「効率化」「内製化」「電子化」等の連発
];
function detectKango(text) {
  const hits = [];
  for (const { re, kind } of KANGO_PATTERNS) {
    const r = new RegExp(re.source, 'g');
    for (const m of text.matchAll(r)) {
      hits.push({ kind, snippet: contextOf(text, m.index, 25) });
      if (hits.length >= 12) break;
    }
  }
  return hits;
}

function contextOf(text, idx, pad) {
  const start = Math.max(0, idx - pad);
  const end = Math.min(text.length, idx + pad);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

// ============ メイン ============
const all = [];
let offset = 0;
while (true) {
  const res = await client.get({
    endpoint: 'columns',
    queries: { fields: 'id,title,category,content,publishedAt', limit: 100, offset },
  });
  all.push(...res.contents);
  if (all.length >= res.totalCount) break;
  offset += 100;
}

const results = [];
for (const c of all) {
  const text = stripHtml(c.content);
  const length = text.length;
  const jargon = detectJargonRaw(text);
  const dneg = detectDoubleNeg(text);
  const cliche = detectCliche(text);
  const kango = detectKango(text);
  const total = jargon.length + dneg.length + cliche.length + kango.length;
  const density = length > 0 ? (total / length) * 1000 : 0; // per 1000 chars
  results.push({
    id: c.id,
    title: c.title,
    cat: c.category?.id || 'uncategorized',
    length,
    counts: {
      jargon: jargon.length,
      dneg: dneg.length,
      cliche: cliche.length,
      kango: kango.length,
      total,
    },
    density,
    samples: {
      jargon: jargon.slice(0, 3),
      dneg: dneg.slice(0, 3),
      cliche: cliche.slice(0, 3),
      kango: kango.slice(0, 4),
    },
  });
}

results.sort((a, b) => b.counts.total - a.counts.total);

// Markdown レポート
const today = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push(`# Easy-language audit (neta.txt 観点) — ${today}`);
lines.push('');
lines.push('対象: MicroCMS columns 全件');
lines.push(`総記事数: ${results.length}`);
lines.push('');
lines.push('## 軸');
lines.push('- A) 専門用語素出し（カタカナ略語に直近30字以内の解説がない）');
lines.push('- B) 二重否定 / 婉曲（「珍しくない」「少なくない」等）');
lines.push('- C) 強調定型句 / AI tells（「に他なりません」「実は〜なのです」「自分が思う」等）');
lines.push('- D) 漢語重さ（「を実施する」「することにより」「〜化を図る」「の重要性」等）');
lines.push('');

// カテゴリ別集計
const byCat = {};
for (const r of results) {
  byCat[r.cat] ??= { count: 0, total: 0, jargon: 0, dneg: 0, cliche: 0, kango: 0, length: 0 };
  byCat[r.cat].count++;
  byCat[r.cat].total += r.counts.total;
  byCat[r.cat].jargon += r.counts.jargon;
  byCat[r.cat].dneg += r.counts.dneg;
  byCat[r.cat].cliche += r.counts.cliche;
  byCat[r.cat].kango += r.counts.kango;
  byCat[r.cat].length += r.length;
}
lines.push('## カテゴリ別サマリ');
lines.push('');
lines.push(
  '| category | 記事数 | hit合計 | A専門用語 | B二重否定 | C定型句 | D漢語 | 密度(/1k字) |'
);
lines.push('|---|---:|---:|---:|---:|---:|---:|---:|');
for (const [cat, v] of Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)) {
  const dens = v.length > 0 ? ((v.total / v.length) * 1000).toFixed(2) : '0.00';
  lines.push(
    `| ${cat} | ${v.count} | ${v.total} | ${v.jargon} | ${v.dneg} | ${v.cliche} | ${v.kango} | ${dens} |`
  );
}
lines.push('');

// hit合計ランキング (top 30)
lines.push('## 直し甲斐ランキング（hit合計 上位30本）');
lines.push('');
lines.push('| # | id | title | cat | total | A | B | C | D | 字数 | 密度 |');
lines.push('|---:|---|---|---|---:|---:|---:|---:|---:|---:|---:|');
results.slice(0, 30).forEach((r, i) => {
  const title = r.title.length > 28 ? `${r.title.slice(0, 27)}…` : r.title;
  lines.push(
    `| ${i + 1} | ${r.id} | ${title} | ${r.cat} | ${r.counts.total} | ${r.counts.jargon} | ${r.counts.dneg} | ${r.counts.cliche} | ${r.counts.kango} | ${r.length} | ${r.density.toFixed(2)} |`
  );
});
lines.push('');

// 密度ランキング（500字以上の記事のみ）
const dense = results
  .filter((r) => r.length >= 500)
  .slice()
  .sort((a, b) => b.density - a.density);
lines.push('## 密度ランキング（500字以上、密度の高い順 上位20本）');
lines.push('');
lines.push('| # | id | title | cat | density | total | 字数 |');
lines.push('|---:|---|---|---|---:|---:|---:|');
dense.slice(0, 20).forEach((r, i) => {
  const title = r.title.length > 30 ? `${r.title.slice(0, 29)}…` : r.title;
  lines.push(
    `| ${i + 1} | ${r.id} | ${title} | ${r.cat} | ${r.density.toFixed(2)} | ${r.counts.total} | ${r.length} |`
  );
});
lines.push('');

// 各記事のサンプル（hit合計 上位15本）
lines.push('## サンプルヒット（上位15本、軸ごと最大3〜4例）');
lines.push('');
for (const r of results.slice(0, 15)) {
  if (r.counts.total === 0) continue;
  lines.push(`### ${r.id} — ${r.title}`);
  lines.push(
    `- cat: \`${r.cat}\` / total ${r.counts.total} / 字数 ${r.length} / 密度 ${r.density.toFixed(2)}`
  );
  if (r.samples.jargon.length > 0) {
    lines.push('- A 専門用語素出し:');
    for (const h of r.samples.jargon)
      lines.push(`  - \`${h.term}\`: ${h.snippet.replace(/\n/g, ' ')}`);
  }
  if (r.samples.dneg.length > 0) {
    lines.push('- B 二重否定:');
    for (const h of r.samples.dneg) lines.push(`  - ${h.snippet}`);
  }
  if (r.samples.cliche.length > 0) {
    lines.push('- C 定型句:');
    for (const h of r.samples.cliche) lines.push(`  - \`${h.kind}\`: ${h.snippet}`);
  }
  if (r.samples.kango.length > 0) {
    lines.push('- D 漢語:');
    for (const h of r.samples.kango) lines.push(`  - \`${h.kind}\`: ${h.snippet}`);
  }
  lines.push('');
}

mkdirSync('claudedocs', { recursive: true });
const outPath = `claudedocs/easy-language-audit-${today}.md`;
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`Articles scanned: ${results.length}`);
console.log(`Total hits: ${results.reduce((s, r) => s + r.counts.total, 0)}`);
console.log('Top 5 by total:');
for (const r of results.slice(0, 5)) {
  console.log(`  ${r.counts.total.toString().padStart(3)} | ${r.id.padEnd(28)} | ${r.title}`);
}
