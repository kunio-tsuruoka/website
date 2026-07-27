/**
 * コラム本文から /tools/* への誘導を全撤去し、CV点（相談CTA）に置き換える。
 *
 * 背景（2026-07-27 ユーザー判断）:
 *   記事末CTAは全記事 /contact に向いていたが、本文中は 26記事・108本の
 *   ツールリンクが支配的で、読者が記事末CTAに到達する前にツールへ抜けていた。
 *   ツール利用は問い合わせに繋がらないため、本文からツール導線を撤去する。
 *
 * 使い方:
 *   node --env-file=.env scripts/remove-tool-links-from-columns.mjs        # dry-run（既定）
 *   node --env-file=.env scripts/remove-tool-links-from-columns.mjs --apply
 *
 * 安全装置:
 *   - dry-run 既定
 *   - 明示ルールが1件も当たらない / 複数当たる場合はエラーで中断（曖昧一致を許さない）
 *   - PATCH 後に /tools/ 残存数を再取得して検証
 *   - MicroCMS は改行入りHTMLで送る（1行詰めはブロック境界が壊れる。microcms.md 参照）
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
/** --apply 時は必ず変更前HTMLをここに退避する（ロールバック用） */
const backupDir = process.argv
  .find((a) => a.startsWith('--backup-dir='))
  ?.slice('--backup-dir='.length);
const dumpSlug = process.argv.find((a) => a.startsWith('--dump='))?.slice('--dump='.length);

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/**
 * ルール種別:
 *   block   … <p>/<li> ブロックを置換（html: null で削除）。find は正規化テキストの一意な部分文字列
 *   section … 見出し（完全一致テキスト）から次の同レベル以上の見出し直前までを置換（html: null で削除）
 *   heading … 見出しテキストの改名
 */
const RULES = {
  'system-development-outsourcing-guide': [
    {
      type: 'block',
      find: '業務の現状課題を',
      html: '<p>「何を作りたいか」の前に「何を解決したいか」を言語化します。業務の現状課題を業務フローとして可視化しておくと、外注先への説明がスムーズになるだけでなく、不要な機能を削ぎ落とす判断材料にもなります。</p>',
    },
    {
      type: 'block',
      find: '最低でも2〜3社から見積もりを取ります',
      html: '<p>最低でも2〜3社から見積もりを取ります。金額だけでなく、前提条件・対応範囲・保守費用・スケジュールの粒度を比較することが重要です。</p>',
    },
    {
      type: 'block',
      find: '一般的には「要件整理 → RFP作成 → 見積もり比較 → 契約 → 開発・検収」',
      html: '<p>A. 一般的には「要件整理 → RFP作成 → 見積もり比較 → 契約 → 開発・検収」の5ステップです。最も重要なのは最初の要件整理で、業務フローの可視化から始めると外注先への説明精度が上がります。RFPの具体的な書き方と盛り込む項目は<a href="/column/how-to-write-rfp">RFPの書き方ガイド</a>で解説しています。</p>',
    },
  ],

  'ai-requirements-definition': [
    { type: 'block', find: 'のようにリストを整理する手段と組み合わせると', html: null },
    {
      type: 'block',
      find: 'AIに「他に必要な機能は？」と聞くと',
      html: '<p>AIに「他に必要な機能は？」と聞くと、一般的に考えられる機能をどんどん提案してきます。結果として、<strong>本来不要な機能まで要件に入り込み、スコープが際限なく膨らむ</strong>。「何を作らないか」を決めるのは人間の仕事です。</p>',
    },
    {
      type: 'block',
      find: 'そのまま渡すのは避けてください',
      html: '<p>A. そのまま渡すのは避けてください。AIが生成した要件には、業務実態との乖離や曖昧な表現が含まれている可能性があります。必ず現場担当者のレビューを通してから開発パートナーに共有しましょう。要件の優先順位づけに迷う場合は、Beekleが発注側の立場で一緒に整理するご相談も無料で承っています。</p>',
    },
  ],

  'ai-introduction-kpi-redesign': [
    {
      type: 'block',
      find: 'まず既存導入分の3層KPIを再構成するワークから始める',
      html: '<p>「AI入れたけど効果が分からない」「決裁者にROIを説明できない」という相談を受けた時は、まず既存導入分の3層KPIを再構成するワークから始める。削減業務と創出時間の用途を整理し、月次キャッシュフローとアウトカムを1枚に揃える。</p>',
    },
  ],

  'it-admin-ai-first-week': [
    {
      type: 'block',
      find: 'ベンダー商談に入る前に社内の足場を固めたい',
      html: '<p>「AI入れて」と言われたが何から手を付けるべきか分からない、ベンダー商談に入る前に社内の足場を固めたい、という場面で相談を受けることが多い。PoC候補の絞り込みと優先順位付けから、Beekleが発注側の立場で一緒に進める。</p>',
    },
  ],

  'dx-josys-ai-era-requirements': [
    {
      type: 'block',
      find: 'AIが書いたコードのレビュー基準が明確になります',
      html: '<p>ユーザーストーリー（As a〜／I want to〜／So that〜の3要素）で「誰が・何を・なぜ」を握ることで、AIが書いたコードのレビュー基準が明確になります。詳しい書き方は<a href="/column/user-story-template-examples">ユーザーストーリー書き方完全ガイド</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: '業務フローの可視化は、AI時代でも人間がやる工程です',
      html: '<p>業務フローの可視化は、AI時代でも人間がやる工程です。As-Isの正確性が低いと、AIが速く書いたコードも結局現場では使えません。スイムレーン図で業務フローを描き、関係者で照合する作業に時間をかけます。</p>',
    },
    {
      type: 'block',
      find: 'FM法の3軸（ビジネス価値・現場で使えるか・技術コスト）で要件を',
      html: '<p>FM法の3軸（ビジネス価値・現場で使えるか・技術コスト）で要件を「作る／後回し／作らない」に振り分け、最初のリリースには「作る」だけを含めます。詳しくは<a href="/column/scope-management-fm-method">スコープ管理「FM法」の使い方</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'A. 4つあります。',
      html: '<p>A. 4つあります。(1) <a href="/column/user-story-template-examples">ユーザーシナリオ</a>で「誰が・何を・なぜ」を握る、(2) スイムレーン図でAs-Is／To-Beを精緻に可視化する、(3) <a href="/column/scope-management-fm-method">FM法</a>でスコープクリープを止める、(4) エンジニアリング視点でBPOを見て費用対効果から逆算する。特に4番目が、AI時代の発注の核心です。</p>',
    },
  ],

  'dx-josys-tobe-redesign': [
    {
      type: 'block',
      find: '費用対効果が試算できた段階で、お客様と一緒にToBe案の再設計',
      html: '<p>費用対効果が試算できた段階で、お客様と一緒にToBe案の再設計を行いました。当初案を一部採用しつつ、一部は変更し、一部は削るという形で合意しました。優先順位の判定にはFM法（要件をビジネス価値・現場で使えるか・技術コストの3軸で評価する手法）を使うと、客観基準で「作る／後回し／作らない」が決まります。詳しくは<a href="/column/scope-management-fm-method">スコープ管理「FM法」の使い方</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: '標準フローだけが描かれていて、例外時の挙動が空白',
      html: '<p>標準フローだけが描かれていて、例外時の挙動が空白になっていないかを確認します。「月末だけ違う」「Aさん休みのときは別ルート」のような暗黙の例外運用が、ToBeに反映されているかが分かれ目です。例外運用の洗い出しは<a href="/column/dx-josys-bpo-review">BPO見直しの進め方</a>を参考に、As-Isを正確に描くと拾えます。</p>',
    },
  ],

  'dx-josys-bpo-review': [
    {
      type: 'block',
      find: 'ヒアリング結果を業務フロー図（スイムレーン図）に落とし込みます',
      html: '<p>ヒアリング結果を業務フロー図（スイムレーン図）に落とし込みます。図にすることで関係者の頭の中のイメージが照合可能になり、「ここが違う」「これが抜けている」が次々に出てきます。</p>',
    },
    {
      type: 'block',
      find: 'BPO棚卸しは机上ではなく現場ヒアリングと業務フロー可視化を伴う',
      html: '<li>BPO棚卸しは机上ではなく現場ヒアリングと業務フロー可視化を伴う</li>',
    },
    {
      type: 'block',
      find: 'A. 5ステップで現場と一緒に進めます',
      html: '<p>A. 5ステップで現場と一緒に進めます。(1) 主要業務プロセスのリストアップ（使用システム・責任者・月次工数の3列で整理）、(2) 5サインでスクリーニングして優先度を判定、(3) 優先度の高い業務について現場担当者にヒアリング、(4) ヒアリング結果を業務フロー図（スイムレーン図）に落とし込む、(5) As-Isが見えたら経営層と「業務改善で直す範囲／システム化する範囲／やらない範囲」を握る。</p>',
    },
  ],

  'ai-dx-introduction-process': [
    {
      type: 'block',
      find: 'これをスイムレーン形式（横軸＝工程、縦軸＝担当）で図にすると',
      html: '<p>これをスイムレーン形式（横軸＝工程、縦軸＝担当）で図にすると、関係者が一目で「全体像」を共有できます。</p>',
    },
    {
      type: 'block',
      find: 'で As-Is を描き、コスト・時間・ボトルネックの自動分析',
      html: '<p>{{CONTACT_CTA_MID}}</p>',
    },
    {
      type: 'block',
      find: 'いいえ。提案はあくまで候補です',
      html: '<p>いいえ。提案はあくまで候補です。実際にDXするかは「投資対効果（ROI）」と「現場の受容性」で判断します。判定軸（時間×コスト×受容性）で候補を並べ、投資の順序を決めます。</p>',
    },
    { type: 'block', find: 'この3ステップを支えるのが', html: null },
    { type: 'heading', find: '関連ツール・記事', to: '関連記事' },
    // ツール撤去に伴い、ツール前提だった問い・記述を自立した表現に直す
    {
      type: 'heading',
      find: 'Q4. ツールが提案する「自動化候補」をすべて自動化すべき？',
      to: 'Q4. 洗い出した「自動化候補」をすべて自動化すべき？',
    },
    {
      type: 'block',
      requireTool: false,
      find: '時間・コスト・ボトルネックを自動分析し',
      html: '<li>時間・コスト・ボトルネックを洗い出し、DXすべきステップを判断</li>',
    },
    // 「地図」は使い古された比喩として禁止（.claude/rules/content.md）
    {
      type: 'heading',
      find: 'まとめ：可視化なしのAI／DX導入は、地図なしの旅',
      to: 'まとめ：業務可視化を飛ばしたAI／DX導入は失敗する',
    },
  ],

  'dx-josys-as-is-bpo-guide': [
    { type: 'block', find: 'でAs-Is／To-Beを並べて描けるようにしています', html: null },
    {
      type: 'block',
      find: '倉庫管理者として、在庫が閾値を下回った段階でアラートを受けたい',
      html: '<p>例: 「倉庫管理者として、在庫が閾値を下回った段階でアラートを受けたい。なぜなら、発注リードタイムを確保して欠品を防ぐため」。この3要素が揃うと、開発側は<strong>「なぜ」から技術選択肢を逆算</strong>できます（例: アラートタイミングが業務上シビアならpush通知、緩いならメールで十分）。詳しい書き方と業界別の実例は<a href="/column/user-story-template-examples">ユーザーストーリー書き方完全ガイド</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'これは「機能の優先順位付け」とも違います',
      html: '<p>これは「機能の優先順位付け」とも違います。FM法（要件をビジネス価値・現場で使えるか・技術コストの3軸で評価する手法）を使うと近い判断ができますが、それよりさらに上流で<strong>「そもそもシステム化するか、業務改善で済ませるか」</strong>の判断を含めます。詳しいFM法の使い方は<a href="/column/scope-management-fm-method">スコープ管理「FM法」の使い方</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'FM法の最大の効果は',
      html: '<p>FM法の最大の効果は<strong>「使われない機能」「無謀な機能」を客観基準で弾けること</strong>。実調査でも開発した機能の8割は使われていないと言われており、ここを切るだけで予算と納期は大きく改善します。手法の詳細は<a href="/column/scope-management-fm-method">スコープ管理「FM法」の使い方</a>を参照してください。</p>',
    },
    {
      type: 'block',
      find: '現場ヒアリングとAs-Isの可視化:',
      html: '<li><strong>現場ヒアリングとAs-Isの可視化:</strong> 各業務の担当者に「実際にどう動いているか」を聞き、業務フローをスイムレーン図で描いて関係者で照合する</li>',
    },
    {
      type: 'block',
      find: 'ユーザーシナリオで動機を握る:',
      html: '<li><strong>ユーザーシナリオで動機を握る:</strong> 「誰が・何を・なぜ」の3要素で各業務の動機を1〜3行に書き出す。動機が空っぽな機能は後段でFM法で却下できる</li>',
    },
    {
      type: 'block',
      find: 'FM法で「作る／後回し／作らない」を決める:',
      html: '<li><strong>FM法で「作る／後回し／作らない」を決める:</strong> 各要件をビジネス価値・現場で使えるか・技術コストの3軸で評価し、スコープクリープを止める</li>',
    },
    {
      type: 'block',
      find: 'A. 紙やホワイトボードでも可ですが',
      html: '<p>A. 紙やホワイトボードでも可ですが、関係者間で照合するためにスイムレーン図（縦軸＝担当者、横軸＝時系列）で描くのが効果的です。現場ヒアリングと同時にAs-Is／To-Beを並べて更新していくと、抜け漏れが見つかります。</p>',
    },
    {
      type: 'block',
      find: '（ビジネス価値・現場で使えるか・技術コストの3軸評価）で「作る／後回し／作らない」を経営の責任で先に決める',
      html: '<p>A. <a href="/column/scope-management-fm-method">FM法</a>（ビジネス価値・現場で使えるか・技術コストの3軸評価）で「作る／後回し／作らない」を経営の責任で先に決めるのが要点です。各部門の要望をすべて拾うと要件は無限に膨らみ、これがDX失敗の主因になります。情シスが経営層と一緒にスコアリングし、「作らない」を明文化することが最大のレバーです。</p>',
    },
  ],

  'how-to-write-rfp': [],

  'requirements-vs-requests': [
    {
      type: 'block',
      find: '要求を「〇〇として、△△したい。なぜなら××だから」の形式に変換します',
      html: '<p>要求を「〇〇として、△△したい。なぜなら××だから」の形式に変換します。詳細は <a href="/column/user-story-template-examples">ユーザーストーリーテンプレート</a> を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'A. Beekleが推奨する4ステップがあります',
      html: '<p>A. Beekleが推奨する4ステップがあります。(1) 要求をユーザーストーリー化する、(2) 受入条件を付ける、(3) <a href="/column/ears-requirements-syntax-guide">EARS記法</a>で要件文に変換する、(4) 数値目標を追加する。</p>',
    },
  ],

  'requirements-definition-process': [
    {
      type: 'block',
      find: 'スイムレーン形式（業務担当者ごとのレーン）で書くと',
      html: '<p>As-Is と To-Be を並べて可視化します。スイムレーン形式（業務担当者ごとのレーン）で書くと、属人化や二重作業がひと目で見えます。</p>',
    },
    {
      type: 'block',
      find: 'では、要望をフォームに入力すると上記形式に半自動変換できます',
      html: '<p>詳しい書き方は <a href="/column/user-story-template-examples">ユーザーストーリーテンプレートと実例</a> を参照してください。</p>',
    },
    {
      type: 'block',
      find: '要件を FM の3軸で評価し、 <strong>作る／後回し／作らない</strong>',
      html: null,
    },
    { type: 'section', find: '実践ツール', html: null, all: true },
  ],

  'requirements-definition-template': [
    {
      type: 'block',
      find: '機能リストから書き始めると',
      html: '<p>機能リストから書き始めると、「なぜそれが必要なのか」が抜け落ちて、後で削る判断ができなくなります。詳しくは <a href="/column/user-story-template-examples">ユーザーストーリーテンプレートと実例</a> を参照してください。</p>',
    },
    {
      type: 'block',
      find: '優先順位の付け方は',
      html: '<p>優先順位の付け方は <a href="/column/requirements-prioritization-moscow-fm">要件の優先順位付け: MoSCoW vs FM法 完全比較</a> と <a href="/column/scope-management-fm-method">スコープ管理FM法</a> をご覧ください。</p>',
    },
  ],

  'requirements-definition-complete-guide': [
    {
      type: 'block',
      find: '現状の業務フローを図示し、新システム導入後にどう変わるべきか',
      html: '<p>現状の業務フローを図示し、新システム導入後にどう変わるべきかを描きます。As-Is/To-Be を並べて可視化することを推奨しています。</p>',
    },
    {
      type: 'block',
      find: '洗い出した要求を FM（ファンクショナリティ・マトリクス）の3軸',
      html: '<p>洗い出した要求を FM（ファンクショナリティ・マトリクス）の3軸（ビジネス価値 × 現場で使えるか × 技術コスト）で「作る／後回し／作らない」に絞り込みます。「作る」と決めた要求を <strong>ユーザーストーリー</strong>（&quot;〇〇として、△△したい。なぜなら××だから&quot;、書き方は <a href="/column/user-story-template-examples">ユーザーストーリーテンプレートと実例</a>）に詳細化し、<strong>機能要件</strong> と <strong>非機能要件</strong> に分類します。詳細は <a href="/column/requirements-prioritization-moscow-fm">MoSCoWとFMで要件を絞り込む方法</a> を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'では、要件を FM の3軸で評価し、作る／後回し／作らない の判定を自動化',
      html: null,
    },
  ],

  'ears-gherkin-workflow': [
    {
      type: 'block',
      find: 'で「誰が・何を・なぜ」の3要素を書き出します',
      html: '<p>「誰が・何を・なぜ」の3要素を書き出します。</p>',
    },
    {
      type: 'block',
      find: 'でのユーザーストーリー整備',
      html: '<li>ユーザーストーリーの整備</li>',
    },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'gherkin-bdd-introduction': [
    {
      type: 'block',
      find: 'でユーザーストーリーを書き、',
      html: '<p>ユーザーストーリーを書き、<a href="/column/ears-requirements-syntax-guide">EARS</a> で受入条件と異常系を曖昧さなく言語化します。</p>',
    },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'requirements-prioritization-moscow-fm': [
    { type: 'section', find: 'Beekle の FM 法ツール（無料）', html: '<p>{{REQ_CONSULT_MID}}</p>' },
    { type: 'block', find: '無料相談を予約する', html: '<p>{{CONTACT_CTA}}</p>' },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'ears-requirements-syntax-guide': [
    {
      type: 'block',
      find: 'で「誰が・何を・なぜ」を書き出します',
      html: '<p>「誰が・何を・なぜ」を書き出します。</p>',
    },
    {
      type: 'block',
      find: '要件が出そろったら',
      html: '<p>要件が出そろったら、FM法で「ビジネス価値・現場で使えるか・技術コスト」の3軸評価を行い、何を作るかを決めます。</p>',
    },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'scope-management-fm-method': [
    {
      type: 'block',
      find: '「作る／後回し／作らない」のラベルを付与します',
      html: '<p>「作る／後回し／作らない」のラベルを付与します。3軸の評価が出そろえば、判定は機械的に決まります。</p>',
    },
    {
      type: 'section',
      find: 'Beekleの無料ツール「Scope Manager」',
      html: '<p>{{REQ_CONSULT_MID}}</p>',
    },
    { type: 'block', find: 'で実際に評価してみてください', html: null },
    { type: 'block', find: '無料相談を予約する', html: '<p>{{CONTACT_CTA}}</p>' },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'user-story-template-examples': [
    {
      type: 'section',
      find: 'ユーザーストーリーを書きやすくする無料ツール「Story Builder」',
      html: '<p>{{REQ_CONSULT_MID}}</p>',
    },
    {
      type: 'block',
      find: 'ストーリーをたくさん書いただけでは',
      html: '<p>ストーリーをたくさん書いただけでは、何から作るべきか決まりません。次のステップは優先順位付けです。書籍『システムを作らせる技術』のFM（ファンクショナリティ・マトリクス）法で、「ビジネス価値」「現場で使えるか」「技術コスト」の3軸で評価します。</p>',
    },
    { type: 'section', find: 'まずはツールを試す', html: '<p>{{CONTACT_CTA}}</p>' },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'ai-era-development-flow': [
    {
      type: 'block',
      find: '発注者自身がシナリオを用意し',
      html: '<p>システム開発を成功させるためには、発注者自身がシナリオを用意し、開発チームと協力して検証を進める必要があります。ここでいう「シナリオ」とは、ユーザーストーリーと受入条件を組み合わせたものです。</p>',
    },
    {
      type: 'block',
      find: '絞り込みの判断軸を3つに分けて見える化したい場合は',
      html: '<p>絞り込みの判断軸は「ビジネス価値・現場で使えるか・技術コスト」の3つです。手法の背景は <a href="/column/scope-management-fm-method">スコープ管理「FM法」の使い方</a> を参照してください。</p>',
    },
    { type: 'block', find: '無料相談を予約する', html: '<p>{{CONTACT_CTA}}</p>' },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'ai-development-speed': [
    {
      type: 'block',
      find: 'テンプレートと豊富な実例は',
      html: '<p>テンプレートと豊富な実例は <a href="/column/user-story-template-examples">ユーザーストーリーの書き方完全ガイド</a> にまとめています。</p>',
    },
    { type: 'block', find: '判定はブラウザだけで動く', html: '<p>{{REQ_CONSULT_MID}}</p>' },
    {
      type: 'block',
      find: 'STEP 1 → ',
      html: '<li>STEP 1 → <a href="/column/user-story-template-examples">書き方完全ガイド</a></li>',
    },
    {
      type: 'block',
      find: 'STEP 2 → ',
      html: '<li>STEP 2 → <a href="/column/scope-management-fm-method">FM法の使い方</a></li>',
    },
  ],

  'project-management-complete-guide': [
    {
      type: 'block',
      find: 'As-Is / To-Be を可視化する',
      html: '<li><strong>As-Is / To-Be を可視化する</strong> — 既存業務のDX化案件なら必須。現状業務と理想業務の差分を絵にする</li>',
    },
    {
      type: 'block',
      find: '開発範囲と優先順位を整理する',
      html: '<li><strong>開発範囲と優先順位を整理する</strong> — 何を作る／作らない／後回しを3軸で確定する</li>',
    },
    {
      type: 'block',
      find: '「作る」要件を仕様化する',
      html: '<li><strong>「作る」要件を仕様化する</strong> — ユーザーストーリー＋EARSで詳細化し、Given/When/Then のGherkinで受入基準を1本化する</li>',
    },
    {
      type: 'block',
      find: '可視化は紙でもホワイトボードでも構いません',
      html: '<p>可視化は紙でもホワイトボードでも構いません。As-Is と To-Be をスイムレーン形式で並べ、差分（自動化される処理／消える処理／新しく必要になる承認）を視覚化できます。To-Be で「消える処理」が見えると、STEP 4 の FM 判定で「作らない」を判断する材料になります。</p>',
    },
    { type: 'block', find: '判定はブラウザだけで動く', html: null },
    { type: 'block', find: '書き出しは', html: null },
    {
      type: 'block',
      find: 'STEP 2 As-Is/To-Be → ',
      html: '<li>STEP 2 As-Is/To-Be → 業務差分を可視化（既存業務のDX化案件のみ）</li>',
    },
    {
      type: 'block',
      find: 'STEP 4 FM法 → ',
      html: '<li>STEP 4 FM法 → <a href="/column/scope-management-fm-method">FM法の使い方</a></li>',
    },
    {
      type: 'block',
      find: 'STEP 5 ユーザーストーリー＋EARS＋Gherkin → ',
      html: '<li>STEP 5 ユーザーストーリー＋EARS＋Gherkin → <a href="/column/user-story-template-examples">書き方ガイド</a> ／ <a href="/column/ears-requirements-syntax-guide">EARS入門</a> ／ <a href="/column/gherkin-bdd-introduction">Gherkin入門</a> ／ <a href="/column/ears-gherkin-workflow">EARS×Gherkin</a></li>',
    },
    { type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' },
  ],

  'project-management-02': [
    {
      type: 'block',
      find: '誰が・どの工程で・何の道具を使って',
      html: '<p>誰が・どの工程で・何の道具を使って・どれくらい時間をかけているかをスイムレーン図で可視化します。「マニュアル通りに動いている」と思っていた業務でも、実際にヒアリングすると例外運用や暗黙ルールが多数見つかります。</p>',
    },
  ],

  'engineer-communication': [
    {
      type: 'block',
      find: 'DX案件で現状業務を引きずっている場合は',
      html: '<p>DX案件で現状業務を引きずっている場合は、要求を洗い出す前に As-Is と To-Be を可視化してください。「現在の不便」をそのままシステムに移植する事故を防げます。</p>',
    },
    {
      type: 'block',
      find: '3軸を発注側とエンジニアで一緒に埋めると',
      html: '<p>3軸を発注側とエンジニアで一緒に埋めると、優先度の議論が「印象論」から「3軸の数字を変える議論」になります。トラブル発生時にも「★1のSTEP 4＝作らないものから順に削る」という共通ルールで動けます。詳しくは <a href="/column/scope-management-fm-method">FM法の使い方</a> と <a href="/column/avoid-unused-system">使われないシステムを作らない方法</a> を参照してください。</p>',
    },
    {
      type: 'block',
      find: 'FM法で「作る」と決まった要求だけを',
      html: '<p>FM法で「作る」と決まった要求だけを、<strong>ユーザーストーリー＋EARS＋Gherkin</strong> で仕様に落とし込みます。書き方は <a href="/column/user-story-template-examples">ユーザーストーリーの書き方完全ガイド</a> を参照してください。受入条件を曖昧にしないコツは、ストーリーごとにEARS記法で「いつ・どんな条件で・システムが何をするか」を分解することです（<a href="/column/ears-requirements-syntax-guide">EARS入門</a>）。</p>',
    },
  ],

  'avoid-unused-system': [{ type: 'heading', find: '関連記事 / 関連ツール', to: '関連記事' }],
};

/** 本文中盤に挿入する CTA マーカー（本文CV点がゼロの記事向け） */
const MID_CTA_INSERTS = {
  'ai-development-speed': null, // 上のルールで {{REQ_CONSULT_MID}} 済み
  'engineer-communication': '{{REQ_CONSULT_MID}}',
  'avoid-unused-system': '{{REQ_CONSULT_MID}}',
  'project-management-02': '{{CONTACT_CTA_MID}}',
  'failure-prevention-for-clients': '{{CONTACT_CTA_MID}}',
  'things-not-to-do-pm': '{{CONTACT_CTA_MID}}',
  'system-development-zero-start': '{{ESTIMATE_CONSULT_MID}}',
  'system-development-budget-control': '{{ESTIMATE_CONSULT_MID}}',
  'system-estimate-uncertainty': '{{ESTIMATE_CONSULT_MID}}',
  'system-development-cost-market': '{{ESTIMATE_CONSULT_MID}}',
  'prevent-mismatch': '{{REQ_CONSULT_MID}}',
  'project-management-04': '{{CONTACT_CTA_MID}}',
  'step-by-step-development': '{{CONTACT_CTA_MID}}',
  'common-mistakes': '{{CONTACT_CTA_MID}}',
  'communication-03': '{{CONTACT_CTA_MID}}',
};

const BLOCK_RE = /<(li|p)(?:\s[^>]*)?>[\s\S]*?<\/\1>/g;
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const textOf = (s) => norm(s.replace(/<[^>]+>/g, ''));

function applyBlockRule(html, rule, slug) {
  const blocks = html.match(BLOCK_RE) || [];
  const hits = blocks.filter(
    (b) => norm(b).includes(rule.find) && (rule.requireTool === false || /href="\/tools\//.test(b))
  );
  if (hits.length === 0) throw new Error(`[${slug}] block ルール未ヒット: ${rule.find}`);
  if (hits.length > 1)
    throw new Error(`[${slug}] block ルールが${hits.length}件に曖昧一致: ${rule.find}`);
  return html.replace(hits[0], rule.html === null ? '' : `\n${rule.html}\n`);
}

/** 見出しから次の同レベル以上の見出し直前までを置換 */
function applySectionRule(html, rule, slug) {
  const level = (h) => Number(h.slice(2, 3));
  const headRe = /<(h[234])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  const heads = [];
  let m = headRe.exec(html);
  while (m !== null) {
    heads.push({ tag: m[1], text: textOf(m[2]), start: m.index, end: m.index + m[0].length });
    m = headRe.exec(html);
  }
  const targets = heads.filter((h) => h.text === rule.find);
  if (targets.length === 0) throw new Error(`[${slug}] section ルール未ヒット: ${rule.find}`);
  if (targets.length > 1 && !rule.all)
    throw new Error(`[${slug}] section ルールが${targets.length}件に曖昧一致: ${rule.find}`);

  let out = html;
  // 後ろから削ると index がずれない
  for (const t of [...targets].reverse()) {
    const next = heads.find((h) => h.start > t.start && level(h.tag) <= level(t.tag));
    const end = next ? next.start : out.length;
    out = out.slice(0, t.start) + (rule.html === null ? '' : `\n${rule.html}\n`) + out.slice(end);
  }
  return out;
}

function applyHeadingRule(html, rule, slug) {
  const headRe = /<(h[234])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g;
  let replaced = 0;
  const out = html.replace(headRe, (full, tag, attrs, inner) => {
    if (textOf(inner) !== rule.find) return full;
    replaced += 1;
    return `<${tag}${attrs}>${rule.to}</${tag}>`;
  });
  if (replaced === 0) throw new Error(`[${slug}] heading ルール未ヒット: ${rule.find}`);
  return out;
}

/** 残った「ツール誘導だけの <li>」を落とす（関連ツールリスト等） */
function dropToolOnlyListItems(html) {
  return html.replace(/<li(?:\s[^>]*)?>[\s\S]*?<\/li>/g, (li) => {
    if (!/href="\/tools\//.test(li)) return li;
    if (/href="\/column\//.test(li)) return li;
    if (textOf(li).length > 60) return li;
    return '';
  });
}

/** 空になった <ul>/<ol> と連続空行を掃除 */
function cleanup(html) {
  return html
    .replace(/<(ul|ol)(?:\s[^>]*)?>\s*<\/\1>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 本文中央付近の <h2> 直前に CTA マーカーを挿入。
 * 見出しが無い記事（旧フォーマット）は中央付近の段落境界にフォールバックする。
 */
function insertMidCta(html, marker) {
  const headRe = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g;
  const positions = [];
  let m = headRe.exec(html);
  while (m !== null) {
    const inner = textOf(m[1]);
    const skip =
      /^Q\d*[.．]/.test(inner) || /(FAQ|よくある質問|関連記事|関連ツール|まとめ)/.test(inner);
    if (!skip) positions.push(m.index);
    m = headRe.exec(html);
  }
  if (positions.length >= 2) {
    const at = positions[Math.floor(positions.length / 2)];
    return `${html.slice(0, at)}\n<p>${marker}</p>\n${html.slice(at)}`;
  }

  // フォールバック: トップレベルブロックの中央境界
  const blockRe = /<(p|ul|ol|figure|blockquote)(?:\s[^>]*)?>[\s\S]*?<\/\1>/g;
  const starts = [];
  let b = blockRe.exec(html);
  while (b !== null) {
    starts.push(b.index);
    b = blockRe.exec(html);
  }
  if (starts.length < 4) return null;
  const at = starts[Math.floor(starts.length / 2)];
  return `${html.slice(0, at)}\n<p>${marker}</p>\n${html.slice(at)}`;
}

// ---------------------------------------------------------------------------

if (apply && !backupDir) {
  console.error('--apply には --backup-dir=<path> が必須です（変更前HTMLの退避先）');
  process.exit(1);
}
if (apply) mkdirSync(backupDir, { recursive: true });

console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}\n`);

const slugs = [...new Set([...Object.keys(RULES), ...Object.keys(MID_CTA_INSERTS)])];
const errors = [];
let changed = 0;

for (const slug of slugs) {
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    errors.push(`${slug}: 取得失敗 ${e.message}`);
    continue;
  }

  const before = current.content;
  let html = before;

  try {
    for (const rule of RULES[slug] ?? []) {
      if (rule.type === 'block') html = applyBlockRule(html, rule, slug);
      else if (rule.type === 'section') html = applySectionRule(html, rule, slug);
      else if (rule.type === 'heading') html = applyHeadingRule(html, rule, slug);
    }
    html = cleanup(dropToolOnlyListItems(html));

    const marker = MID_CTA_INSERTS[slug];
    if (marker && !/\{\{[A-Z0-9_]*(CTA|CONSULT)[A-Z0-9_]*\}\}/.test(html)) {
      const withCta = insertMidCta(html, marker);
      if (withCta) html = withCta;
      else errors.push(`${slug}: 中盤CTA挿入位置が見つからない（h2不足）`);
    }
  } catch (e) {
    errors.push(e.message);
    continue;
  }

  const toolsBefore = (before.match(/href="\/tools\//g) || []).length;
  const toolsAfter = (html.match(/href="\/tools\//g) || []).length;
  const ctasAfter = (html.match(/\{\{[A-Z0-9_]*(?:CTA|CONSULT)[A-Z0-9_]*\}\}/g) || []).length;

  if (dumpSlug === slug) {
    console.log(`\n===== ${slug} 置換後HTML =====`);
    console.log(html.replace(/></g, '>\n<'));
    console.log('===== ここまで =====\n');
  }

  if (html === before) {
    console.log(`[${slug}] 変更なし`);
    continue;
  }
  changed += 1;
  console.log(
    `[${slug}] tools ${toolsBefore} → ${toolsAfter} / 本文CTA ${ctasAfter} / ${before.length} → ${html.length} bytes`
  );
  if (toolsAfter > 0) errors.push(`${slug}: /tools/ が ${toolsAfter} 本残存`);

  if (apply) {
    writeFileSync(`${backupDir}/${slug}.html`, before, 'utf8');
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: html } });
      console.log('   PATCH OK');
    } catch (e) {
      errors.push(`${slug}: PATCH失敗 ${e.message}`);
    }
  }
}

console.log(`\n変更対象: ${changed} 記事`);
if (errors.length) {
  console.log('\n--- 要確認 ---');
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log(apply ? '完了' : 'dry-run 完了（--apply で反映）');
