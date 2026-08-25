// LLMO経由問い合わせを増やすため、AI検索で引用・流入が出ている買い手記事に
// 「AI/RAG発注前FAQ」を追補するMicroCMS PATCHスクリプト。
//
// 使い方:
//   node --env-file=.env scripts/patch-llmo-faqs.mjs          # dry-run
//   node --env-file=.env scripts/patch-llmo-faqs.mjs --apply  # MicroCMSへ反映

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SENTINEL = '<!-- llmo-faq-2026-08-04 -->';
const BACKUP_DIR = 'docs/marketing/data/microcms-backup/2026-08-04-llmo-faqs';

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const FAQ_PATCHES = [
  {
    slug: 'requirements-definition-complete-guide',
    introHeading: 'AI・RAG開発を相談する前のよくある質問',
    faqs: [
      {
        q: '生成AIやRAGの相談でも、最初に要件定義が必要ですか？',
        a: '必要です。ただし、従来のように分厚い要件定義書を最初から手作業で作る必要はありません。既存のRFP、As-Isの業務フロー、議事録、要望メモがあれば、PM on Railsでユースケース、ユーザーストーリー、受入条件に展開できます。モデル選定より先に「誰が、どの業務で、何を質問し、どの根拠を見て判断するか」を決めるのが重要です。',
      },
      {
        q: '社内文書検索AIを作りたい場合、何を準備すれば相談できますか？',
        a: '完璧な資料は不要です。まず、対象にしたい文書の種類、文書の保存場所、よく聞かれる質問、回答に必ず出したい根拠、閲覧権限の制約を整理してください。文書が散らばっている場合でも、最初は1部署・1業務に絞って確認すれば、RAGで進めるべきか、通常検索やFAQ整備で足りるかを判断できます。',
      },
      {
        q: '要件が固まっていない段階で開発会社に相談してもよいですか？',
        a: '相談して構いません。むしろRFPやAs-Isが粗い段階の方が、PM on Railsでユースケース化しながら発注範囲を絞れます。ただし「何でもAIで効率化したい」だけだと提案が発散します。現場で時間がかかっている確認作業、属人化している判断、問い合わせが集中している業務を2〜3個挙げると、費用も期間も見えやすくなります。',
      },
      {
        q: 'AI開発の発注で失敗しやすい要件は何ですか？',
        a: '「回答精度を高くしたい」「社内資料を全部読ませたい」「安全に使いたい」のように、基準や範囲が曖昧な要件です。精度は評価用の質問リスト、対象文書は優先順位、セキュリティはデータ範囲と権限で具体化します。ここを決めずに実装へ進むと、PoC後に本番化判断ができなくなります。',
      },
    ],
  },
  {
    slug: 'how-to-write-rfp',
    introHeading: 'AI・RAG開発のRFPでよくある質問',
    faqs: [
      {
        q: 'AI開発やRAG構築のRFPには、通常のシステム開発と違う項目が必要ですか？',
        a: '必要です。通常の機能要件に加えて、対象データ、使ってよいLLM、データが学習利用されない条件、回答根拠の出し方、評価用質問リスト、誤回答時の扱い、月額API費用の試算を入れてください。ここが抜けると、各社の提案が比較できず、安く見える提案ほど本番運用の前提が欠けやすくなります。',
      },
      {
        q: 'RAG開発のRFPで、対象文書はどこまで細かく書くべきですか？',
        a: '文書名を全部列挙する必要はありませんが、文書の種類、形式、件数や容量の目安、更新頻度、保存場所、閲覧権限は書くべきです。特に「部署ごとに見られる文書が違う」「古い版と最新版が混在する」「スキャンPDFが多い」といった条件は、構成と見積もりに大きく影響します。',
      },
      {
        q: 'AI/RAG開発の提案を比較するとき、何を評価基準にすればよいですか？',
        a: '価格だけでなく、想定質問に対する回答精度の測り方、根拠提示の設計、権限管理、運用時の文書更新、月額費用の試算、PoCから本番化への判断基準を評価してください。「どのモデルを使うか」より、「業務で間違えたら困る質問をどう扱うか」を説明できる会社の方が実務では重要です。',
      },
      {
        q: 'RFPを出す前にPoCをした方がよいですか？',
        a: '要件が曖昧な場合は、先にRFPやAs-IsをPM on Railsにかけて、ユースケースと評価基準を作る方がよいです。RFPをいきなり出すと、各社が別々の前提で見積もり、比較できなくなります。PoCで「対象文書」「答えたい質問」「失敗例」「本番化条件」を整理してからRFPに落とすと、提案の質が揃います。',
      },
    ],
  },
  {
    slug: 'system-development-cost-breakdown',
    introHeading: 'AI・RAG開発費用でよくある質問',
    faqs: [
      {
        q: 'RAGや社内文書検索AIの費用は、何で大きく変わりますか？',
        a: '主に、対象文書の量と形式、権限管理の複雑さ、回答精度の評価方法、既存システム連携、本番運用の監視・更新方式で変わります。単にチャット画面を作るだけなら小さく始められますが、根拠提示、部署別権限、文書更新、監査ログまで入れると見積もりは大きくなります。',
      },
      {
        q: 'AI開発の見積もりで、後から増えやすい費用は何ですか？',
        a: '後から増えやすいのは、データ整備、評価データ作成、セキュリティレビュー、権限設計、運用画面、月額API利用料です。初期見積もりに「PoCのみ」と書かれている場合、本番化に必要な監視、ログ、再学習・再インデックス、障害対応が含まれていないことがあります。',
      },
      {
        q: '生成AIのAPI利用料は開発費に含まれますか？',
        a: '含まれないことが多いです。開発費は作るための一時費用で、API利用料は使った分だけ毎月発生する運用費です。RFPや見積もり依頼時には、想定利用者数、1人あたりの質問回数、1質問あたりの文書量を前提に月額レンジを出してもらうべきです。',
      },
      {
        q: '費用を抑えてAI/RAG開発を始めるにはどうすればよいですか？',
        a: '最初から全社導入を狙わず、RFPやAs-IsからPM on Railsで1部署・1文書群・30〜50問の評価リストに絞るのが現実的です。対象を小さくすれば、データ整備、権限管理、評価、画面開発の範囲が抑えられます。まずPoCで「使えそうか」ではなく「どの条件なら本番化できるか」を判断してください。',
      },
    ],
  },
  {
    slug: 'ai-development-cost-guide',
    introHeading: '生成AI開発の発注前によくある質問',
    faqs: [
      {
        q: '生成AI開発の相談時に、費用感を出してもらうには何が必要ですか？',
        a: '最低限、対象業務、利用者数、入力データの種類、既存システム連携の有無、セキュリティ制約、PoCか本番かを伝える必要があります。RFP、As-Is、議事録があれば、PM on Railsでユースケースと受入条件に分解できるため、概算費用の前提を早く揃えられます。',
      },
      {
        q: 'AI開発はPoCだけなら安くできますか？',
        a: 'できます。ただし、安いPoCほど「本番で何が足りないか」を明確にしておく必要があります。認証、権限管理、監査ログ、文書更新、月額費用の監視、誤回答時の運用が入っていないPoCは、社内説明には使えてもそのまま本番化できません。',
      },
      {
        q: 'RAG開発とAIチャットボット開発は費用項目が違いますか？',
        a: '重なる部分はありますが、RAG開発では文書取り込み、チャンキング、検索精度評価、根拠提示、権限管理が重要になります。AIチャットボットは会話設計、有人引き継ぎ、FAQ改善、ログ分析の比重が高くなります。どちらも「画面を作る費用」より、業務で使える回答にするための設計・評価が費用を左右します。',
      },
      {
        q: '見積もりが高いか安いか、発注前に判断できますか？',
        a: '判断できます。PM on RailsでRFPやAs-Isをユースケースに分解すると、見積書の要件整理、データ整備、AI検索・回答、画面、連携、テスト、運用のどこに費用が乗っているかを見やすくなります。総額だけで比べると、安い提案ほど評価や運用が抜けていることがあります。',
      },
    ],
  },
  {
    slug: 'what-is-rag',
    introHeading: 'RAG導入前によくある質問',
    faqs: [
      {
        q: '社内文書検索AIを作るなら、必ずRAGが必要ですか？',
        a: '必ずではありません。FAQが少なく定型質問だけなら、まずFAQ整備や通常検索で足りる場合があります。RAGが向いているのは、文書量が多い、表現ゆれがある、回答に根拠を出したい、複数資料を横断して答えたいケースです。最初に想定質問を分類して、RAGで解くべき範囲を見極めるのが重要です。',
      },
      {
        q: 'RAGを導入すればハルシネーションはなくなりますか？',
        a: 'ゼロにはなりません。RAGは根拠文書を検索して回答に渡すため、ハルシネーションを減らす有効な方法ですが、検索で間違った文書を拾う、根拠外の推測をする、古い文書を参照するリスクは残ります。回答根拠の表示、根拠外を答えないプロンプト、評価データによる検証が必要です。',
      },
      {
        q: 'RAGとGraphRAGはどう使い分ければよいですか？',
        a: '一つの文書やFAQから答えが見つかる質問は通常RAGで十分なことが多いです。GraphRAGが向くのは、案件、製品、部署、手順、過去対応などの関係をたどる必要がある質問です。たとえば「この障害に関連する過去対応は何か」「この規程変更の影響範囲はどこか」のような問いは、関係を整理した方が答えやすくなります。',
      },
      {
        q: 'RAG導入で最初に決めるべきことは何ですか？',
        a: '最初に決めるべきなのは、対象文書ではなく想定質問です。RFPやAs-IsをPM on Railsでユースケース化し、誰が何を聞き、回答を見てどんな判断をするのかを決めると、必要な文書、メタデータ、権限、評価基準が見えてきます。文書を全部入れてから考える進め方は、検索ノイズと運用負荷が増えやすくなります。',
      },
    ],
  },
];

function buildFaqHtml(introHeading, faqs) {
  const lines = [SENTINEL, `<h2>${introHeading}</h2>`];
  for (const { q, a } of faqs) {
    lines.push(`<h2>Q. ${q}</h2>`);
    lines.push(`<p>A. ${a}</p>`);
  }
  return `\n${lines.join('\n')}\n`;
}

function hasPatchedFaq(html, introHeading) {
  const escaped = introHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.includes(SENTINEL) || new RegExp(`<h2[^>]*>${escaped}<\\/h2>`).test(html);
}

function insertBeforeFinalCta(content, block) {
  const ctaRegex = /<p>\s*\{\{[A-Z0-9_]*(?:CTA|CONSULT)[A-Z0-9_]*\}\}\s*<\/p>/g;
  const matches = [...content.matchAll(ctaRegex)];
  if (matches.length === 0) return `${content}${block}`;
  const last = matches[matches.length - 1];
  return `${content.slice(0, last.index)}${block}\n${content.slice(last.index)}`;
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
    console.error(`  ERROR fetch failed: ${err.message}`);
    return { slug, status: 'fetch_failed' };
  }

  if (column.id !== slug) {
    console.error(`  STOP id mismatch expected=${slug} actual=${column.id}`);
    return { slug, status: 'id_mismatch' };
  }

  if (hasPatchedFaq(column.content, introHeading)) {
    console.log('  SKIP already patched');
    return { slug, status: 'skipped_already_patched' };
  }

  const block = buildFaqHtml(introHeading, faqs);
  const newContent = insertBeforeFinalCta(column.content, block);
  console.log(`  TITLE ${column.title}`);
  console.log(`  ADD ${faqs.length} FAQs (${column.content.length} -> ${newContent.length})`);
  console.log('  PREVIEW');
  console.log(block.slice(0, 700));
  if (block.length > 700) console.log('  ...');

  if (!APPLY) return { slug, status: 'dry_run' };

  mkdirSync(BACKUP_DIR, { recursive: true });
  writeFileSync(join(BACKUP_DIR, `${slug}.html`), column.content);

  try {
    await client.update({ endpoint: 'columns', contentId: slug, content: { content: newContent } });
  } catch (err) {
    console.error(`  PATCH failed: ${err.message}`);
    return { slug, status: 'patch_failed' };
  }

  const verify = await client.get({
    endpoint: 'columns',
    contentId: slug,
    queries: { fields: 'id,content' },
  });
  const ok = hasPatchedFaq(verify.content, introHeading);
  console.log(`  VERIFY ${ok ? 'OK' : 'NG'}`);
  return { slug, status: ok ? 'applied' : 'applied_but_verify_failed' };
}

const results = [];
for (const patch of FAQ_PATCHES) {
  results.push(await processOne(patch));
}

console.log(`\n========== Summary (${APPLY ? 'APPLIED' : 'DRY-RUN'}) ==========`);
for (const r of results) console.log(`  ${r.slug.padEnd(42)} ${r.status}`);
