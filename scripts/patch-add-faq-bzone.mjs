// scripts/patch-add-faq-bzone.mjs
// B-zone（検討者向け上位記事）にFAQブロックを追加するPATCHスクリプト。
//
// 使い方:
//   node --env-file=.env scripts/patch-add-faq-bzone.mjs                # dry-run
//   node --env-file=.env scripts/patch-add-faq-bzone.mjs --apply        # 実際にPATCH送信
//
// 対象記事（インプレッション順）:
//   1. requirements-vs-requests (1,262 imp)
//   2. ai-development-cost-guide (740 imp) — 既にFAQあり、自動SKIP
//   3. how-to-write-rfp (583 imp) — 既にFAQあり、自動SKIP
//   4. web-system-cost-by-scale (439 imp)
//
// 設計は patch-add-faq.mjs と同一パターン。

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const FAQ_PATCHES = [
  {
    slug: 'requirements-vs-requests',
    introHeading: 'よくある質問（FAQ）',
    faqs: [
      {
        q: '要求定義と要件定義はどちらを先にやるべきですか？',
        a: '要求定義が先です。要求は「顧客がやりたいこと」、要件は「システムが満たすべき条件」であり、要求を整理しないまま要件に進むと主語が曖昧なドキュメントになります。本記事で解説した通り、要望 → 要求 → 要件の順で具体化していくのが正しい流れです。全体像は<a href="/column/requirements-definition-complete-guide">要件定義の完全ガイド</a>で体系的に解説しています。',
      },
      {
        q: '要件定義書に要求も書いてしまってよいですか？',
        a: '混在させるべきではありません。要求の主語は「顧客」、要件の主語は「システム」であり、1つのドキュメントに混在すると検証可能性が失われます。要求は<a href="/column/user-story-template-examples">ユーザーストーリー</a>形式で別途整理し、それを受入条件付きの要件文に変換するのがBeekle推奨の進め方です。',
      },
      {
        q: '要求定義がうまくできないとどうなりますか？',
        a: '再見積もりの多発、スコープクリープ、検収時の衝突という3つの問題が起きます。たとえば「サクサク使える」のような曖昧な要求がそのまま要件として記録されると、完成後に「思っていたものと違う」で再開発になり、見積もりの2倍以上の工数が発生することもあります。<a href="/column/requirements-definition-process">要件定義の進め方</a>で具体的な変換手順を解説しています。',
      },
      {
        q: '要求定義を発注者側で進めるにはどうすればよいですか？',
        a: 'Beekleが推奨する4ステップがあります。(1) 要求をユーザーストーリー化する、(2) 受入条件を付ける、(3) <a href="/column/ears-requirements-syntax-guide">EARS記法</a>で要件文に変換する、(4) 数値目標を追加する。このプロセスを<a href="/tools/story-builder">ユーザーストーリー作成ツール</a>で実践すると、要求を構造的に整理できます。',
      },
    ],
  },
  {
    slug: 'ai-development-cost-guide',
    introHeading: 'よくある質問（FAQ）',
    faqs: [
      {
        q: '生成AI開発のPoCにはいくらかかりますか？',
        a: '中堅企業の社内向け検証（PoC）であれば80万～250万円、期間1～2か月が目安です。ただし「動いた」だけでは本番化の判断ができないため、業務担当者と一緒に評価リスト（30～100件）を作り精度を数値で測る作業を必ず含めてください。詳しくは<a href="/column/ai-poc-to-production">PoCから本番化に進める条件</a>を参照してください。',
      },
      {
        q: '生成AI開発の見積もりで注目すべき項目は何ですか？',
        a: '特に重要なのは「使う生成AIの具体名が書いてあるか」と「月額利用料の試算が出ているか」の2点です。具体名が出てこない、または月額試算がない場合、設計が固まっていない可能性が高いです。本記事の見積もりチェックリスト10項目を<a href="/column/quote-comparison-checklist">見積もり比較チェックリスト</a>と合わせて確認すると抜け漏れを防げます。',
      },
      {
        q: 'API利用料と開発費用は何が違いますか？',
        a: '開発費用はシステムを構築する一時費用、API利用料はOpenAIやAnthropicに毎月支払う従量課金です。見積もりに「利用料は実費」と書かれている場合、月額がそのまま発注者負担になります。社員100名で1日10回利用の場合、月3万～8万円が目安です。試算が出てこない見積もりは後から請求で揉める典型パターンです。',
      },
      {
        q: '複数社の見積もりを比較するときのポイントは？',
        a: '発注前に「どのフェーズの予算か」「データ範囲」「成功基準」の3つを言語化してから依頼すると、各社の前提が揃って比較しやすくなります。1社だけ極端に安い見積もりは、評価作業やセキュリティ設計が省かれている可能性があります。<a href="/prooffirst">Beekleのゼロスタート</a>では検証フェーズの費用を作業項目別に分解して開示しています。',
      },
    ],
  },
  {
    slug: 'how-to-write-rfp',
    introHeading: 'よくある質問（FAQ）',
    faqs: [
      {
        q: 'RFPに書くべき必須項目は何ですか？',
        a: '本記事で解説した10章構成（背景・目的、現状業務、ToBe像、機能要件、非機能要件、システム構成、体制・役割分担、スケジュール、予算感、評価基準）が骨格です。特に「背景・目的」で数値目標、「現状業務」でAsIsフロー、「評価基準」で重み付けを書くことが提案品質を決めます。要件の整理には<a href="/column/requirements-definition-complete-guide">要件定義の完全ガイド</a>が参考になります。',
      },
      {
        q: 'RFPなしでベンダー選定すると何が起きますか？',
        a: 'ベンダーが「察して」見積もるため提案内容にズレが生じ、追加要望のたびに別途見積もりで予算が膨らみます。社内稟議で「なぜこのベンダーか」を説明する根拠もなく、後半で揉めても判断軸が薄い状態になります。RFPは比較のためだけでなく、発注者の意思を文字に残す装置です。',
      },
      {
        q: 'RFPの評価基準はどう作ればよいですか？',
        a: '機能適合性・技術力・プロジェクト体制・費用・運用保守の5軸に重み付けして、事前にベンダーに開示するのが効果的です。評価基準が事前に分かっていれば提案の質が揃い、選定後の説明責任も果たしやすくなります。機能要件の優先順位付けには<a href="/tools/scope-manager">スコープ管理ツール</a>が使えます。',
      },
      {
        q: 'RFPは何社に送るのが適切ですか？',
        a: '3～5社が実務的に妥当です。2社以下では比較軸が少なく、6社以上では評価工数が膨らみます。候補ベンダーの得意領域が読みきれない場合は、RFPの前に軽いRFI（情報提供依頼書）を挟むと選定精度が上がります。ベンダー比較のポイントは<a href="/column/ai-development-vendor-selection">開発会社の選び方</a>も参照してください。',
      },
    ],
  },
  {
    slug: 'web-system-cost-by-scale',
    introHeading: 'よくある質問（FAQ）',
    faqs: [
      {
        q: 'Webシステム開発で予算超過が起きる原因は何ですか？',
        a: '最も多い原因は要件定義の甘さです。「小さい」と思って雑な要件定義で進めると、想定外の業務が途中で見つかり工数が倍増します。中規模以上ではPO（プロダクトオーナー）不在による意思決定の遅延も典型的です。発注前に<a href="/column/quote-comparison-checklist">見積もり比較チェックリスト</a>で費用の内訳を確認しておくと予算超過のリスクを下げられます。',
      },
      {
        q: '小規模開発と大規模開発の体制はどう違いますか？',
        a: '小規模（300～800万円）はPM兼エンジニア1名＋開発1～2名で済みますが、大規模（4,000万円以上）はPM・アーキテクト・開発リーダー複数名・QAチーム・SREなど10名以上の体制が必要です。規模に合わない体制で始めると、小規模なら進捗が見えなくなり、大規模ならガバナンス不足で炎上します。',
      },
      {
        q: '開発費用の見積もりを比較するコツはありますか？',
        a: '同じ「1,000万円」でも、小規模をオーバースペックで作ったのか、中規模を適正に作ったのかで意味が違います。まず本記事の判断軸（利用ユーザー数、画面数、外部連携数、業務複雑さ、非機能要件）で自社プロジェクトの規模を特定し、規模に合った発注スタイルを選んでください。内訳の詳しい読み方は<a href="/column/system-development-cost-breakdown">システム開発費用の内訳ガイド</a>で解説しています。',
      },
      {
        q: '運用・保守コストはどの程度見込めばよいですか？',
        a: '開発規模によりますが、初期費用の15～25%程度を年間の運用・保守費として見込むのが一般的です。モニタリング、ログ管理、デプロイ自動化、セキュリティパッチ適用、障害対応が主な内訳です。RFP段階で運用フェーズの体制と費用を明記しておくと、リリース後に「保守契約が決まっていない」事態を防げます。見積もりの全体像は<a href="/column/estimate-complete-guide">見積もり完全ガイド</a>を参照してください。',
      },
    ],
  },
];

function buildFaqHtml(introHeading, faqs) {
  const lines = [`<h2>${introHeading}</h2>`];
  for (const { q, a } of faqs) {
    lines.push(`<h2>Q. ${q}</h2>`);
    lines.push(`<p>A. ${a}</p>`);
  }
  return `\n${lines.join('\n')}\n`;
}

function hasExistingFaq(html) {
  return (
    /<h[23][^>]*>\s*よくある質問/.test(html) ||
    /<h[23][^>]*>Q\d*\.?\s/.test(html) ||
    /<p>\s*<strong>\s*Q\.\s/.test(html) ||
    /<p>\s*Q\.\s[\s\S]{0,200}A\.\s/.test(html)
  );
}

function insertFaqBeforeFinalCta(content, faqBlock) {
  // {{CONTACT_CTA}} または {{ZERO_START_CTA}} の最後の出現の直前に挿入
  const ctaRegex = /<p>\s*\{\{(?:CONTACT_CTA|ZERO_START_CTA)\}\}\s*<\/p>/g;
  const matches = [...content.matchAll(ctaRegex)];
  if (matches.length === 0) {
    // CTA マーカーが無い場合は末尾に追加
    return content + faqBlock;
  }
  const last = matches[matches.length - 1];
  const idx = last.index;
  return `${content.substring(0, idx)}${faqBlock}\n${content.substring(idx)}`;
}

async function processOne(patch) {
  const { slug, introHeading, faqs } = patch;
  console.log(`\n========== ${slug} ==========`);

  let column;
  try {
    column = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,content' },
    });
  } catch (err) {
    console.error(`  ERROR: fetch failed: ${err.message}`);
    return { slug, status: 'fetch_failed' };
  }

  if (column.id !== slug) {
    console.error(`  STOP: ID mismatch expected=${slug} actual=${column.id}`);
    return { slug, status: 'id_mismatch' };
  }
  console.log(`  TITLE: ${column.title}`);

  if (hasExistingFaq(column.content)) {
    console.log('  SKIP: FAQ block already exists');
    return { slug, status: 'skipped_has_faq' };
  }

  const faqHtml = buildFaqHtml(introHeading, faqs);
  const newContent = insertFaqBeforeFinalCta(column.content, faqHtml);

  console.log(
    `  ADD ${faqs.length} FAQs (content ${column.content.length} -> ${newContent.length}, +${newContent.length - column.content.length})`
  );

  // Show preview of inserted FAQ
  console.log('  --- FAQ PREVIEW ---');
  console.log(faqHtml.substring(0, 600));
  if (faqHtml.length > 600) console.log('  ... (truncated)');
  console.log('  --- END PREVIEW ---');

  if (!APPLY) {
    console.log('  DRY-RUN: use --apply to send PATCH');
    return { slug, status: 'dry_run' };
  }

  try {
    await client.update({ endpoint: 'columns', contentId: slug, content: { content: newContent } });
  } catch (err) {
    console.error(`  PATCH FAILED: ${err.message}`);
    return { slug, status: 'patch_failed' };
  }
  console.log('  PATCH OK');

  // Verify
  const verify = await client.get({
    endpoint: 'columns',
    contentId: slug,
    queries: { fields: 'id,content' },
  });
  const ok = hasExistingFaq(verify.content);
  console.log(`  VERIFY: FAQ block detected = ${ok}`);
  return { slug, status: ok ? 'applied' : 'applied_but_verify_failed' };
}

const results = [];
for (const patch of FAQ_PATCHES) {
  results.push(await processOne(patch));
}

console.log(`\n========== Summary (${APPLY ? 'APPLIED' : 'DRY-RUN ONLY'}) ==========`);
for (const r of results) {
  console.log(`  ${r.slug.padEnd(36)} ${r.status}`);
}
