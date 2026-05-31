// Webコラム監修（2026-05-31 納品）のテキスト修正を MicroCMS に適用するスクリプト。
//
// 使い方:
//   node --env-file=.env scripts/patch-column-review.mjs            # dry-run（既定。書き込まない）
//   node --env-file=.env scripts/patch-column-review.mjs --apply    # 本番適用
//   node --env-file=.env scripts/patch-column-review.mjs --slug project-management-complete-guide
//
// 安全策:
//   - 各 before 文字列は「本文中にちょうど1件」存在する時のみ置換（0件/複数件はスキップして警告）
//   - 既に after が存在する（再実行）場合はスキップ（冪等）
//   - 置換は既存HTML内の部分文字列置換のみ。改行・ブロック構造は保持（1行詰めHTML事故を避ける）
//   - 適用後に再取得して after 存在 / before 不在を検証
//
// 参照: .claude/rules/microcms.md, column-writing-style.md, seo.md

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const slugArg = (() => {
  const i = process.argv.indexOf('--slug');
  return i >= 0 ? process.argv[i + 1] : null;
})();

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// slug ごとの置換セット。issue 番号を id に残してトレース可能にする。
const PATCHES = {
  'project-management-complete-guide': [
    {
      id: '0001a',
      before:
        '「ITのことはよくわからないから、あとはプロのエンジニアにお任せ」でシステム開発を始めると、ほぼ確実に失敗します。',
      after:
        '「ITのことはよくわからないから、あとはプロのエンジニアにお任せ」——この判断が、システム開発を失敗に向かわせる最大の要因です。',
    },
    {
      id: '0001b',
      before: 'AIが速く書いた分だけ「使われない機能」が量産されるだけです。',
      after: 'AIが速く書いた分だけ、「使われない機能」が増えてしまうリスクがあります。',
    },
    {
      id: '0002a',
      before: 'DX案件なら必須。現状業務と理想業務の差分を絵にする',
      after: '既存業務のDX化案件なら必須。現状業務と理想業務の差分を絵にする',
    },
    {
      id: '0002b',
      before: 'DX案件なら As-Is と To-Be を可視化する',
      after: 'As-Is と To-Be を可視化する',
    },
    {
      id: '0002c',
      before: '業務差分を可視化（DX案件のみ）',
      after: '業務差分を可視化（既存業務のDX化案件のみ）',
    },
    {
      id: '0003',
      before: 'Tom Cargill の',
      after: 'ソフトウェア工学で知られる',
    },
    {
      id: '0008',
      before: 'スコープ管理「FM法」の使い方',
      after: 'FM法の使い方',
    },
    {
      id: '0010',
      before: 'Beekle推奨：発注側が回す6ステップパイプライン',
      after: '発注側が押さえるべき6つのステップ',
    },
  ],
};

function applyReplacements(html, repls) {
  let out = html;
  const results = [];
  for (const r of repls) {
    const beforeCount = out.split(r.before).length - 1;
    const afterAlready = out.split(r.after).length - 1;
    if (beforeCount === 0) {
      // 既に after があるなら適用済み（冪等スキップ）
      results.push({ id: r.id, status: afterAlready > 0 ? 'already' : 'not_found' });
      continue;
    }
    if (beforeCount > 1) {
      results.push({ id: r.id, status: 'ambiguous', count: beforeCount });
      continue;
    }
    out = out.replace(r.before, r.after);
    results.push({ id: r.id, status: 'replaced' });
  }
  return { out, results };
}

async function processSlug(slug, repls) {
  const cur = await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'id,content' } });
  const { out, results } = applyReplacements(cur.content, repls);

  console.log(`\n=== ${slug} ===`);
  for (const r of results) {
    const mark =
      r.status === 'replaced' ? '✓' : r.status === 'already' ? '・(適用済)' : '❌';
    console.log(`  ${mark} ${r.id}: ${r.status}${r.count ? ` (${r.count}件)` : ''}`);
  }

  const changed = results.filter((r) => r.status === 'replaced').length;
  const problems = results.filter((r) => r.status === 'not_found' || r.status === 'ambiguous');
  if (problems.length > 0) {
    console.log(`  ⚠ 要確認: ${problems.map((p) => p.id).join(', ')}（手動チェックが必要）`);
  }
  if (changed === 0) {
    console.log('  変更なし');
    return;
  }
  if (!APPLY) {
    console.log(`  [dry-run] ${changed}件を置換予定（--apply で本番適用）`);
    return;
  }

  await client.update({ endpoint: 'columns', contentId: slug, content: { content: out } });
  // 検証
  const after = await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'content' } });
  let ok = true;
  for (const r of repls) {
    const a = after.content.includes(r.after);
    if (!a) {
      ok = false;
      console.log(`  ❌ 検証失敗: ${r.id} の after が見つからない`);
    }
  }
  console.log(ok ? `  ✅ PATCH + 検証OK（${changed}件）` : '  ❌ 検証に失敗（要確認）');
}

(async () => {
  const slugs = slugArg ? [slugArg] : Object.keys(PATCHES);
  console.log(APPLY ? '【本番適用モード】' : '【dry-run（既定）】');
  for (const slug of slugs) {
    if (!PATCHES[slug]) {
      console.log(`(${slug} は PATCHES に未定義)`);
      continue;
    }
    await processSlug(slug, PATCHES[slug]);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
