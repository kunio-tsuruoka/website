// 全コラムを取得し、column-writing-style.md / microcms.md のルール違反を検出する。
// 使い方: node --env-file=.env scripts/scan-column-style.mjs
const d = process.env.MICROCMS_SERVICE_DOMAIN;
const k = process.env.MICROCMS_API_KEY;
if (!d || !k) {
  console.error('MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定');
  process.exit(1);
}

async function fetchAll() {
  let all = [];
  let off = 0;
  while (true) {
    const r = await fetch(
      `https://${d}.microcms.io/api/v1/columns?limit=100&offset=${off}&fields=id,title,content,category`,
      { headers: { 'X-MICROCMS-API-KEY': k } }
    );
    const j = await r.json();
    all = all.concat(j.contents || []);
    if (all.length >= j.totalCount) break;
    off += 100;
  }
  return all;
}

// <pre>...</pre> を除去した本文（コード例の中の記号は誤検出するため）
function stripPre(html) {
  return (html || '').replace(/<pre[\s\S]*?<\/pre>/gi, '');
}

const CHECKS = [
  {
    key: 'AIっぽい冗長主語',
    re: /自[分身]が(思う|考える|感じる|抱く|描く)/g,
  },
  {
    key: '過剰な強調定型句',
    re: /に他なりません|と言っても過言ではありません|まさに[^。]{1,20}と言える/g,
  },
  {
    key: 'Markdown太字残骸(**)',
    re: /\*\*[^*\n]{1,40}\*\*/g,
  },
  {
    key: 'Markdown見出し残骸(#)',
    re: /(^|\n)#{1,4}\s/g,
  },
  {
    key: 'Markdownリスト残骸(*/-)',
    re: /(^|\n)[*-]\s/g,
  },
  {
    key: 'Markdownリンク残骸([](　))',
    re: /\[[^\]]{1,40}\]\([^)]+\)/g,
  },
  {
    key: '未置換マーカー({{}})',
    re: /\{\{[A-Z_]+\}\}/g,
  },
  {
    key: '英語EARS混在(shall)',
    // ears-requirements-syntax-guide は教材なので除外
    re: /\b(THE|The|WHEN|When|WHILE|While|IF|If|WHERE|Where)\b[^。\n]{0,40}\bshall\b/g,
    skipIds: ['ears-requirements-syntax-guide'],
  },
];

function countQ(html) {
  // column FAQ 抽出器と同じ発想: <h2>Q. ...</h2> の数
  const m = (html || '').match(/<h2[^>]*>\s*Q\d*[.．]?/gi);
  return m ? m.length : 0;
}

(async () => {
  const all = await fetchAll();
  const flagged = [];
  for (const c of all) {
    const body = stripPre(c.content || '');
    const hits = [];
    for (const chk of CHECKS) {
      if (chk.skipIds?.includes(c.id)) continue;
      const m = body.match(chk.re);
      if (m?.length) {
        hits.push({ key: chk.key, count: m.length, samples: [...new Set(m)].slice(0, 3) });
      }
    }
    if (hits.length) flagged.push({ id: c.id, title: c.title, hits });
  }

  console.log(`スキャン対象: ${all.length}本 / 違反検出: ${flagged.length}本\n`);
  // 検出種別ごとの集計
  const tally = {};
  for (const f of flagged) for (const h of f.hits) tally[h.key] = (tally[h.key] || 0) + 1;
  console.log('=== 検出種別ごとの記事数 ===');
  for (const [key, n] of Object.entries(tally).sort((a, b) => b[1] - a[1]))
    console.log(`  ${n}本  ${key}`);

  console.log('\n=== 記事別の検出内容 ===');
  for (const f of flagged) {
    console.log(`\n[${f.id}] ${f.title}`);
    for (const h of f.hits) {
      console.log(
        `  - ${h.key} ×${h.count}: ${h.samples.map((s) => JSON.stringify(s)).join(' , ')}`
      );
    }
  }

  // FAQ schema 未保有の記事（参考情報）
  const noFaq = all.filter((c) => countQ(c.content) === 0);
  console.log(`\n=== FAQ(Q.見出し)ゼロの記事: ${noFaq.length}/${all.length} ===`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
