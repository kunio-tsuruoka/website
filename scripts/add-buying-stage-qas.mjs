// tasks-v3 TASK-P1-03: 購買を止める疑問に答えるQ&Aを /qa (MicroCMS qas) へ追加する。
// order=0 で各カテゴリの先頭に出す。既定 dry-run、--apply で投入。冪等（同一質問はスキップ）。
// usage: node --env-file=.env scripts/add-buying-stage-qas.mjs [--apply]
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const QAS = [
  {
    category: 'poc-ai-dx',
    question: '検証用プロトタイプ・PoC・MVPはどう違いますか？',
    answer:
      '<p>検証用プロトタイプは、コア機能に絞って仮説を確かめるための試作で、Beekleのゼロスタートでは初期費用0円で作成します。PoCは有料で、実際の業務データや利用者で「業務として成立するか」を検証する工程です（最短2週間が目安）。MVPは、検証を通った価値だけを必要最小限の機能で製品化したものです。</p><p>「課題・アイデア→検証用プロトタイプ→PoC→MVP→本開発」の順に進み、各段階の区切りで先へ進むかを判断できます。どこから始めるべきかも含めてご相談いただけます。</p>',
  },
  {
    category: 'poc-ai-dx',
    question: 'ゼロスタートで検証した結果、本開発に進まない（No-Go）場合はどうなりますか？',
    answer:
      '<p>費用は発生しません。ゼロスタートは本開発前にGo / No-Goを判断するための仕組みなので、見送りという判断も想定内です。検証で確認できたこと（業務に合うか、要件のズレ、データの過不足）は整理してお渡しするため、今後の判断材料として使えます。</p><p>なお、検証用プロトタイプは、お客様からご提供いただいたデータ・著作物を除き、汎用的に作成した部分を当社で再利用する場合があります（秘密保持契約を締結している場合はその内容を優先します）。</p>',
  },
  {
    category: 'requirements',
    question: '要件が固まっていなくても相談できますか？',
    answer:
      '<p>はい、歓迎します。Beekleは要望をそのまま作り始めるのではなく、業務と課題のヒアリングから「何を検証すべきか」を一緒に決めるところから始めます。要求の整理はユーザーストーリー・受入条件・開発タスクへの構造化まで含めて支援するので、「作りたいものがまだ言葉になっていない」段階のご相談で問題ありません。</p><p>お問い合わせフォームの「現在の検討状況」で「課題を整理している」を選んでいただければ、初回から整理の進め方に合わせてご案内します。</p>',
  },
  {
    category: 'estimate',
    question: '見積もりは何で変わりますか？',
    answer:
      '<p>大きくは3つです。(1) 何を作るか（Webシステム／生成AI／データ基盤などの種別と機能範囲）、(2) どの段階か（検証用プロトタイプ／PoC／MVP／本開発）、(3) 条件（扱うデータの量と種類、既存システムとの連携先、セキュリティ・品質要件）。</p><p>同じ「AIチャットボット」でも、対象文書の量や有人引き継ぎの要否で費用は変わります。だからBeekleは、動く実物を先に作って範囲を確定させてから見積もる進め方を取っています。</p>',
  },
  {
    category: 'estimate',
    question: '本開発の費用はいつ分かりますか？',
    answer:
      '<p>初回ヒアリングの段階では、種別と段階ごとの考え方と概算レンジをお伝えします。確度の高い見積もりは、検証用プロトタイプまたはPoCで動く実物と要件を確定させた後に、内訳付きでご提示します。</p><p>実物と検証結果を踏まえた見積もりのため、「作り始めてから金額が膨らむ」形になりにくいのがこの進め方の利点です。</p>',
  },
  {
    category: 'vendor-contract',
    question: '検証で渡すデータや機密情報はどう扱われますか？',
    answer:
      '<p>NDA（秘密保持契約）を締結したうえでプロジェクトを進めます。実データを出しにくい場合は、サンプルデータや匿名化したデータでの検証も可能です。</p><p>ご提供いただくデータ・著作物の利用権はお客様側で確保いただく前提としており、第三者の著作物やデータを使う場合は、利用許諾の範囲を事前にご確認をお願いしています。</p>',
  },
  {
    category: 'vendor-contract',
    question: '他社で途中まで作った案件を引き継げますか？',
    answer:
      '<p>可能です。実際に、他社で約3ヶ月停滞した開発を引き継ぎ、バックエンド・フロントエンド・インフラまで一貫して3週間で完成させた実績があります。</p><p>引き継ぎでは、まず現状のコード・資料・残っている課題を確認し、「そのまま直すか」「作り直す範囲をどこで切るか」を判断材料つきでご提案します。前のベンダーへの言及や責任の切り分けが必要な場合も、事実の整理からお手伝いします。</p>',
  },
  {
    category: 'vendor-contract',
    question: '複数社を比較している段階でも相談できますか？',
    answer:
      '<p>もちろんです。比較段階のご相談を歓迎します。Beekleの場合、提案書だけでなく動く検証用プロトタイプ（初期費用0円）で判断材料を出せるので、他社比較の物差しとしても使いやすいはずです。</p><p>お問い合わせフォームの「現在の検討状況」で「複数社を比較している」を選んでいただければ、比較検討に必要な情報（進め方・体制・見積もりの考え方）を先回りしてご用意します。</p>',
  },
];

const main = async () => {
  // 既存の全質問を取得して重複チェック
  let all = [];
  let offset = 0;
  while (true) {
    const r = await client.get({
      endpoint: 'qas',
      queries: { limit: 100, offset, fields: 'id,question' },
    });
    all = all.concat(r.contents);
    offset += 100;
    if (all.length >= r.totalCount) break;
  }
  const existing = new Set(all.map((q) => q.question));

  for (const qa of QAS) {
    if (existing.has(qa.question)) {
      console.log(`[skip] 既存: ${qa.question}`);
      continue;
    }
    if (!apply) {
      console.log(`[dry] create (${qa.category}, order=0): ${qa.question}`);
      continue;
    }
    await client.create({
      endpoint: 'qas',
      content: { question: qa.question, answer: qa.answer, category: qa.category, order: 0 },
    });
    console.log(`[created] ${qa.question}`);
  }
  console.log(apply ? 'done (applied)' : 'dry-run done. --apply で投入');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
