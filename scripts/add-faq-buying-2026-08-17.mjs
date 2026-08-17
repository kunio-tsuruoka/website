// ユーザー提供のFAQ 20問（比較・発注前/セキュリティ/保守/PM on Rails/Beekleについて）を /qa へ投入する。
// - 既存の同トピック3問（2026-08-17に投入済み）はユーザー版で上書き更新
// - PM on Rails 用のカテゴリを新設（order=7）
// - 既定 dry-run、--apply で反映。冪等（同一質問はスキップ/更新）
// usage: node --env-file=.env scripts/add-faq-buying-2026-08-17.mjs [--apply]
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const NEW_CATEGORY = {
  id: 'pm-on-rails',
  title: 'PM on Rails・AI駆動開発',
  order: 7,
  description:
    'Beekleが自社開発した開発基盤「PM on Rails」と、AIを使った開発の品質・期間・仕様変更・引き継ぎについて。',
};

// 既存質問（今日投入分）→ ユーザー版で置き換えるマッピング
const REPLACES = [
  { oldQuestion: '要件が固まっていなくても相談できますか？', newKey: 'q1' },
  { oldQuestion: '見積もりは何で変わりますか？', newKey: 'q4' },
  { oldQuestion: '検証で渡すデータや機密情報はどう扱われますか？', newKey: 'q10' },
];

const QAS = {
  q1: {
    category: 'requirements',
    question: 'まだ要件や「何を作るべきか」が決まっていなくても相談できますか？',
    answer:
      '<p>はい。「AIを使いたい」「この業務を効率化したい」と思っていても、何をシステム化すればよいのか分からないケースは珍しくありません。</p><p>Beekleでは、いきなり機能の話から始めるのではなく、次の点から整理します。</p><ul><li>現在どんな業務をしているか</li><li>どこで時間やコストが発生しているか</li><li>誰が困っているか</li><li>何が変われば成功なのか</li></ul><p>その結果、<strong>曖昧だった構想が「何を作れば、何が改善するのか」まで具体化された状態</strong>で開発判断ができるようになります。最初から完成した仕様書をご用意いただく必要はありません。</p>',
  },
  q2: {
    category: 'poc-ai-dx',
    question: '最初から大規模な開発を発注する必要がありますか？',
    answer:
      '<p>いいえ。一番避けたいのは、大きな予算を投入した後に「思っていたものと違った」と分かることです。そのため案件に応じて、段階的な進め方を取ります。</p><ul><li><strong>Prototype</strong>：利用イメージを確認</li><li><strong>PoC</strong>：技術的に成立するか確認</li><li><strong>MVP</strong>：最低限の機能で実際の価値を確認</li><li><strong>本開発</strong>：確認できたものへ本格投資</li></ul><p>目指すのは、<strong>最初から大きく賭けなくても、実物と結果を見ながら安心して次の投資判断ができる状態</strong>です。</p>',
  },
  q3: {
    category: 'poc-ai-dx',
    question: '本開発を決める前に、実際に動くものを見ることはできますか？',
    answer:
      '<p>案件によって可能です。仕様書や提案書だけでは、「本当に使いやすいのか」「現場に合うのか」までは分かりません。そこで、先に動くプロトタイプやPoCを作り、次の点を確認します。</p><ul><li>実際の操作感</li><li>業務との相性</li><li>AI・OCR等の精度</li><li>必要な機能・不要な機能</li></ul><p><strong>完成するまで正解か分からない開発から、途中で正解を確認しながら進める開発へ変えること</strong>が目的です。</p>',
  },
  q4: {
    category: 'estimate',
    question: '開発費はいくらくらいかかりますか？',
    answer:
      '<p>開発内容によって異なります。費用は画面数だけでなく、外部システム連携、データ構造、AI・OCR、権限、セキュリティ、インフラ、データ移行、デザイン、運用要件などによって大きく変わります。</p><p>そのため、根拠の薄い金額を先に提示するのではなく、必要な内容を確認して概算をご案内します。予算と開発範囲に差がある場合も、<strong>「無理です」で終わらせず、どこまでなら投資対効果の合う形で実現できるか</strong>を一緒に考えます。</p>',
  },
  q5: {
    category: 'estimate',
    question: '予算が限られていても相談できますか？',
    answer:
      '<p>はい。予算が限られている場合に、同じものを無理に安く作ると品質や将来の保守性にしわ寄せが出ます。そのため、スコープそのものを設計します。</p><ul><li>今は不要な機能を後回しにする</li><li>既存サービスで代替する</li><li>高度な機能を簡易版から始める</li><li>フェーズを分ける</li><li>最重要業務だけ先にシステム化する</li></ul><p>結果として、<strong>限られた予算を「なくても困らない機能」ではなく、本当に解決したい課題へ集中できます。</strong></p>',
  },
  q6: {
    category: 'estimate',
    question: '他社より見積金額が高い場合、何を比較すればよいですか？',
    answer:
      '<p>総額だけではなく、「その金額でどこまで問題を解決できるのか」を比較することをおすすめします。同じシステム開発でも、要件整理、UI/UX、PM、インフラ、セキュリティ、テスト、データ移行、リリース、保守、仕様変更対応のどこまで含むかは会社によって異なります。</p><p>Beekleでは必要に応じてフル構成とMVP構成などを分け、<strong>何に費用がかかっているか、何を削るとどう変わるか、どこは削るべきではないか</strong>までご説明します。安さだけでなく、<strong>完成後に使えること、手戻りを減らすこと、長く運用できることまで含めて比較できる状態</strong>を作ります。</p>',
  },
  q7: {
    category: 'vendor-contract',
    question: '請負契約と準委任契約のどちらになりますか？',
    answer:
      '<p>案件に合った方式を選びます。完成条件が明確な案件は請負が適していることがあります。一方、次のような場合は準委任型が適することがあります。</p><ul><li>要件が変わりそう</li><li>実際に使いながら改善したい</li><li>AIなど事前に完全な結果を約束できない</li><li>優先順位を変更しながら進めたい</li></ul><p>また、要件整理・検証は準委任、仕様確定後の本開発は請負のように、フェーズで契約方式を変えることもできます。特定の開発方式へ顧客を合わせるのではなく、<strong>顧客の予算・不確実性・社内事情に開発方式を合わせます。</strong></p>',
  },
  q8: {
    category: 'project-management',
    question: '開発途中で仕様が変わっても大丈夫ですか？',
    answer:
      '<p>はい。むしろ、実際にシステムを見て初めて分かることがあるのが開発です。変更時には、次の点を整理します。</p><ul><li>元々の仕様の修正か、新しい要求なのか</li><li>どこまで影響するのか</li><li>費用や納期への影響はあるのか</li></ul><p>さらにBeekleではPM on Railsを活用し、要件・設計・実装・テストの関係を追えるようにすることで、変更の影響範囲を確認しやすくしています。<strong>仕様変更そのものを恐れるのではなく、変更してもプロジェクトが壊れにくい状態を作る</strong>ことを重視しています。</p>',
  },
  q9: {
    category: 'project-management',
    question: '社内稟議や経営層への説明も支援してもらえますか？',
    answer:
      '<p>はい。担当者がシステムの必要性を理解していても、「なぜ今やるのか」「いくらかかるのか」「どんな効果があるのか」を説明できず、社内承認で止まるケースがあります。</p><p>必要に応じて、現状コスト、投資額、削減効果、売上への効果、回収期間、スモールスタート案、リスクを整理します。<strong>担当者だけで社内を説得するのではなく、意思決定者が判断しやすい材料まで一緒に作る</strong>という考え方です。</p>',
  },
  q10: {
    category: 'vendor-contract',
    question: '機密情報や実データを使った検証もできますか？',
    answer:
      '<p>はい。AIやOCRなどは、実際のデータで試さなければ本当に使えるか分からないことがあります。必要に応じてNDAを締結し、サンプル提供→PoC→精度確認→本番判断という形で進めます。</p><p>扱う情報の機密性に応じて、環境やデータの取り扱い方法も調整します。<strong>機密性を理由に検証できない状態ではなく、安全性を確保しながら現実的なデータで判断できる状態</strong>を目指します。</p>',
  },
  q11: {
    category: 'vendor-contract',
    question: 'セキュリティ要件の高いシステムにも対応できますか？',
    answer:
      '<p>はい。企業によってセキュリティポリシーや扱う情報は異なるため、すべての案件を同じ構成にはしません。Beekleでは、閉域環境、アクセス制御、ソースコード管理、本番アクセス制限、個人情報・機密情報の扱い、AIサービスへのデータ送信可否、脆弱性診断、ログ・監査など、必要な要件に応じて設計します。</p><p>ISO/IEC 27001やPマークの認証自体は現在取得していませんが、<strong>ISO/IEC 27001レベルのセキュリティ要件が求められるシステムや、閉域環境での開発実績があります。</strong>また、大手企業のセキュリティチェックを初回で通過した実績もあります。</p><p>「この構成しかできない」のではなく、<strong>顧客のセキュリティ要件に合わせて、必要な環境を作れること</strong>がBeekleの考え方です。</p>',
  },
  q12: {
    category: 'project-management',
    question: '開発後も保守・改善をお願いできますか？',
    answer:
      '<p>はい。システムは納品した瞬間がゴールではありません。実際に使い始めることで、もっと効率化できる箇所、利用者が迷う箇所、新しく自動化できる業務、追加した方がよい機能が見えてきます。</p><p>Beekleでは保守だけでなく、追加開発や継続改善にも対応します。<strong>「納品されたシステムを維持する」だけではなく、使いながらより価値の高いシステムへ育てていくこと</strong>ができます。</p>',
  },
  q13: {
    category: 'project-management',
    question: '保守・運用だけでも依頼できますか？',
    answer:
      '<p>はい。新規開発をBeekleへ依頼していないシステムについても、ご相談いただけます。現在、月額<strong>5万円・10万円・15万円</strong>の保守プランを用意しています。システム規模や対応内容、必要なサポート量を確認して適したプランをご案内します。</p><p>「何かあったときに誰に聞けばいいのか分からない」という状態をなくし、<strong>システムを安心して使い続けられる状態</strong>を作ります。</p>',
  },
  q14: {
    category: 'pm-on-rails',
    question: 'PM on Railsとは何ですか？',
    answer:
      '<p>PM on Railsは、Beekleが自社開発し、実際の開発案件で使っている開発基盤です。</p><p>AIでコードを書く速度は大きく上がりました。しかし、要件が曖昧なままAIへ渡せば、<strong>間違ったものを高速に作ってしまいます。</strong></p><p>そこでPM on Railsでは、要求→Use Case→Gherkin Scenario→Acceptance Criteria→設計→AI実装→テストまでを一つにつなぎます。単なるプロジェクト管理ツールではなく、<strong>「何を作るか」を正確にしてから、AIで速く作るための開発基盤</strong>です。</p>',
  },
  q15: {
    category: 'pm-on-rails',
    question: 'PM on Railsを使うと、発注側にはどんなメリットがありますか？',
    answer:
      '<p>システム開発で本当に怖いのは、開発会社がコードを書くのが遅いことだけではありません。もっと大きな問題は、要件が正しく伝わっていない、必要なケースが抜けている、設計に矛盾がある、テストされていない条件がある、完成後に「思っていたものと違う」と分かる、修正のために納期と費用が膨らむことです。</p><p>PM on Railsは、この<strong>「後から分かる」をできるだけ前に持ってくる</strong>ための仕組みです。要求を具体的なGherkinシナリオと受入基準まで分解し、AIで正常系だけでなく、異常系・境界値・権限不足・エラーケースなども深掘りします。さらに、DB・API・権限・状態遷移・エラー処理などを実装前にレビューし、シナリオとテストをつなげます。</p><p>その結果、次の状態を作れます。</p><ul><li>要件が早く具体化する</li><li>抜け漏れを実装前に発見しやすい</li><li>設計ミスを早い段階で見つけられる</li><li>AIが迷わず実装しやすくなる</li><li>テスト漏れを減らせる</li><li>後工程の作り直しを減らせる</li></ul><p>発注側にとってのゴールは、PM on Railsを使うことではありません。<strong>「ちゃんと意図が伝わっているだろうか」と不安になりながら完成を待つのではなく、途中から正しい方向へ進んでいることを確認でき、より短い期間で安心して欲しいシステムを受け取れること</strong>です。</p><p>Beekle社内では、従来開発との比較で<strong>開発速度約3倍、要件・シナリオの抜け漏れ約30%削減、品質約30%向上</strong>という暫定評価もあります。</p><p>※Beekle社内での従来開発との比較に基づく暫定的な体感・評価値です。案件規模・要件・チーム構成・技術条件によって効果は異なります。</p>',
  },
  q16: {
    category: 'pm-on-rails',
    question: 'AIを使った高速開発だと、品質が落ちませんか？',
    answer:
      '<p>「AIを使う＝品質が上がる」わけではありません。むしろ、曖昧な指示をAIへ渡せば、間違った実装まで高速化されます。</p><p>BeekleではPM on Railsで、シナリオ、受入基準、DB、API、権限、エラーケース、非機能要件、テストまで具体化してからAIへ渡します。</p><p>つまり「AIだから速い」ではなく、<strong>AIが正しく作りやすい状態を先に作るから、速さと品質を両立しやすい</strong>という考え方です。</p>',
  },
  q17: {
    category: 'pm-on-rails',
    question: 'なぜPM on Railsを使うと開発期間を短縮できるのですか？',
    answer:
      '<p>開発期間は、コーディング時間だけではありません。要件定義＋設計＋実装＋レビュー＋テスト＋手戻りの合計です。</p><p>PM on Railsでは、次の方法でそれぞれの工程を短縮します。</p><ul><li>AIでシナリオを生成・深掘りする</li><li>受入基準を具体化する</li><li>設計をまとめてレビューする</li><li>構造化された仕様をAIへ渡す</li><li>シナリオとテストを接続する</li><li>問題を実装後ではなく前工程で見つける</li></ul><p>だから、<strong>コードを書く部分だけではなく、開発全体を速くする</strong>ことができます。PM on Railsを利用した実案件では、要件整理から動くデモまで1日で到達したケースもあります。</p><p>※案件規模・条件が限定された実例であり、すべての案件が1日で完成することを意味するものではありません。</p>',
  },
  q18: {
    category: 'pm-on-rails',
    question: '仕様変更があった場合にもPM on Railsは役立ちますか？',
    answer:
      '<p>はい。仕様変更で怖いのは、変更した箇所以外への影響を見落とすことです。</p><p>PM on Railsでは、要求→シナリオ→受入基準→設計→実装→テストの関係を保持します。そのため変更時に、関連する仕様・設計・テストを追いやすくなります。</p><p>結果として、<strong>変更するたびに別の場所が壊れる、昔の判断理由が分からない、といった不安を減らしながら改善を続けられます。</strong></p>',
  },
  q19: {
    category: 'pm-on-rails',
    question: '担当者が変わってもプロジェクトを引き継げますか？',
    answer:
      '<p>PM on Railsでは、重要な情報を特定のPMやエンジニアの頭の中だけに残さないことを重視しています。要件、設計、判断履歴、変更理由、テストなどをプロジェクトの資産として残します。</p><p>そのため担当変更や長期開発でも、<strong>「なぜこうなっているのか分からない」</strong>状態を減らせます。将来的な改修や保守まで考えると、コードだけでなく<strong>開発時の判断そのものが残っていること</strong>が大きな価値になります。</p>',
  },
  q20: {
    category: 'vendor-contract',
    question: 'Beekleと一般的なシステム開発会社の違いは何ですか？',
    answer:
      '<p>Beekleが目指しているのは、単に「依頼されたシステムを納品する会社」ではありません。顧客が本当に欲しいのはシステムそのものではなく、業務が楽になること、売上が増えること、属人化が減ること、新しい事業を始められること、安心して業務を任せられること、といったその先の変化だからです。</p><p>そのため、業務理解→課題整理→要件定義→Prototype / PoC→投資判断→本開発→運用・改善まで一貫して考えます。さらにPM on Railsによって、要件定義・設計レビュー・AI実装・テストをつなぎ、実装速度だけでなく手戻りまで含めて開発全体を高速化します。</p><p>技術や契約方式も固定しません。顧客が求める目的・予算・セキュリティ・環境に合わせて最適な方法を選びます。<strong>「何を作るか分からない」から始まっても、最終的に「これなら投資してよかった」と思える状態まで一緒に作る。</strong>それがBeekleの開発スタンスです。</p>',
  },
};

// pm-on-rails カテゴリ内の表示順（Q14→Q19）
const PMOR_ORDER = { q14: 1, q15: 2, q16: 3, q17: 4, q18: 5, q19: 6 };

const main = async () => {
  // カテゴリ新設
  let hasCategory = true;
  try {
    await client.get({ endpoint: 'qa-categories', contentId: NEW_CATEGORY.id });
  } catch {
    hasCategory = false;
  }
  if (!hasCategory) {
    if (apply) {
      await client.create({
        endpoint: 'qa-categories',
        contentId: NEW_CATEGORY.id,
        content: {
          title: NEW_CATEGORY.title,
          order: NEW_CATEGORY.order,
          description: NEW_CATEGORY.description,
        },
      });
      console.log(`[created category] ${NEW_CATEGORY.id}`);
    } else {
      console.log(`[dry] create category ${NEW_CATEGORY.id}`);
    }
  } else {
    console.log(`[skip] category ${NEW_CATEGORY.id} exists`);
  }

  // 既存全質問を取得
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
  const byQuestion = new Map(all.map((q) => [q.question, q.id]));

  const replacedKeys = new Set();
  // 1) 既存の同トピック3問を更新
  for (const rep of REPLACES) {
    const id = byQuestion.get(rep.oldQuestion);
    const qa = QAS[rep.newKey];
    if (!id) {
      console.log(`[warn] 更新対象が見つからない: ${rep.oldQuestion} → 新規作成に回す`);
      continue;
    }
    replacedKeys.add(rep.newKey);
    if (apply) {
      await client.update({
        endpoint: 'qas',
        contentId: id,
        content: { question: qa.question, answer: qa.answer, category: qa.category },
      });
      console.log(`[updated] ${rep.oldQuestion} → ${qa.question}`);
    } else {
      console.log(`[dry] update ${id}: ${rep.oldQuestion} → ${qa.question}`);
    }
  }

  // 2) 残りを新規作成（doc順で作成し、同orderタイはpublishedAt順で並ぶ）
  for (const [key, qa] of Object.entries(QAS)) {
    if (replacedKeys.has(key)) continue;
    if (byQuestion.has(qa.question)) {
      console.log(`[skip] 既存: ${qa.question}`);
      continue;
    }
    const order = PMOR_ORDER[key] ?? 0;
    if (apply) {
      await client.create({
        endpoint: 'qas',
        content: { question: qa.question, answer: qa.answer, category: qa.category, order },
      });
      console.log(`[created] (${qa.category}, order=${order}) ${qa.question}`);
    } else {
      console.log(`[dry] create (${qa.category}, order=${order}) ${qa.question}`);
    }
  }
  console.log(apply ? 'done (applied)' : 'dry-run done. --apply で反映');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
