# 引き継ぎプロンプト（次セッション用）

以下を次の Claude セッションの最初のメッセージにそのまま貼ってください。

---

## コピペ用プロンプト

```
コンテンツマーケティング作業を引き継ぐ。

# 必読
1. claudedocs/content-marketing-tasks-2026-05.md の「▶ 今やる」を最初に読む
2. claudedocs/drafts/cdp-page-rewrite.md（前セッションで作成したリライト計画書）
3. claudedocs/sc-5xx-investigation-2026-04-29.md（5xx調査ログ）

# 前セッション（2026-04-29）の到達点
- P0-1 自前クロールパート完了: sitemap内51 URLは全て200/308/301、5xxゼロ。SCの22件は手動エクスポート待ち
- 副次発見: /services/* 全6本が `/`-付き 308 にリダイレクト中（canonical/sitemap/astro設定と矛盾）
- P1a-1 完了: CDPページリライト計画書をPhase1/2/3で分割設計
- 未実施: 競合上位10サイト構成分析（DataForSEO/Tavily 稼働状況の確認含む）

# 今セッションでやること（優先順）
1. **P1a-2: CDPページリライト実装 Phase 1**
   - 対象: src/data/service.ts の id:'cdp-development'（lines 103-228）
   - 実装内容（cdp-page-rewrite.md の Phase 1 セクション参照）:
     - seoTitle / seoDescription / description をクエリ含有版に更新
     - FAQ を 4件 → 9件に拡張（追加5件は計画書 C 節に下書き済）
     - H2 セクション3本を追加: 「コンポーザブルCDPとは」「BigQueryで作るCDP×BI連携」「CDPでできる顧客分析の代表5パターン」
   - 注意: src/pages/services/[id].astro は他5サービスでも共通利用。CDP専用分岐を入れず、service.ts のスキーマ拡張で対応する
   - ServiceDetail 型 (src/types/service.ts) を必要なら拡張

2. **検証**
   - bun check（Biome lint+format）
   - bun build（プロダクションビルド成功）
   - bun preview で /services/cdp-development をローカル目視確認
   - 構造化データ確認（FAQPage が9件分出ているか）

3. **デプロイ後**
   - SC「URL検査」で /services/cdp-development を再クロール依頼
   - 同じ手法を /services/ai-development に展開する計画書（P1a-3）を作成

# 次セッション以降に回すもの
- P1a-2 Phase 2: P1b-cdp-1（CDP完全ガイド記事）公開後の内部リンク実装
- P1a-2 Phase 3: 308末尾スラッシュ問題の恒久対応（Cloudflare adapter / _redirects 検証）
- P0-1 続き: ユーザーがSCから手動エクスポートしたCSVが claudedocs/sc-5xx-pages-2026-04.csv に入ったら P0-2 着手

# 守るべきルール（再掲）
- .claude/rules/cloudflare.md: _redirects で末尾スラッシュ正規化を書かない（書く場合は本番デプロイ前にステージングで全URLクロール検証）
- .claude/rules/microcms.md: columns API の category は単数値（文字列）。配列禁止
- service.ts 拡張時は他5サービスの型整合に注意（オプショナル `?` または初期値）
- description を変えたら src/layouts/layout.astro が OGP description にも使っている可能性ありなので確認

# 期待する成果物
- src/data/service.ts の差分PR
- 必要なら src/types/service.ts の型拡張
- 必要なら src/pages/services/[id].astro の汎用セクション描画ロジック追加
- ローカルで動作確認したスクリーンショットまたは bun preview 起動後のURL確認結果

まず claudedocs/content-marketing-tasks-2026-05.md と claudedocs/drafts/cdp-page-rewrite.md を読んで、Phase 1 の実装計画を3行程度に要約して提示してから着手してくれ。
```

---

## 補足メモ（プロンプト本体には貼らない）

- CDPページの SC 直近データ: 636 imp / pos 39.7 / **0 click**（過去90日）
- 上位ターゲットクエリ:
  - `cdp bi` (127imp / pos 19.6)
  - `マーケティング データ分析 基盤` (76imp / pos 40)
  - `cdp 分析` (75imp / pos 58)
  - `bigquery cdp` (73imp / pos 41)
  - `cdp 顧客分析` (52imp / pos 56)
  - `コンポーザブルcdp` (26imp / pos 61)
- 既存ローカルコンテンツ `src/content/columns/beekle-knowhow/01-cdp-development-guide.md`（129行）は MicroCMS 未公開。Phase 2 でMicroCMSに公開→内部リンク先になる予定
- DataForSEO MCP: `~/.claude.json` に登録済み・要 verification（メモリ参照: `reference_dataforseo.md`）
