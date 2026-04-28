# 引き継ぎプロンプト: コンテンツマーケティング戦略 v2.1 → 実装フェーズ

> 別セッションで使うプロンプト本体。下の `--- COPY START ---` から `--- COPY END ---` までを新セッションに貼り付けてください。

---

## --- COPY START ---

beekle.jp のコンテンツマーケティング戦略の続きをお願いします。前2セッションで戦略書 v2.1（DataForSEO月間SV反映版）とタスクリスト v2.1 まで完成しました。次は **実装フェーズ** に進みます。

## これまでの経緯（3セッション要約）

### セッション1（2026-04-28）: 戦略書 v1
- GA4実績 + 既存コラム棚卸ベースで初版作成（推測ベース）

### セッション2（2026-04-29 前段）: 戦略書 v2
- SC実データ（過去90日）を手動エクスポート: `~/Downloads/beekle.jp-Coverage-2026-04-29.zip`, `~/Downloads/beekle.jp-Performance-on-Search-2026-04-29.zip`
- 重大発見: インデックス率28.4%（Indexed 31 / Not indexed 78）, 5xx 22ページ, 404 31ページ
- v1 の優先度設定（PM最強・見積もりP2最優先）が実需と乖離 → 全面改訂
- 新クラスターF「CDP/データ分析基盤」をP1新設、AI受託をP1格上げ

### セッション3（2026-04-29 後段）: 戦略書 v2.1
- DataForSEO アカウント検証完了（balance $51）
- 3クラスター + 漏れKWの月間SV取得（CDP/AI/失敗予防/要件定義/PM/見積もり）
- 戦略書 v2 → v2.1 改訂、タスクリスト v2 → v2.1 改訂

## v2.1 で発覚した重要事実

1. **要件定義クラスターが実SV最大**: 「要件定義」12,100/月 + 「要件定義書」5,400 + 「要件定義書 サンプル」1,900。v2 ではP3扱いだったが **P1 に格上げ**
2. **SCのimpは部分一致拡張で過大**: SC で `cdp bi` 127imp が出ていたが実SV30。`BigQuery CDP` 73imp / SV20。**imp ベースで優先度を組むのは危険**
3. **「生成AI 受託開発」単独は SV30** で弱いが CPC$17.86 は最高水準。AIピラーは「AI受託開発(260)/AIシステム開発(480)/生成AI開発(390)/AI開発会社(260)」を一括カバーする包括語に変更
4. **失敗予防の主軸**: 「要件定義 失敗」(SV30) より「DX 失敗」(SV260)/「システム開発 失敗」(SV140) の方が3-5倍大きい → ピラーを `system-development-failure-cases` に変更
5. **「PMO とは」18,100, 「DX 推進」4,400 は据置**: 教育需要中心で B2BコーポサイトのCV意図と不一致

## 必読ドキュメント（読む順）

1. **戦略書 v2.1**: `claudedocs/content-marketing-strategy-2026-05.md` （特に §0 v2.1 改訂サマリ、§1.4 クラスター別実需、§7 KW月間SV データ）
2. **タスクリスト v2.1**: `claudedocs/content-marketing-tasks-2026-05.md` （特に §今やる、§P1b 要件定義ピラー、§P1c CDP/AI、§P2 失敗予防）
3. **既存ルール**:
   - `.claude/rules/microcms.md` - MicroCMS API gotchas
   - `.claude/rules/cloudflare.md` - Cloudflare Pages制約（`_redirects` の落とし穴）
   - `.claude/rules/analytics.md` - GA4↔SC連携メトリクス
4. **MCP 補助**: `~/.claude/projects/-Users-kunio-dev-website/memory/reference_dataforseo.md` - DataForSEO の検証ハマり

## 最初にやって欲しいこと

1. **MCP稼働確認**:
   - `ga4` connected
   - `dataforseo` connected（**検証完了済 2026-04-29**、balance $51。403 の主因はアカウント未検証だったが解消済）
   - `search-console` 未稼働（OAuth Workspace問題、手動CSV運用継続）

2. **戦略書 v2.1 とタスクリストを読む**

3. **git status を確認**してコミット未の差分を整理:
   - `M claudedocs/content-marketing-strategy-2026-05.md` (v2.1)
   - `?? claudedocs/content-marketing-tasks-2026-05.md` (v2.1)
   - `?? claudedocs/handoff-content-marketing-2026-04-29.md` (v2 引き継ぎ・旧)
   - `?? claudedocs/handoff-content-marketing-2026-04-29-v2.1.md` (本ファイル)
   - 他、scripts/ や drafts/ の作業中ファイル多数
   - **ユーザーに「これらをコミットするか」相談**してから進める

## このセッションのゴール（候補）

ユーザーと相談して、以下のいずれかから着手:

### A. 要件定義ピラー（P1b-req-1）構成案作成 — **v2.1 で最大ROI候補**
- `claudedocs/drafts/requirements-definition-complete-guide.md` に H1/H2/H3 構成案、文字数配分、内部リンク計画、FAQ、ターゲットKW（SV付き）を起こす
- SV: 要件定義(12,100) / 要件定義とは(6,600) / 要件定義書(5,400)
- Beekleの `/tools/story-builder` `/tools/scope-manager` への送客導線を組み込む
- 競合上位記事の構成分析を WebFetch で実施（検索: 「要件定義とは」「要件定義 進め方」上位5サイト）

### B. CDP リライト実装（P1a-2）
- 計画書 `claudedocs/drafts/cdp-page-rewrite.md` あり
- v2.1 注: H2/H3 を「CDPとは/構築/導入/比較」に再構成（旧計画の `cdp bi`/`bigquery cdp` 単位ではなく上位概念）
- `src/pages/services/cdp-development.astro` を編集

### C. P0 インデックス問題（5xx 22ページ）
- ユーザーが SC からCSVエクスポート済の場合、根本原因調査 → 修正
- 未エクスポートなら手順案内

### D. 競合上位記事の構成分析（横展開）
- 「要件定義」「CDPとは」「AI受託開発」上位5サイトを WebFetch で取得 → 戦略書のセクション構成案に追記

## DataForSEO の注意

- balance $51、検証済（2026-04-29）
- search_volume コールは **3-5秒間隔** を空ける（rate limit 403）
- 認証情報: `~/.claude.json` の dataforseo セクション（DATAFORSEO_USERNAME / PASSWORD）
- Rate limit に引っかかった場合は curl でフォールバック可能:
  ```bash
  curl -s -u "$USER:$PASS" -H "Content-Type: application/json" \
    -d '[{"keywords":[...],"location_name":"Japan","language_code":"ja"}]' \
    "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live"
  ```

## 取得済 KW SV データ（再取得不要）

戦略書 §7 に全量保存。必要な追加調査:
- 競合のSERP順位は未取得（DataForSEO `serp_organic_live_advanced` で取得可）
- Tavily/Playwright 系の MCP は未確認、必要なら起動確認

## 制約・前提

- 日本語コンテンツ優先のB2Bコーポレートサイト
- ターゲット: 情シス・PM・経営企画
- ユーザー設定: 絵文字を一切使わない（global memory）
- コラム公開時は `node scripts/generate-descriptions.mjs` で description 自動生成（OpenRouter Claude Haiku）

## 最終アウトプット（このセッション）

ユーザーが選んだ A/B/C/D に応じて:
- A: ドラフトファイル作成 → ユーザーレビュー → MicroCMS 公開タスクの準備
- B: PR作成 → デプロイ → SC再クロール
- C: 5xx修正PR → デプロイ → SC再検証
- D: 戦略書 §2 各クラスターセクションに「競合構成」サブセクション追記

戦略書 v2.1、タスクリスト v2.1 を読み込んでから、`git status` 確認 → ユーザーにコミットの是非と次の着手を相談してください。

## --- COPY END ---

---

## このプロンプトを使う流れ

1. このセッションを `/quit` または別ターミナルで起動
2. Claude Code を起動 → beekle.jp プロジェクトディレクトリで開始
3. `/mcp` で `dataforseo` `ga4` が `connected` か確認
4. 上の `--- COPY START ---` から `--- COPY END ---` までを貼り付け

## このセッション（v2.1）でやったこと（参考）

### KW調査結果のサマリ
- CDP: 「CDPとは」5,400 が圧倒的、ロングテールはSV小・統合判断
- AI: AIシステム開発480 / 生成AI開発390 / AI受託260＋CPC$9-17、ピラーH1包括語化
- 失敗予防: DX失敗260 / システム開発失敗140 が主軸、要件定義失敗30 は副次
- 要件定義（漏れ）: 12,100 + 5,400 + 1,900 で総需要25,000+/月、P1新設

### 戦略書 v2.1 の主な変更
- §0 v2.1 改訂サマリ追加
- §1.4 クラスター実需テーブルに「v2.1評価（SV）」列追加
- §2.2 要件定義クラスターを新設（最上位）
- §2.3 CDP のロングテール独立記事を統合・削減
- §2.4 AI ピラーH1 を包括語化、AIコンサル/PoC等を追加
- §2.5 失敗予防の主軸を DX/システム開発失敗 に変更
- §2.6 PM クラスターに PMO除外の根拠追記
- §3 実装フェーズに P1c 追加（CDP/AI、要件定義の後段）
- §5 やらないことリストに PMO/DX推進/AIコンサル/CDPロングテール独立記事 を追加
- §7 KW月間SVデータ全量保存（参考用）

### タスクリスト v2.1 の主な変更
- フェーズ構成: P1a → P1b（要件定義） → P1c（CDP/AI） → P2 → P3
- P1b 要件定義ピラー新設（4記事候補）
- P1c CDP/AI のSV付きKW候補テーブル追加、ロングテール独立記事を削除
- P2 失敗予防の主軸を `system-development-failure-cases` ピラーに変更
- 今やるセクションを v2.1 用に更新
- MCP稼働状況: DataForSEO 検証完了に更新

---

*v2.1 引き継ぎ生成: 2026-04-29 後段 / DataForSEO SV取得完了後*
