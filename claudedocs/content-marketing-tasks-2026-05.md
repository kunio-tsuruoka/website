# コンテンツマーケティング タスクリスト（v2.1 戦略書ベース）

**作成**: 2026-04-29 / **v2.1 更新**: 2026-04-29 後段
**戦略書**: `claudedocs/content-marketing-strategy-2026-05.md` (v2.1)
**前提データ**: SC Performance/Coverage 2026-04-29 エクスポート + GA4 + DataForSEO 月間SV (2026-04-29)

> **v2.1 主要変更**: 要件定義クラスターをP1新設（SV最大）、CDPロングテール独立記事を統合、AIピラーH1包括語化、失敗予防主軸を「DX/システム開発失敗」に変更

---

## 📌 別セッションで引き継ぐときの読む順番

1. このファイル冒頭の「現状サマリ」と「フェーズ構成」を読む
2. **「今やる」セクション** で次に着手すべきタスクを確認
3. 戦略書 `content-marketing-strategy-2026-05.md` で背景を補足
4. 必要なら下記「参照データ」のCSVを再エクスポート（最新化）
5. 着手するフェーズの該当セクションへ

---

## 現状サマリ（2026-04-29時点）

| 指標 | 値 | 出典 |
|---|---:|---|
| インデックス率 | 28.4%（Indexed 31 / Not indexed 78） | SC Coverage |
| 過去90日 総クリック | 143 | SC Performance |
| 過去90日 総表示 | 3,299 | SC Performance |
| 平均CTR | 4.33% | SC Performance |
| 平均順位 | 20.07 | SC Performance（JPのみ） |
| 5xx エラーページ | 22 | SC Coverage Critical |
| 404 エラーページ | 31 | SC Coverage Critical |

**最大の機会損失**: `/services/cdp-development/` 636imp / pos 39.7 / 0click（CDPクラスター全体で552 imp）

---

## フェーズ構成（v2.1）

| Phase | 内容 | ゲート（次フェーズ進行条件） |
|---|---|---|
| **P0** | インデックス土台修復 | インデックス率 50%超 / 5xx ゼロ |
| **P1a** | 既存トラフィック資産の即効化（CDP/AI サービスページ） | 各サービスページ pos 15以内 |
| **P1b** | **要件定義ピラー量産（v2.1で最上位）** | ピラー＋テンプレ2本公開 |
| **P1c** | CDP/AI 新規コラム量産 | CDPピラー＋AIピラー公開 |
| **P2** | 失敗予防クラスター（DX/システム開発失敗ピラー） | 「DX 失敗」5位以内 |
| **P3** | 補強・拡張（PMリライト、見積もり/費用品質維持、note転載等） | KPI達成 or 90日経過 |

---

## ▶ 今やる: 次に着手するべき1〜3タスク（v2.1）

> 着手後はこのセクションを書き換えて、次の優先タスクに更新する

1. **[P0-1 / ユーザー手動・継続]** SC「Server error (5xx)」詳細画面からCSVエクスポート → `claudedocs/sc-5xx-pages-2026-04.csv` に保存。調査ログ: `claudedocs/sc-5xx-investigation-2026-04-29.md`
2. **[P1a-2 / 次の Claude セッション]** CDPページリライト実装（Phase 1: メタ情報＋FAQ拡張＋3H2追加）。計画書: `claudedocs/drafts/cdp-page-rewrite.md` 。**v2.1 注**: H2/H3を「CDPとは(SV5,400)/CDP 構築(110)/CDP 導入(90)/CDP 比較(90)」に再構成（旧計画の `cdp bi`/`bigquery cdp`/`cdp 顧客分析` 単位ではなく上位概念で取る）
3. **[P1b-req-1 / v2.1新設・最大ROI]** `requirements-definition-complete-guide`（要件定義ピラー）の構成案作成 — SV12,100/月 + Beekleの `tools/story-builder` 連動

### 直近セッションの進捗（2026-04-29）
- `[P0-1] 自前クロールパート` 完了: sitemap内51 URLは全て200/308/301、5xx ゼロ。22 URLは sitemap外（手動エクスポート必須）
- `[P1a-1]` 完了: CDPリライト計画書 `claudedocs/drafts/cdp-page-rewrite.md` 作成（Phase 1/2/3 分割案）
- `[副次発見]` `/services/*` 全6本が `/`-付き 308 へリダイレクト中（canonical/sitemap と矛盾）→ P1a-2 で修正候補
- `[未実施 / 次セッション]` 競合上位10サイト構成分析（DataForSEO/Tavily未稼働の可能性、要確認）

---

## P0: インデックス土台修復（最優先）

> なぜ最優先: 71.6%のページが未インデックス。新規記事を増やしても検索結果に出ない。

### P0-1: 5xx エラー22ページの一覧取得
- [ ] SC画面「ページのインデックス登録」→「Server error (5xx)」をクリックして対象URLリストを取得
- [ ] CSVエクスポート → `claudedocs/sc-5xx-pages-2026-04.csv` に保存
- [ ] 完了条件: 22個のURLが特定されている

### P0-2: 5xx の根本原因調査
- [ ] 各URLを `curl -i` で叩いて再現確認
- [ ] 再現するなら Cloudflare Pages の Functions ログ確認: `npx wrangler pages deployment tail` または管理画面
- [ ] 共通パターンを特定（特定パス、特定パラメータ、特定User-Agent）
- [ ] GA4の「ページパス」レポートで該当URLの直近トラフィック確認
- [ ] 完了条件: 原因仮説が立っている（コード上のバグ / 環境変数 / DB接続 など）

### P0-3: 5xx の修正
- [ ] 仮説に基づき修正コミット
- [ ] ステージング → 本番デプロイ
- [ ] SC「修正を検証」ボタンで再クロール依頼
- [ ] 完了条件: SC Coverage で 5xx が0件

### P0-4: 404 ページ31の整理
- [ ] SC画面「Not found (404)」リストをエクスポート
- [ ] 旧スラッグなら `public/_redirects` に301追加（既存ルール参照）
- [ ] 削除済みなら sitemap.xml から除外確認
- [ ] 完了条件: SC Coverage で 404が10件以下

### P0-5: sitemap.xml 整備
- [ ] 現在のsitemap内容確認: `curl https://beekle.jp/sitemap-index.xml`
- [ ] 全コラム・サービスページ・ツールページが含まれているか
- [ ] `astro.config.mjs` の `@astrojs/sitemap` 設定確認
- [ ] SCに再送信（送信済みでも更新トリガになる）
- [ ] 完了条件: sitemap が全公開ページを網羅 / SC「最終クロール」が直近

### P0-6: noindex 2ページの確認
- [ ] SC画面「Excluded by 'noindex' tag」リスト取得
- [ ] 意図的なら維持、意図せずなら該当ページの `<meta name="robots">` 修正
- [ ] 完了条件: 全2ページの意図確認済み

**P0完了ゲート**: インデックス率50%超 + 5xx 0件 → P1へ進行

---

## P1a: 既存トラフィック資産の即効化

> なぜ: 新記事より、既に表示数のあるサービスページの順位を上げる方が早い・確実。

### P1a-1: `/services/cdp-development/` リライト計画
- [ ] 現状確認: `src/pages/services/cdp-development.astro` を読む
- [ ] 上位競合調査（DataForSEO MCP or Tavily で「CDP 構築」「コンポーザブルCDP」上位10サイトの構成分析）
- [ ] H2/H3 案作成 — 必須含めるクエリ:
  - cdp bi (127imp / pos 19.6)
  - マーケティング データ分析 基盤 (76imp / pos 40)
  - cdp 分析 (75imp / pos 58)
  - bigquery cdp (73imp / pos 41)
  - cdp 顧客分析 (52imp / pos 56)
  - コンポーザブルcdp (26imp / pos 61)
- [ ] FAQ ブロック設計（People Also Ask 対策）
- [ ] 内部リンク計画: `/services/ai-development/` `/case-studies` から流す
- [ ] 完了条件: リライト案ドラフトを `claudedocs/drafts/cdp-page-rewrite.md` に保存

### P1a-2: `/services/cdp-development/` リライト実装
- [ ] H2/H3 反映
- [ ] 構造化データ（Service / FAQPage）追加
- [ ] meta title / description 最適化（クエリ含有 + 魅力訴求）
- [ ] OGP 画像タイトル更新
- [ ] 完了条件: PR作成 → デプロイ → SC「URL検査」で再クロール

### P1a-3: `/services/ai-development/` リライト計画
- [ ] 現状: 630imp / pos 30.4 / 6click
- [ ] 必須含めるクエリ:
  - 生成ai 受託開発 (125imp / pos 13.8)
  - ai 受託開発 (101imp / pos 38)
  - ai 開発 受託開発 流れ (31imp / pos 9 ← 既に圏内、惜しい)
  - 受託開発 ai (50imp / pos 36)
- [ ] 「AI開発フロー図解」セクション追加（pos 9 のクエリを5位以内に）
- [ ] 完了条件: ドラフト `claudedocs/drafts/ai-development-page-rewrite.md`

### P1a-4: `/services/ai-development/` リライト実装
- [ ] (P1a-2と同じ流れ)
- [ ] 完了条件: デプロイ完了 + SC再クロール

### P1a-5: トップページ・/prooffirst の title/description 最適化
- [ ] 「ゼロスタートとは」156imp / CTR 0% 問題の対策
- [ ] `/prooffirst` のtitle/descriptionを「ゼロスタートとは」クエリ意図に合わせて魅力化
- [ ] トップページのdescriptionも見直し
- [ ] 完了条件: A/Bできないので、変更後30日でCTR比較

### P1a-6: 構造化データの全ページ展開
- [ ] 全コラムに `Article` schema
- [ ] FAQ含むページに `FAQPage` schema
- [ ] パンくず `BreadcrumbList`
- [ ] 既存実装の確認: `src/layouts/` `src/components/` でJSON-LDの有無
- [ ] Google Rich Results Test で検証
- [ ] 完了条件: 主要ページ全てで構造化データ検出

**P1a完了ゲート**: CDP/AIサービスページがpos15以内 → P1bへ

---

## P1b: 要件定義ピラー量産（v2.1 で新設・実SV最大）

> なぜ最優先: 「要件定義」**12,100/月** + 「要件定義書」5,400 + 「要件定義書 サンプル」1,900 で総需要 25,000+/月。Beekleの `/tools/story-builder` `/tools/scope-manager` への送客導線として完全に整合。

### KW候補テーブル（SV付き）
| 記事スラッグ案 | 主要KW | SV | comp | CPC | 優先 |
|---|---|---:|---|---:|---|
| `requirements-definition-complete-guide`（ピラー） | 要件定義 / 要件定義とは / 要件定義書 | 12,100 / 6,600 / 5,400 | LOW | $2.49-3.00 | 🔴 |
| `requirements-definition-template` | 要件定義書 サンプル / テンプレート | 1,900 / 590 | LOW(6) | $2.49-3.77 | 🔴 |
| `requirements-definition-process` | 要件定義 進め方 / 要件定義 例 | 720 / 480 | LOW | $2.06-3.93 | 🟡 |
| `requirements-vs-requests` | 要求定義 要件定義 | 590 | LOW(2) | $1.22 | 🟢 |

### P1b-req-1: `requirements-definition-complete-guide`（ピラー）
- [ ] スラッグ: `/column/requirements-definition-complete-guide`
- [ ] H1案: 「要件定義とは — システム開発で失敗しない要件定義の進め方完全ガイド」
- [ ] 構成案:
  - 要件定義の定義（「要件定義とは」狙い）
  - 要件定義 vs 要求定義（「要求定義 要件定義」590KW吸収）
  - 進め方（手順）
  - 失敗事例とアンチパターン（「要件定義 失敗」30KW吸収）
  - テンプレートへのリンク（→ `requirements-definition-template`）
  - `tools/story-builder` 送客
  - FAQ（People Also Ask 対策）
- [ ] 文字数目安: 6,000〜10,000字
- [ ] 内部リンク: `/tools/story-builder` `/services/cdp-development/` `/services/ai-development/`
- [ ] 完了条件: MicroCMS公開 + 構造化データ + sitemap反映

### P1b-req-2: `requirements-definition-template`（テンプレ配布、リード獲得）
- [ ] 主要KW: 要件定義書 サンプル(1,900) / 要件定義書 テンプレート(590)
- [ ] 構成: テンプレート解説 → ダウンロードCTA（メアド取得）
- [ ] PDF/Excel テンプレ配布 → `/materials` ページ
- [ ] 完了条件: テンプレ完成 + リード獲得LP稼働

### P1b-req-3: `requirements-definition-process`
- [ ] 主要KW: 要件定義 進め方(720) / 要件定義 例(480)
- [ ] 構成: フェーズ別ステップ、サンプル成果物、チェックリスト
- [ ] 完了条件: 公開

**P1b完了ゲート**: ピラー＋テンプレ2本公開 → P1c へ

---

## P1c: CDP/AI 新規コラム量産

### CDPクラスター

#### KW候補テーブル
| 記事スラッグ案 | 主要KW | SV | CPC | 優先 |
|---|---|---:|---:|---|
| `cdp-complete-guide`（ピラー） | CDPとは / CDP 構築 / CDP 導入 / CDP 比較 | 5,400 / 110 / 90 / 90 | $1.44-6.41 | 🔴 |
| `composable-cdp-and-reverse-etl` | Composable CDP / Reverse ETL | 30 / 90 | $3.04-7.44 | 🟡 |
| ~~`cdp-bi-integration`~~ | (削除: ピラーに統合) | — | — | — |
| ~~`marketing-data-platform-comparison`~~ | (削除: ピラー比較セクションに統合) | — | — | — |

#### P1c-cdp-1: `cdp-complete-guide`（ピラー）
- [ ] スラッグ: `/column/cdp-complete-guide`
- [ ] H1案: 「CDPとは — 顧客データプラットフォームの構築・導入・比較完全ガイド」
- [ ] 主要KW: CDPとは(5,400) / CDP 構築(110) / CDP 導入(90) / CDP 比較(90)
- [ ] 構成案: 定義 → 種別（旧来CDP / Composable CDP / 顧客データ基盤） → 構築アプローチ（BigQuery基盤） → 導入プロセス → ベンダー比較 → 顧客分析ユースケース → FAQ
- [ ] FAQ で吸収: コンポーザブルCDP / cdp bi / cdp 顧客分析 / cdp データパイプライン / マーケティング データ分析 基盤
- [ ] 文字数目安: 6,000〜10,000字
- [ ] 内部リンク: `/services/cdp-development/` `/case-studies`
- [ ] 完了条件: 公開 + 構造化データ + sitemap反映

#### P1c-cdp-2: `composable-cdp-and-reverse-etl`
- [ ] 主要KW: Composable CDP(30) / Reverse ETL(90)
- [ ] 構成: コンポーザブルCDPの定義、Reverse ETLの役割、BigQuery + Census/Hightouch 等
- [ ] 完了条件: 公開

### AIクラスター

#### KW候補テーブル
| 記事スラッグ案 | 主要KW | SV | CPC | 優先 |
|---|---|---:|---:|---|
| `ai-development-services`（ピラー） | AI受託開発 / AIシステム開発 / 生成AI開発 / AI開発会社 | 260 / 480 / 390 / 260 | **$7.64-11.46** | 🔴 |
| `ai-development-process-guide` | AI 開発 流れ / 生成AI 導入 | 40 / 320 | $5.11-10.90 | 🔴 |
| `ai-poc-guide` | AI PoC | 140 | $4.56 | 🟡 |
| `generative-ai-development-cases` | 生成AI 受託開発 + 事例 | 30 | **$17.86** | 🟡 |

#### P1c-ai-1: `ai-development-services`（ピラー）
- [ ] スラッグ: `/column/ai-development-services`
- [ ] H1案: 「AI受託開発（生成AI・LLM・エージェント）完全ガイド — 開発の流れ・費用・事例」
- [ ] 主要KW: AI受託開発(260) / AIシステム開発(480) / 生成AI 開発(390) / AI 開発会社(260)
- [ ] 構成案: 定義（生成AI/LLM/AIエージェント含む） → 開発体制 → 開発フロー → 費用感 → 事例 → ベンダー選定 → FAQ
- [ ] FAQ で吸収: ChatGPT受託 / LLM受託 / AIエージェント受託 / 生成ai 受託開発(高CPC$17.86)
- [ ] 内部リンク: `/services/ai-development/` `/case-studies` `/column/requirements-definition-complete-guide`
- [ ] 完了条件: 公開

#### P1c-ai-2: `ai-development-process-guide`
- [ ] 主要KW: AI 開発 流れ(40) / 生成AI 導入(320)
- [ ] 既存 `ai-era-development-flow` をリライト or 新規
- [ ] 構成: 要件定義 → PoC → 開発 → 運用、各フェーズの成果物
- [ ] 完了条件: 公開

**P1c完了ゲート**: CDP/AI ピラー各1本＋関連各1本 → P2へ

---

## P2: 失敗予防クラスター順位上げ（v2.1 で主軸再設計）

> v2.1 変更: 主軸を「要件定義 失敗」(SV30)から **「DX 失敗」(SV260) / 「システム開発 失敗」(SV140) / 「DX 失敗事例」(SV140)** に変更。事例カタログ型構成。

### KW候補テーブル
| 記事スラッグ案 | 主要KW | SV | CPC | 優先 |
|---|---|---:|---:|---|
| `system-development-failure-cases`（ピラー） | DX失敗 / DX失敗事例 / システム開発失敗 / システム開発失敗事例 | 260 / 140 / 140 / 70 | $2.35-6.43 | 🔴 |
| `dx-failure-japan-cases` | DX 失敗事例 日本 + 国内事例 | 20 | — | 🟡 |
| `prevent-mismatch`（リライト） | 要件定義 失敗 / 要件定義 丸投げ | 30 / 50 | — | 🟢 |
| ~~`requirements-definition-failure-cases`~~ | (削除: ピラーへ統合) | — | — | — |

### P2-1: `system-development-failure-cases`（ピラー、新規）
- [ ] スラッグ: `/column/system-development-failure-cases`
- [ ] H1案: 「DX・システム開発の失敗事例10選 — 共通パターンと回避策」
- [ ] 主要KW: DX 失敗(260) / DX 失敗事例(140) / システム開発 失敗(140) / システム開発 失敗事例(70)
- [ ] 構成: 失敗パターン分類 → 国内事例カタログ（セブンイレブン/ヤマト等の検索ニーズに対応） → 共通根本原因 → 回避策 → 要件定義/PMリンク
- [ ] 完了条件: 公開 + 構造化データ

### P2-2: `prevent-mismatch` リライト
- [ ] 「要件定義 失敗」(SV30 / pos 9.5 / imp 13) を5位以内へ
- [ ] H1/H2 にクエリ含有
- [ ] 内部リンクで P1b-req-1 ピラーと P2-1 ピラーへ送客
- [ ] 完了条件: デプロイ + SC再クロール

### P2-3: `avoid-unused-system` 大幅リライト
- [ ] 「システム開発 失敗 事例」(SV70 / pos 57 / imp 18) を10位以内へ
- [ ] 事例ベース構成へ全面再構成（P2-1 ピラーへ集約してもよい）
- [ ] 完了条件: デプロイ

**P2完了ゲート**: 「DX 失敗」「システム開発 失敗」が10位以内 / 「要件定義 失敗」5位以内 → P3へ

---

## P3: 補強・拡張

### P3-1: PM クラスター軽リライト
- [ ] `project-management-complete-guide` を「システム開発 プロジェクト管理」(pos 17.8 / imp 30) で上位化するリライト
- [ ] 新規記事は追加しない（v1案は撤回）
- [ ] 完了条件: デプロイ

### P3-2: 見積もり/費用 既存記事の品質維持リライト
- [ ] `estimate-complete-guide` `system-development-cost-market` `system-development-budget-control` の3本
- [ ] 最新事例追加 + 構造化データ
- [ ] **新規記事は作らない**（CV補助として現状維持）
- [ ] 完了条件: 3本リライト完了

### P3-3: 見積もりホワイトペーパー化（リード獲得）
- [ ] `estimate-complete-guide` 系3本をまとめてPDF化
- [ ] タイトル例: 「システム開発見積もり比較チェックリスト」
- [ ] `/materials` ページに設置 + メールアドレス取得LP
- [ ] 完了条件: PDFダウンロード起点でCV1件以上

### P3-4: 内部リンク網の構築
- [ ] CDP/AI記事の終盤に「費用感はこちら」リンク → 見積もり記事へ
- [ ] 失敗予防記事の関連リンクに要件定義系を配置
- [ ] 完了条件: 全主要記事に最低3つの内部リンク

### P3-5: note転載パイロット
- [ ] CDP / AI ピラーから1本選んで note に30%抜粋＋本文リンク転載
- [ ] 完了条件: 1記事転載 + 流入計測

### P3-6: 業界メディア寄稿打診
- [ ] ITmedia / ZDNET Japan / EnterpriseZine などPM/DX系へ
- [ ] CDP関連の寄稿企画書作成
- [ ] 完了条件: 1社からポジティブ反応

---

## KPI 計測（90日後チェック）

| KPI | ベースライン（2026-04-29） | 90日後目標 | 計測方法 |
|---|---:|---:|---|
| インデックス率 | 28.4% | 70% | SC Coverage |
| 総クリック / 月 | ~48 | 150 | SC Performance |
| 総表示 / 月 | ~1,100 | 2,500 | SC Performance |
| 平均CTR | 4.33% | 5.5% | SC Performance |
| `/services/cdp-development/` クリック / 月 | 0 | 20 | SC Performance |
| `/services/ai-development/` クリック / 月 | 2 | 15 | SC Performance |
| 「要件定義 失敗」順位 | 9.5 | 5以内 | SC Performance |
| `/contact` クリック / 月 | 1.3 | 5 | SC Performance |

---

## 参照データ・ファイル

### SC エクスポート（手動取得・最新化推奨）
- `~/Downloads/beekle.jp-Coverage-2026-04-29.zip`
- `~/Downloads/beekle.jp-Performance-on-Search-2026-04-29.zip`
- 取得手順: SC画面 → エクスポート → CSV → このディレクトリに置く

### 関連ドキュメント
- 戦略書: `claudedocs/content-marketing-strategy-2026-05.md`
- GA4レポート: `claudedocs/ga4-report-2026-04.md`
- SEO/SC初期分析: `claudedocs/seo-search-console-2026-04.md`

### 既存ルール（必読）
- `.claude/rules/microcms.md` - MicroCMS API gotchas
- `.claude/rules/cloudflare.md` - Cloudflare Pages制約（特に `_redirects` の落とし穴）
- `.claude/rules/analytics.md` - GA4↔SC連携で取れるメトリクス
- `.claude/rules/astro.md` - SSR動的ルート
- `.claude/rules/components.md` - UIコンポーネント仕様

### MCP稼働状況（v2.1 更新 2026-04-29）
- ✅ GA4 MCP: 稼働中
- ✅ DataForSEO MCP: 稼働中（balance $51 / **アカウント検証済 2026-04-29**）。Rate limit回避のため search_volume コールは間隔を3-5秒空ける。**ハマり**: アカウント検証完了前は valid creds でも 40104 で 403 が返る（`reference_dataforseo.md` 参照）
- ❌ Search Console MCP: OAuth Workspace問題で未稼働 → 手動CSVエクスポート運用

---

## ⚠️ ハマりどころ（先人の教訓）

1. **Cloudflare Pages の `_redirects` で末尾スラッシュ正規化を書かない**
   - `/foo/  /foo  301` 形式を書くとサイト全体が404になる（2026-04-28 本番障害発生）
   - trailingSlash制御は `astro.config.mjs` の `trailingSlash: 'never'` + canonical で行う

2. **MicroCMS columns API**: `category` フィールドは単数値（文字列）。配列で送ると HTTP 400

3. **新コラム追加後**: `node scripts/generate-descriptions.mjs` でmeta description自動生成（OpenRouter Claude Haiku、`OPENROUTER_API_KEY` 必須）

4. **SSR動的ルート**: `[id].astro` `[...slug].astro` でSSRするには `export const prerender = false;` が必須

5. **Search Console MCPのSA追加**: 「Failed to add user: email not found」エラーが出ることがある（GoogleのUIバグ）。手動CSVで運用するのが現実的

---

## ✅ 完了したタスクのアーカイブ

完了次第ここに移動:

- _まだなし_
