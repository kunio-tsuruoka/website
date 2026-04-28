/**
 * 既存ピラー記事3本に「FAQセクション」と「関連記事リンクブロック」を末尾に追加する
 *
 * 対象:
 *   - project-management-complete-guide
 *   - avoid-unused-system
 *   - estimate-complete-guide
 *
 * 使い方:
 *   node scripts/enhance-pillars.mjs --dry    # プレビュー（デフォルト）
 *   node scripts/enhance-pillars.mjs --apply  # MicroCMSに反映（公開記事を直接更新）
 *
 * 安全装置:
 *   - 既定で dry-run（--apply 指定時のみ更新）
 *   - 既にFAQセクションが含まれている場合はスキップ
 *   - 各記事ごとに「追加内容のHTMLプレビュー」を表示
 */
import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const dryRun = !apply;

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/**
 * 各ピラーに追加するFAQと関連記事
 * FAQ構造: <h2>FAQ見出し</h2><h2>Q1. 質問</h2><p>A. 回答</p> 形式
 * （[...slug].astro の faqPatterns 正規表現にマッチさせるため）
 */
const enhancements = [
  {
    id: 'project-management-complete-guide',
    /** マーカー: 既に追加済みかを判定する一意な文字列 */
    sentinel: 'enhance-pillar-faq-pm',
    faqs: [
      {
        q: 'プロジェクトマネジメントとプロジェクト管理は同じですか？',
        a: 'ほぼ同じ意味で使われますが、厳密には「プロジェクト管理」が進捗・コスト・品質などの個別管理を指すのに対し、「プロジェクトマネジメント」はそれらを統合してプロジェクト全体を成功に導く活動全般を指します。本記事では総称として「プロジェクトマネジメント」を使っています。',
      },
      {
        q: 'PMBOKとアジャイルはどちらを学ぶべきですか？',
        a: 'まずPMBOKで体系的な知識（スコープ・スケジュール・コスト・品質・リスクなど）を学び、その上で実プロジェクトに合わせてアジャイル/スクラムの実践手法を取り入れるのが王道です。PMBOK第7版以降はアジャイル要素も統合されています。',
      },
      {
        q: 'プロジェクトマネージャーに必要なスキルは何ですか？',
        a: '大きく3つです。1) 計画・見積もり・進捗管理などの管理スキル、2) ステークホルダー間の合意形成・交渉などの対人スキル、3) システム開発の基本的な技術理解。技術理解は深い実装スキルではなく、見積もりやリスク判断ができる程度で十分です。',
      },
      {
        q: '進捗が遅れていることはどうやって早く検知できますか？',
        a: '計画時に「中間マイルストーン」を週次〜隔週で置き、各時点で「完了したタスク・着手中のタスク・未着手のタスク」を見える化します。完了の定義（Definition of Done）を事前に揃えておくことで、「8割できた」のような曖昧な進捗報告を防げます。',
      },
      {
        q: '炎上プロジェクトを引き継いだらまず何をすべきですか？',
        a: '1) 残スコープと残工数を再見積もりし、現実的な再計画を立てる、2) ステークホルダーに正直に状況を共有して期待値を再調整する、3) クリティカルパス上の課題から1つずつ解決する、の順です。希望的観測で続行するほど傷が深くなります。',
      },
    ],
    related: [
      { url: '/column/project-management-steps', label: 'プロジェクト管理の進め方ステップ' },
      { url: '/column/progress-check-points', label: '進捗管理のチェックポイント' },
      { url: '/column/communication-complete-guide', label: 'コミュニケーション完全ガイド' },
      { url: '/column/common-mistakes', label: 'プロジェクトでよくある失敗' },
      { url: '/column/avoid-unused-system', label: '使われないシステムを作らない方法' },
      { url: '/tools/scope-manager', label: '【無料ツール】Scope Manager（FM法）' },
    ],
  },
  {
    id: 'avoid-unused-system',
    sentinel: 'enhance-pillar-faq-unused',
    faqs: [
      {
        q: '使われないシステムが生まれる最大の原因は何ですか？',
        a: '「現場のヒアリング不足」と「ステークホルダー間の利害衝突を放置すること」の2つです。現場が日々どんな作業をしているか、なぜ既存ツールでは不足なのかを掘り下げないまま、経営層や情シスの想定だけで作ると、現場が新システムを使わずに従来手順に戻ってしまいます。',
      },
      {
        q: 'ローンチ後に使われていないことに気づいたらどうすべきですか？',
        a: 'まず利用率（DAU/MAU、機能別利用率）を計測し、どの機能が・どの部署で・なぜ使われていないかを切り分けます。その上で、機能の問題なら改修、運用の問題なら業務プロセス変更や研修、根本的なミスマッチなら段階的な廃止を検討します。「使われていない事実」をオープンにすることが第一歩です。',
      },
      {
        q: 'PoC（概念実証）と本番システムでは何が違いますか？',
        a: 'PoCは「アイデアが技術的に成立するか」「ユーザーが本当に使うか」の検証が目的なので、品質・セキュリティ・運用性は最低限で構いません。本番システムはこれに加えて、安定運用・セキュリティ・性能・可用性が必須要件になります。PoCのコードをそのまま本番化しようとして破綻するのは典型的な失敗です。',
      },
      {
        q: '要件を絞り込むと、ステークホルダーから「機能不足」と言われませんか？',
        a: 'スコープ管理（FM法）のように、3軸の客観評価で絞り込んだ根拠を示すと納得を得やすくなります。「ビジネス価値は高いが、現場で使う体制がないので今回は外す」と説明できれば、ステークホルダーも代替案（運用整備、研修）を検討するようになります。',
      },
    ],
    related: [
      { url: '/column/prevent-mismatch', label: '認識齟齬を防ぐコツ' },
      { url: '/column/common-mistakes', label: 'プロジェクトでよくある失敗' },
      { url: '/column/project-management-complete-guide', label: 'プロジェクトマネジメント完全ガイド' },
      { url: '/tools/scope-manager', label: '【無料ツール】Scope Manager（FM法）' },
      { url: '/tools/story-builder', label: '【無料ツール】Story Builder（ユーザーストーリー）' },
    ],
  },
  {
    id: 'estimate-complete-guide',
    sentinel: 'enhance-pillar-faq-estimate',
    faqs: [
      {
        q: 'システム開発の見積もりが大きく違うのはなぜですか？',
        a: '主な要因は3つです。1) 要件解釈の幅（同じ依頼でも各社が想定する機能範囲が違う）、2) 体制の違い（PM配置、レビュー体制、品質管理プロセス）、3) 単価の違い（経験年数・技術スタックの希少性）。総額だけでなく内訳と体制を比較することが重要です。',
      },
      {
        q: '見積もりが安すぎる業者は避けるべきですか？',
        a: '一律にNGではなく、安さの理由を確認してから判断します。要件定義・設計・テスト工数が極端に薄い、PM費が0円、保守運用が見えていない、という見積もりは要注意です。一方で、自動化やテンプレート化で本質的に効率化している業者は、安くても健全です。',
      },
      {
        q: '相場は人月単価で決まりますか？',
        a: '人月単価（60〜150万円が業界レンジ）はあくまで指標で、実際の妥当性は工数の根拠とアウトプットで判断します。同じ単価でも、要件定義から設計まで丁寧に進める体制と、実装だけ請け負う体制では成果物の質が大きく異なります。',
      },
      {
        q: '予算オーバーを防ぐ最大のコツは何ですか？',
        a: '要件に優先順位をつけ、追加要望に対しては「追加」ではなく「入れ替え」で対応する管理が重要です。スコープ管理（FM法）で機能を3軸評価し、何を作らないかを最初に決めておくと、後の追加要望にも交渉余地が残ります。',
      },
      {
        q: 'ゼロスタートとは何ですか？',
        a: 'Beekleが提供する初期費用0円のプロトタイプ開発サービスです。動くプロトタイプで仮説を検証してから本格開発の判断ができるため、見積もりだけで投資判断するリスクを避けられます。詳しくは /prooffirst をご覧ください。',
      },
    ],
    related: [
      { url: '/column/system-development-cost-market', label: 'システム開発の費用相場' },
      { url: '/column/system-development-budget-control', label: 'システム開発の予算管理術' },
      { url: '/column/system-development-cost-breakdown', label: 'システム開発費用の内訳完全ガイド' },
      { url: '/column/web-system-cost-by-scale', label: 'Webシステム開発費用の規模別レンジ' },
      { url: '/column/quote-comparison-checklist', label: '見積もり比較チェックリスト' },
    ],
  },
];

function buildAppendHtml(item) {
  const faqHtml = item.faqs
    .map((f, i) => `<h2>Q${i + 1}. ${f.q}</h2><p>A. ${f.a}</p>`)
    .join('');
  const relatedHtml = item.related
    .map((r) => `<li><a href="${r.url}">${r.label}</a></li>`)
    .join('');
  // sentinel をHTMLコメントで埋め込み（再実行時のスキップ判定に使用）
  return `<!-- ${item.sentinel} -->\n<h2>よくある質問（FAQ）</h2>${faqHtml}<h2>関連記事 / 関連ツール</h2><ul>${relatedHtml}</ul>`;
}

console.log(`Mode: ${dryRun ? 'DRY-RUN (no API calls)' : 'APPLY (writing to MicroCMS)'}`);
console.log(`Targets: ${enhancements.length} pillar articles`);
console.log('---');

let succeeded = 0;
let skipped = 0;
const errors = [];

for (const item of enhancements) {
  console.log(`[ITEM] ${item.id}`);
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: item.id,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    console.error(`   NG: 取得失敗: ${e.message}`);
    errors.push(`${item.id}: ${e.message}`);
    continue;
  }

  if (current.content?.includes(item.sentinel)) {
    console.log('   SKIP: 既に追加済み (sentinel found)');
    skipped++;
    continue;
  }

  const append = buildAppendHtml(item);
  const newContent = `${current.content}${append}`;

  console.log(`   title: ${current.title}`);
  console.log(`   current content len: ${current.content?.length ?? 0}`);
  console.log(`   append len: ${append.length}`);
  console.log(`   FAQs: ${item.faqs.length} / Related: ${item.related.length}`);
  console.log('   ── 追加プレビュー（先頭400字）──');
  console.log(append.slice(0, 400).replace(/\n/g, ' \\n '));

  if (dryRun) {
    console.log('   OK: would update (dry-run)');
    succeeded++;
    continue;
  }

  try {
    await client.update({
      endpoint: 'columns',
      contentId: item.id,
      content: { content: newContent },
    });
    console.log('   OK: updated');
    succeeded++;
  } catch (e) {
    console.error(`   NG: 更新失敗: ${e.message}`);
    errors.push(`${item.id}: ${e.message}`);
  }
}

console.log('\n========================================');
console.log(`OK: ${dryRun ? 'plan' : 'updated'}: ${succeeded}/${enhancements.length}`);
if (skipped > 0) console.log(`skipped: ${skipped}`);
if (errors.length > 0) {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) console.log(`   - ${e}`);
}
if (dryRun) {
  console.log('\nThis was a dry run. Re-run with --apply to actually update articles.');
}
