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

  // 01-01（0012は現行本文が既に論理的に正しいためスキップ。0014aは編集パスへ）
  'process-undefined-system-request': [
    {
      id: '0013',
      before: '撤退条件がないPoCは、止まらないまま日常業務になる。',
      after: '撤退条件がないPoCは、結果が出ないまま惰性的に続き、新たな負債を生み続ける。',
    },
    {
      id: '0014b',
      before: 'ウォーターフォールが向く場面',
      after: 'ウォーターフォール（計画先行型）が向く場面',
    },
  ],

  // 01-02
  'mvp-development-guide': [
    {
      id: '0017',
      before: 'しない（廃棄前提）',
      after: 'しない（捨てる前提）',
    },
    {
      id: '0018',
      before: '、期間3〜6週間',
      after: '、期間3〜6週間（約0.8〜1.5ヶ月）',
    },
    {
      id: '0020',
      before: 'FMで作る／後回し／作らないを判定',
      after: 'FM（FM法：Functionality Matrix、機能優先度行列で選別）で作る／後回し／作らないを判定',
    },
    {
      id: '0021',
      before: '「使われればOK」では判定できない。利用回数・継続率・業務指標を数値で決める',
      after:
        '「使われたか」だけで判定すると利用頻度や業務インパクトが測れない。利用回数・継続率・業務指標を数値で決める',
    },
  ],

  // 01-03
  'poc-boundary-line': [
    {
      id: '0023',
      before: 'どれかが決まっていない',
      after: 'どれかが定義されていない',
    },
  ],

  // 01-05
  'ai-dx-introduction-process': [
    {
      id: '0038',
      before: '「生成AIで業務効率化」「DXでDXを」',
      after: '「生成AIで業務効率化」「生成AIでDXを」',
    },
    {
      id: '0041',
      all: true,
      before: '>要件定義の完全ガイド</a>',
      after: '>要件定義の書き方と実例</a>',
    },
    {
      id: '0043',
      before: 'この5パターンのいずれに該当するか',
      after: 'この4パターンのいずれに該当するか',
    },
    {
      id: '0051',
      before: '経済産業省の「DXレポート」や',
      after: '経済産業省の「DXレポート2.2」や',
    },
  ],

  // 01-08
  'requirements-definition-template': [
    {
      id: '0049',
      before: 'MoSCoWとFMで要件を絞り込む方法',
      after: '要件の優先順位付け: MoSCoW vs FM法 完全比較',
    },
    {
      id: '0050',
      before: 'ツール化したい方は',
      after: 'ツールを利用したい方は',
    },
  ],

  // 01-09
  'requirements-definition-complete-guide': [
    { id: '0052a', before: '業務フローの可視化（As-Is / To-Be）', after: '業務フローの可視化（As-Is/To-Be）' },
    {
      id: '0052b',
      before: 'As-Is / To-Be を並べて可視化することを推奨しています。',
      after: 'As-Is/To-Be を並べて可視化することを推奨しています。',
    },
    { id: '0052c', before: 'Beekle のツール', after: 'Beekleのツール', all: true },
  ],

  // 01-11
  'requirements-prioritization-moscow-fm': [
    {
      id: '0054',
      before: '書籍『システムを作らせる技術』（白川克著）',
      after: '書籍『システムを作らせる技術』（白川克、日経BP、2021）',
    },
  ],

  // 01-14
  'ai-era-development-flow': [
    {
      id: '0056',
      all: true,
      before: '生成AI開発のスピード｜プロトタイプを1〜2週間で作る方法',
      after:
        '生成AIで1〜2週間プロトタイプを作る4ステップ｜ストーリー→FM→Gherkin→Laravel Inertia',
    },
    {
      id: '0057',
      before: '「作ったのに使われない」を防ぐ機能フィルタリング｜FM活用法',
      after: '「作ったのに使われないシステム」を防ぐ要件絞り込み術｜FM法とユーザー視点',
    },
  ],

  // 01-06
  'requirements-vs-requests': [
    {
      id: '0045',
      before: '後工程でトラブルの原因になりします。',
      after: '後工程でトラブルの原因になります。',
    },
    {
      id: '0046',
      before: '要件は「何を、どう実現するか・どう検証するか」まで書きます。',
      after: '要件は「何を実現するか・どう検証するか」まで書きます。',
    },
    {
      id: '0047',
      before: 'コストが発生しやすくします。',
      after: 'コストが発生しやすくなります。',
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
    if (beforeCount > 1 && !r.all) {
      results.push({ id: r.id, status: 'ambiguous', count: beforeCount });
      continue;
    }
    // all=true は同一修正が複数箇所にある場合（表記統一・同一アンカー複数）に全置換する
    out = r.all ? out.split(r.before).join(r.after) : out.replace(r.before, r.after);
    results.push({ id: r.id, status: 'replaced', count: r.all ? beforeCount : 1 });
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
