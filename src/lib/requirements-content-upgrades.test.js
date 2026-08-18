import { describe, expect, it } from 'vitest';
import { upgradeRequirementsContent } from './requirements-content-upgrades.js';

const section = (title, body = '<p>SEO_KEEP</p>') => `<h2>${title}</h2>${body}`;
const subsection = (title, body = '<p>old</p>') => `<h3>${title}</h3>${body}`;

describe('requirements content upgrades', () => {
  it('leaves non-target articles untouched', () => {
    const source = '<h2>Example</h2><p>unchanged</p>';
    expect(upgradeRequirementsContent('other-article', source)).toBe(source);
  });

  it('upgrades the complete guide without removing unrelated SEO content', () => {
    const source = [
      section(
        '要件定義とは何か：目的と位置付け',
        `<p>old intro</p>${subsection('要件定義と要求定義の違い')}`
      ),
      section('なぜ要件定義で失敗するのか'),
      section('要件定義の5つのフェーズ'),
      section('要件定義書に書くべき項目'),
      section('要件の書き方ルール：EARS記法'),
      section('要件定義の成果物チェックリスト'),
      section(
        'よくある質問',
        [
          subsection('Q1. 要件定義の期間はどれくらいですか？'),
          subsection('Q2. 要件定義の費用相場は？'),
          subsection('Q4. 要件定義書は何ページくらいになりますか？'),
          subsection('Q5. アジャイル開発でも要件定義書は必要ですか？'),
        ].join('')
      ),
      section('まとめ：要件定義は "投資"'),
    ].join('');

    const result = upgradeRequirementsContent('requirements-definition-complete-guide', source);
    expect(result).toContain('要求 → 機能仕様 → 非機能要件・制約');
    expect(result).toContain('顧客回答 → 変更案 → 人間による確認 → 正本へ反映');
    expect(result).toContain('参考にした要求工学・仕様記述の考え方');
    expect(result).toContain('SEO_KEEP');
  });

  it('positions Gherkin as verifiable acceptance behavior and connects it to regression', () => {
    const source = [
      section('Gherkinとは何か'),
      section('なぜ Gherkin が必要なのか'),
      section(
        'キーワードの意味と使い分け',
        `${subsection('When（操作・イベント）')}${subsection('Then（期待される結果）')}`
      ),
      section('Gherkin と EARS の関係'),
      section('Gherkin を実行する：主要フレームワーク'),
      section('Gherkin を導入するステップ'),
      section('Gherkin を使う／使わない場面'),
      section('まとめ'),
      section('参考文献'),
    ].join('');

    const result = upgradeRequirementsContent('gherkin-bdd-introduction', source);
    expect(result).toContain('Given 在庫数が1個の商品が存在する');
    expect(result).toContain('Scenario → 実装 → TestResult → PR / CI → Regression');
    expect(result).toContain('specification layer');
    expect(result).toContain('Cucumber Documentation — Gherkin Reference');
  });

  it('keeps EARS useful while adding its practical limits', () => {
    const source = [
      section('EARSとは何か'),
      section('なぜユーザーストーリーだけでは足りないのか'),
      section('EARSの5つのパターン'),
      section('ユーザーストーリーとEARSを組み合わせた完成形'),
      section('EARSの導入ステップ'),
      section('まとめ'),
      section('参考文献'),
    ].join('');

    const result = upgradeRequirementsContent('ears-requirements-syntax-guide', source);
    expect(result).toContain('EARSを実務で使う際の限界');
    expect(result).toContain('自然言語要件の曖昧さを減らす');
    expect(result).toContain('情報の役割を分離');
    expect(result).toContain('IEEE RE 2009');
  });

  it('turns the requirements process into a feedback loop', () => {
    const source = [
      section('要件定義は "工程" ではなく "対話" である'),
      section('全体フロー：5フェーズの俯瞰'),
      section('フェーズ3：要求収集とユーザーストーリー化'),
      section('フェーズ5：要件定義書の作成とレビュー'),
      section('要件定義で失敗しないチェックリスト'),
      section('要件定義の予算・スケジュールとシステム開発全体の工程'),
      section('まとめ：要件定義は "対話の設計" である'),
    ].join('');

    const result = upgradeRequirementsContent('requirements-definition-process', source);
    expect(result).toContain('実装・テスト・顧客フィードバックを上流へ戻す');
    expect(result).toContain('顧客回答 → 変更案 → 人間による確認 → 正本へ反映');
    expect(result).toContain('Regression Test');
  });

  it('expands the template around distinct information roles', () => {
    const source = [
      section('「要件定義書、何から書き始めれば良いか分からない」を解決する'),
      section('要件定義書テンプレートの全体像'),
      section('ユーザーストーリーの書き方（実例付き）'),
      section('EARS記法の5パターン（実例付き）'),
      section('ユーザーストーリーとEARSの併用例'),
      section('失敗しない要件定義の進め方'),
      section('まとめ：要件定義は「ストーリー＋EARS」で曖昧さを潰す'),
      section('Beekleの進め方'),
    ].join('');

    const result = upgradeRequirementsContent('requirements-definition-template', source);
    expect(result).toContain('役割を分けて管理する10ブロック');
    expect(result).toContain('一枚の巨大な要件定義書にすべてを詰め込む問題');
    expect(result).toContain('未決事項・設計判断・変更履歴まで残す');
  });

  it('keeps RFP useful without assuming all details are fixed before procurement', () => {
    const source = [
      section('RFPとは何か'),
      section('RFPの骨格テンプレート（10章構成）', subsection('④ 機能要件')),
      section('まとめ：RFPは自社の意思の明文化である'),
    ].join('');

    const result = upgradeRequirementsContent('how-to-write-rfp', source);
    expect(result).toContain('RFPで詳細仕様を決め切る必要はない');
    expect(result).toContain('まだ決まっていないこと・ベンダーと相談したいこと');
    expect(result).toContain('ベンダー選定後は、RFPを要求・仕様・受入条件へ分解する');
  });
});
