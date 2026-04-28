# `/services/cdp-development/` リライト計画

**作成**: 2026-04-29
**対象**: `src/data/service.ts` lines 103-228（id: `cdp-development`）+ `src/pages/services/[id].astro`
**現状**: 636 imp / pos 39.7 / **0 click**（過去90日 SC）
**目標**: pos 15 以内 / 月20 click

---

## 現状分析（What's Wrong Today）

### 1. Title/Description にターゲットクエリが含まれていない

| 項目 | 現状 | 問題 |
|---|---|---|
| `title` | "CDP構築・顧客データ基盤開発" | 抽象的。「BigQuery」「コンポーザブル」「BI」「分析基盤」が一切無い |
| `seoTitle` | **未設定**（`title` が使われる） | SC上位クエリと一致しない |
| `description` | "散らばった顧客データを一箇所に集め…" | 同上、検索クエリ未含有 |
| `seoDescription` | **未設定** | 同上 |

### 2. H2 構造がクエリ無視

- 現状: PAIN POINTS / SOLUTIONS / CASE STUDIES / FEATURES / FAQ の汎用テンプレート
- 「コンポーザブルCDP」「BigQuery CDP」「マーケティング データ分析 基盤」「CDP分析」等のクエリに対応する H2 が無い

### 3. FAQ が薄い（4件）

- 現状の4Q は社内目線（期間/データソース/専門家不在/GA4比較）
- People Also Ask 想定の検索者目線クエリ（CDP vs DMP / コンポーザブルCDPとは / BigQueryでCDPを作るメリット 等）が欠落

### 4. 内部リンクが弱い

- 既存ローカルコンテンツ `src/content/columns/beekle-knowhow/01-cdp-development-guide.md`（129行のCDPガイド）が MicroCMS 未公開のためサイト上に存在しない
- `/case-studies` `/services/ai-development` への文脈的リンクなし

### 5. 副次: `/services/cdp-development` → 308 → `/services/cdp-development/`（要修正）

`claudedocs/sc-5xx-investigation-2026-04-29.md` 参照。canonical/sitemap と HTTP 配信が矛盾。本リライト時に同時対応。

---

## ターゲットクエリ（優先順）

| クエリ | 月間 imp | 現状 pos | 目標 pos | 狙うコンテンツ位置 |
|---|---:|---:|---:|---|
| cdp bi | 127 | 19.6 | 8 | 新H2「BigQueryで作るCDP × BI連携」 |
| マーケティング データ分析 基盤 | 76 | 40 | 15 | 新H2「マーケ分析基盤の比較（CDP/DMP/DWH/MA）」 |
| cdp 分析 | 75 | 58 | 20 | 新H2「CDPでできる顧客分析の代表5パターン」 |
| bigquery cdp | 73 | 41 | 15 | seoTitle・新H2・FAQ |
| cdp 顧客分析 | 52 | 56 | 20 | 新H2「CDPでできる顧客分析」内 |
| コンポーザブルcdp | 26 | 61 | 25 | 新H2「コンポーザブルCDPとは」+ FAQ |
| CDP構築 | (推定) | - | - | seoTitle、H1、本文全般 |

---

## リライト案

### A. メタ情報（`src/data/service.ts` への追加）

```ts
{
  id: 'cdp-development',
  title: 'CDP構築・顧客データ基盤開発',  // 既存維持（ヘッダーH1表示用）
  seoTitle: 'CDP構築サービス｜BigQueryで作るコンポーザブルCDPと顧客分析基盤',
  seoDescription:
    'BigQueryを基盤にしたコンポーザブルCDPの構築、BI連携、顧客分析環境までを一気通貫で支援。マーケティングデータ分析基盤を「使える状態」にするまで伴走します。',
  description: '散らばった顧客データを統合し、BigQuery×BIで「誰が優良顧客か・次に何を提案すべきか」が見える顧客データ基盤（CDP）を構築します。',  // クエリ含有版に微修正
  longDescription: /* 既存維持、または「コンポーザブルCDP」「マーケティングデータ分析基盤」等を文中に自然に挿入 */
  ...
}
```

### B. H2 構成の追加（既存セクションの間に挿入）

`src/pages/services/[id].astro` を CDP 専用に分岐させるか、`service.ts` に拡張フィールドを追加する。**推奨: `[id].astro` に CDP 分岐を入れず、`service.ts` の `additionalSections?: AdditionalSection[]` を新設して汎用化**（他サービスにも展開可能）。

**追加するセクション順**:

1. **既存** Hero
2. **既存** Overview
3. 🆕 **「コンポーザブルCDPとは：旧来のCDPとの違い」**（300-400字）
   - SaaS型CDP（Treasure Data等）vs コンポーザブル型（BigQuery等を組み合わせる方式）の比較表
   - 当社のスタンス: BigQuery基盤のコンポーザブル型
4. 🆕 **「BigQuery で作る CDP：BI 連携までの流れ」**（500字 + フロー図）
   - データソース → BigQuery → Looker Studio / Tableau の流れ
   - cv-card またはMermaidテーブルで可視化（`column-visuals.ts` の構造を流用検討）
5. 🆕 **「CDP でできる顧客分析の代表5パターン」**（各100字×5）
   - RFM分析、コホート分析、LTV予測、離脱予兆検知、ファネル分析
6. 🆕 **「マーケティング データ分析基盤 比較：CDP vs DMP vs DWH vs MA」**（比較表）
   - 既存の `01-cdp-development-guide.md` の該当セクションを抜粋してリライト
7. **既存** Pain Points
8. **既存** Solutions
9. **既存** Case Studies
10. **既存** Features
11. 🆕 **FAQ 拡張（4 → 9件）** — 下記 C 参照
12. **既存** CTA

### C. FAQ 拡張（4 → 9件）

既存4件は維持し、以下5件を追加:

```ts
faq: [
  // 既存4件...
  {
    question: 'コンポーザブルCDPと従来のCDPの違いは何ですか？',
    answer: '従来のCDP（Treasure Data、KARTE等）はSaaSとして「データ統合+分析+施策実行」を一体提供しますが、月額費用が高く（数十万〜数百万円/月）、内部仕様もブラックボックスです。コンポーザブルCDPは BigQuery などのクラウドDWHを基盤に、必要な機能だけを組み合わせて作る方式で、コストを1/3〜1/5に抑えつつ、データの所有権と拡張性を保てます。御社がデータを「使い倒す」前提なら、コンポーザブル型を推奨します。',
  },
  {
    question: 'なぜ BigQuery を CDP の基盤に使うのですか？',
    answer: 'BigQuery はサーバーレスでスケールし、ペタバイト級のデータでもSQLで即座に分析できます。Looker Studio との無料連携、Python（BigQuery ML）での高度分析、GA4 ・Google広告・Firebaseとのネイティブ連携など、マーケティング用途のエコシステムが整っているため、CDP基盤として現時点で最もコスパが高い選択肢です。',
  },
  {
    question: 'CDP と DMP・MA・DWH は何が違いますか？',
    answer: 'CDP は「個人を識別したファーストパーティデータの統合・分析基盤」、DMP は「セグメント化された匿名データを扱う広告配信向け基盤」、MA（Marketing Automation）は「メール・LINE等の施策実行ツール」、DWH（Data Warehouse）は「全社のデータ集積基盤」です。CDPはマーケティング用途に特化したDWHのサブセット、と捉えるとわかりやすいです。',
  },
  {
    question: 'CDP 構築の費用相場はどれくらいですか？',
    answer: 'コンポーザブルCDPの場合、初期構築費は規模により200万〜800万円が目安です。月額のクラウド利用料（BigQuery等）はデータ量により数千〜数万円。SaaS型CDPの月額（30万〜200万円）と比べて運用コストを大幅に圧縮できます。詳しくは見積もり診断ガイドをご覧ください。',
  },
  {
    question: '既に Treasure Data や KARTE を使っていますが、移行はできますか？',
    answer: '可能です。既存SaaS CDP の API 経由でデータをBigQueryに移行し、依存していた施策ロジック（セグメント定義、配信トリガー等）を順次リプレイス、SaaSとの並行運用を経てから完全移行する3段階アプローチを推奨しています。リスクを最小化しつつコスト構造を改善できます。',
  },
],
```

### D. 内部リンク計画

| リンク元 | リンク先 | アンカー位置 |
|---|---|---|
| 新H2「コンポーザブルCDPとは」 | `/column/cdp-complete-guide`（P1b-cdp-1 で公開予定） | 末尾「詳しい比較は CDP完全ガイド」 |
| 新H2「BigQuery で作る CDP」 | `/column/cdp-bi-integration`（P1b-cdp-2 で公開予定） | 「BI連携の詳細はこちら」 |
| 新FAQ「費用相場」 | `/column/estimate-complete-guide` | 「見積もり診断ガイド」 |
| Case Studies セクション | `/case-studies` | 「他の事例を見る」 |
| CTA前 | `/services/ai-development` | 「AIで CDP のデータをさらに活用する」 |

P1b-cdp-1/2 が公開されていない段階では、リンク先を一時的に `/column`（カテゴリページ）に向けるか、リンクを置かない（仮リンクにしない）。**推奨: P1b-cdp-1 公開後に内部リンクを実装する**（リライトを2フェーズに分割）。

### E. 構造化データ

既に `JsonLd` で Service / Breadcrumb / FAQPage が実装済。FAQを9件に増やすと自動的に FAQPage schema に反映される。**追加実装不要**。

### F. 308 末尾スラッシュ問題（副次対応）

リライト実装時に以下を試す:

1. `astro.config.mjs` の Cloudflare adapter オプションで `routes.strategy: 'include'` を確認
2. 効果なければ `public/_redirects` に `/services/:slug/  /services/:slug  301!` を追加（`!` はforce flag）
3. それでもダメなら `[id]/index.astro` 構造への移行を検討（破壊的、最後の手段）

**`_redirects` で末尾スラッシュ正規化を書く際は要注意**（`.claude/rules/cloudflare.md` の禁則）。書く場合は **正規化方向**（with-slash → without-slash）であることと、**ループしないこと** を本番デプロイ前にステージングで全URLクロール検証。

---

## 実装フェーズ分割

### Phase 1（このリライトで即実施）
- A. メタ情報（seoTitle / seoDescription / description 微修正）
- C. FAQ 拡張（5件追加）
- B の一部: 「コンポーザブルCDPとは」「BigQuery で作る CDP」「CDP でできる顧客分析」の3 H2 追加（既存 service.ts 構造のままテキスト追加）

### Phase 2（P1b-cdp-1 公開後）
- D. 内部リンク実装
- B. 残り「マーケ分析基盤 比較表」（既存ガイド記事から抜粋）

### Phase 3（時間ある時）
- F. 308 リダイレクト恒久対応
- OGP 画像更新

---

## 完了条件チェックリスト

- [ ] `service.ts` に `seoTitle` / `seoDescription` 追加
- [ ] `service.ts` の `description` をクエリ含有版に更新
- [ ] FAQ を 9件に拡張
- [ ] `[id].astro` または service.ts の構造拡張で「コンポーザブルCDPとは」「BigQuery で作る CDP」「CDP でできる顧客分析」H2 追加
- [ ] `bun check` パス
- [ ] `bun build` 成功
- [ ] ローカル `bun preview` で `/services/cdp-development` を実機確認
- [ ] PR 作成 → デプロイ → SC「URL検査」で再クロール依頼

---

## ハマりどころ

1. **`service.ts` 拡張時の型整合**: `ServiceDetail` 型に新フィールド追加する場合、既存の他5サービス分のオブジェクトに `?` または初期値が必要
2. **`[id].astro` を CDP 専用分岐させない**: 他サービス（ai-development 等）にも同じ手法を P1a-3 で適用する。汎用化を維持する
3. **MicroCMS との混同に注意**: column ページは MicroCMS 由来、services ページはローカル `service.ts` 由来。両者は別データソース
4. **`description` を変えたら OGP も再生成**: Astro Layout に渡している description が OGP description に使われている可能性。`src/layouts/layout.astro` を実装時に確認
