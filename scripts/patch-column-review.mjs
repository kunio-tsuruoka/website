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
    // 0064 クロス参照: common-mistakes のタイトル 8選→5選 に合わせて本文の言及も更新
    { id: '0064-xref', all: true, before: '失敗事例8選', after: '失敗事例5選' },
    // 0004: パイプライン見出しを非エンジニア向けの平易表現に（手法名は補足に残す）
    {
      id: '0004a',
      before:
        '<strong>ユーザーストーリー＋EARS</strong> — 「誰が・何を・なぜ」を書き、受入条件を EARS 5パターンで分解する',
      after:
        '<strong>利用シナリオと期待成果を具体化する</strong> — 「誰が・何のために使い・どう改善されるか」（ユーザーストーリー）を整理し、期待する動作や成果を具体化する',
    },
    {
      id: '0004b',
      before: '<strong>FM法でスコープを決める</strong>',
      after: '<strong>開発範囲と優先順位を整理する</strong>',
    },
    {
      id: '0004c',
      before:
        '<strong>Gherkin で機能要件＋非機能要件を仕様化</strong> — Given/When/Then で書き、デモ・受入テスト・自動テストを1本化する',
      after:
        '<strong>開発仕様と受入基準を整理する</strong> — Given/When/Then で書き、デモと受入テストを1本化する',
    },
    {
      id: '0004d',
      before:
        '<strong>Laravel + Inertia でプロトタイプ実装</strong> — 1〜2週間で動くたたき台を作り、現場で触ってもらう',
      after: '<strong>早期プロトタイプで検証する</strong> — 1〜2週間で試作し、現場の適合性を確認する',
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
    // 0037: 和語並列の順序統一（DX／AI → AI／DX）。全角／は規約どおり維持。
    { id: '0037', all: true, before: 'DX／AI', after: 'AI／DX' },
    {
      id: '0042',
      before: '業務可視化ツール（<a href="/tools/flow-mapper">/tools/flow-mapper</a>）',
      after: '<a href="/tools/flow-mapper">業務フロー可視化ツール</a>',
    },
    {
      id: '0044',
      before: 'ワークショップが30分→2時間で済みます。',
      after: 'ワークショップが2時間→30分で完了します。',
    },
  ],

  // 01-10
  'things-not-to-do-pm': [
    {
      id: '0053',
      before: 'スコープ管理（何を作る/作らない）と意思決定',
      after: 'スコープを絞り、仕様を決める',
    },
  ],

  // 01-13
  'user-story-template-examples': [
    {
      id: '0055a',
      before:
        'Beekleでは、ユーザーストーリーを書く負担を減らすために、ユーザーストーリー作成ツール という無料Webツールを公開しています。',
      after:
        'Beekleでは、ユーザーストーリーを書く負担を減らすための作成ツールを公開しています。',
    },
    { id: '0055b', before: '>Story Builder を試す</a>', after: '>ユーザーストーリー作成ツール を試す</a>' },
  ],

  // 02-08
  'engineer-communication': [
    { id: '0077', before: 'を推奨しています。本記事は、各ステップで', after: 'を推奨しています。本記事では、各ステップで' },
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

  // 01-04（タイトル0026・構造0036は別対応）
  'how-to-write-rfp': [
    {
      id: '0030',
      before: '良いベンダーほど降りやすくなります。',
      after: '良いベンダーほど提案を見送る可能性が高まります。',
    },
    {
      id: '0031',
      before:
        '骨格を真面目に書いても、9つの典型的な落とし穴があります。Beekleがプロジェクト支援で繰り返し見てきた失敗パターンです。',
      after:
        '骨格を真面目に書いても失敗する落とし穴があります。プロジェクト支援で共通してよく見られる、9つの失敗パターンを紹介します。',
    },
    {
      id: '0032',
      before: '「年間100時間の手作業削減」「受注リードタイムを3営業日から1営業日に」',
      after: '「手作業を年間100時間削減する」「受注リードタイムを3営業日→1営業日に短縮する」',
    },
    {
      id: '0033',
      before: '落とし穴⑥ 評価基準なし＝値段勝負になる',
      after: '落とし穴⑥ 評価基準を設けない＝値段勝負にする',
    },
    {
      id: '0034a',
      before: '落とし穴⑦ スケジュールが現実離れで良いベンダーが降りる',
      after: '落とし穴⑦ 現実離れしたスケジュールを出す',
    },
    {
      id: '0034b',
      before: '落とし穴⑧ 発注側の役割分担を書かない＝丸投げ案件と読まれる',
      after: '落とし穴⑧ 発注側の役割分担を書かない',
    },
    {
      id: '0034c',
      before: '落とし穴⑨ 質疑応答プロセスを設計せず提案品質が落ちる',
      after: '落とし穴⑨ 質疑応答プロセスを設計しない',
    },
    {
      id: '0035',
      before: '評価基準の作り方（落とし穴⑥の深掘り）',
      after: 'ベンダー選定の評価基準の作り方',
    },
    {
      id: '0027',
      before: '③ ToBe像／達成したいこと',
      after: '③ 改善後（ToBe）の像と達成したいこと',
    },
    {
      // 0036: 生URL表示のリンク段落 → 名前付きリンクの箇条書きに
      id: '0036',
      before:
        '発注者の現場で使いやすいように、Beekleが提供している<a href="/tools/story-builder">/tools/story-builder</a>では、業務シナリオを発注者の言葉で構造化できます。<a href="/tools/flow-mapper">/tools/flow-mapper</a>ではAsIs/ToBeの業務フロー図を作成できます。<a href="/tools/scope-manager">/tools/scope-manager</a>では、評価軸の重み付けやテーマの優先順位整理に使えます。</p>',
      after:
        '発注者の現場で使いやすいよう、Beekleは以下のRFP作成支援ツールを提供しています。</p><ul><li><a href="/tools/story-builder">ユーザーストーリー作成ツール</a>：業務シナリオを発注者の言葉で構造化できます</li><li><a href="/tools/flow-mapper">業務フロー可視化ツール</a>：As-Is/To-Beの業務フロー図を作成できます</li><li><a href="/tools/scope-manager">スコープ管理ツール</a>：評価軸の重み付けやテーマの優先順位整理に使えます</li></ul>',
    },
  ],

  // 02-03（0069 は実体がタイトルフィールドのため title サブバッチで対応）
  'silent-three-weeks': [
    {
      id: '0068',
      before: 'GAS経験があるという理由でDX担当に任命された',
      after: 'Google Apps Script（GAS）経験があるという理由でDX担当に任命された',
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
    // 0064 クロス参照: common-mistakes のタイトル 8選→5選 に合わせて本文の言及も更新
    { id: '0064-xref', all: true, before: '失敗事例8選', after: '失敗事例5選' },
    // 0070 クロス参照: ai-development-speed のタイトル改変に合わせてアンカー文言も新タイトルへ再同期
    {
      id: '0070-xref',
      all: true,
      before: '生成AIで1〜2週間プロトタイプを作る4ステップ｜ストーリー→FM→Gherkin→Laravel Inertia',
      after: '生成AIで1〜2週間でプロトタイプを作る4ステップ｜発注前に知っておくべき開発の流れ',
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

// タイトルフィールドの修正（content とは別フィールド・SEOのtitleタグに直結）。
const TITLE_PATCHES = {
  'how-to-write-rfp': { id: '0026', before: '7項目と9つの落とし穴', after: '10項目と9つの落とし穴' },
  'common-mistakes': { id: '0064', before: '失敗事例8選', after: '失敗事例5選' },
  'silent-three-weeks': {
    id: '0069',
    before: '発注側の社内で起きている3つのこと',
    after: '発注決済者が案件を滞らせないためにとるべき3つの介入手順',
  },
  'ai-development-speed': {
    id: '0070',
    before: '生成AIで1〜2週間プロトタイプを作る4ステップ｜ストーリー→FM→Gherkin→Laravel Inertia',
    after: '生成AIで1〜2週間でプロトタイプを作る4ステップ｜発注前に知っておくべき開発の流れ',
  },
};

async function processTitle(slug, patch) {
  const cur = await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'id,title' } });
  console.log(`\n=== [title] ${slug} ===`);
  const count = cur.title.split(patch.before).length - 1;
  if (count === 0) {
    const done = cur.title.includes(patch.after);
    console.log(`  ${done ? '・(適用済)' : '❌ not_found'} ${patch.id}: 現タイトル「${cur.title}」`);
    return;
  }
  if (count > 1) {
    console.log(`  ❌ ambiguous (${count}件) ${patch.id}`);
    return;
  }
  const next = cur.title.replace(patch.before, patch.after);
  console.log(`  ${patch.id}: 「${cur.title}」\n         → 「${next}」`);
  if (!APPLY) {
    console.log('  [dry-run]（--apply で本番適用）');
    return;
  }
  await client.update({ endpoint: 'columns', contentId: slug, content: { title: next } });
  const after = await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'title' } });
  console.log(after.title === next ? '  ✅ タイトル更新 + 検証OK' : '  ❌ 検証失敗');
}

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
  // 検証: before が消えていることを確認（after存在チェックだと、後続replの before に
  // 使われる連鎖置換で誤検知するため。before===after はスキップ）。
  const after = await client.get({ endpoint: 'columns', contentId: slug, queries: { fields: 'content' } });
  let ok = true;
  for (const r of repls) {
    if (r.before === r.after) continue;
    if (after.content.includes(r.before)) {
      ok = false;
      console.log(`  ❌ 検証失敗: ${r.id} の before がまだ残っている`);
    }
  }
  console.log(ok ? `  ✅ PATCH + 検証OK（${changed}件）` : '  ❌ 検証に失敗（要確認）');
}

const TITLE_ONLY = process.argv.includes('--titles');

(async () => {
  console.log(APPLY ? '【本番適用モード】' : '【dry-run（既定）】');
  // タイトル修正
  const titleSlugs = slugArg ? [slugArg] : Object.keys(TITLE_PATCHES);
  for (const slug of titleSlugs) {
    if (TITLE_PATCHES[slug]) await processTitle(slug, TITLE_PATCHES[slug]);
  }
  if (TITLE_ONLY) return;
  // 本文修正
  const slugs = slugArg ? [slugArg] : Object.keys(PATCHES);
  for (const slug of slugs) {
    if (!PATCHES[slug]) {
      if (!TITLE_PATCHES[slug]) console.log(`(${slug} は PATCHES に未定義)`);
      continue;
    }
    await processSlug(slug, PATCHES[slug]);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
