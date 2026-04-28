# 引き継ぎプロンプト: コンテンツマーケティング戦略 v2 の補強と実装

> 別セッションで使うプロンプト本体。下の `--- COPY START ---` から `--- COPY END ---` までを新セッションに貼り付けてください。

---

## --- COPY START ---

beekle.jp のコンテンツマーケティング戦略の続きをお願いします。前のセッションで戦略書 v2 の改訂とタスクリスト化まで完了したので、次のフェーズに進みたい。

## 前セッションでやったこと（要約）

1. SC実データ（過去90日）を手動エクスポートして取得・分析
   - `~/Downloads/beekle.jp-Coverage-2026-04-29.zip`
   - `~/Downloads/beekle.jp-Performance-on-Search-2026-04-29.zip`
2. 重大発見:
   - **インデックス率28.4%（Indexed 31 / Not indexed 78）**
   - 5xx エラー22ページ / 404 31ページ
   - **`/services/cdp-development/` が 636imp / pos 39.7 / 0click** = 最大の機会損失
   - 戦略書v1の優先度（PM最強、見積もり/費用P2最優先）が実需と乖離
3. 戦略書を v2 に全面改訂
   - `claudedocs/content-marketing-strategy-2026-05.md`
   - 新クラスターF「CDP/データ分析基盤」をP1新設
   - AI受託開発をP1に格上げ
   - 見積もり/費用は「SEO比重↓ / CV補助維持」に再定義（量産は止めるが既存は維持）
4. タスクリスト作成
   - `claudedocs/content-marketing-tasks-2026-05.md`
   - フェーズP0〜P3、各タスク完了条件付き

## まだ調べていない（このセッションでやりたい）

戦略書 v2 はSC実データ（実際にインプレッションが出ているクエリ）だけで作っており、以下が未取得:

1. **月間検索ボリューム** — DataForSEO MCPで取れる
2. **検索トレンド/季節性** — Google Trends（Tavily経由でWeb検索 or 手動）
3. **競合上位サイトの構成分析** — Tavily / Playwright で取得
4. **関連クエリ展開** — DataForSEO の Related Keywords

これらを取得して、戦略書のCDP/AIクラスターのKW候補リストを **「既にimpがあるもの」+「潜在需要があるが未到達のもの」** の両軸で再構成したい。

## 最初にやって欲しいこと

1. **MCP稼働確認**: `/mcp` で以下を確認
   - `ga4` — connected であるべき（既に稼働実績あり）
   - `dataforseo` — connected か確認（前回登録は `~/.claude.json` で完了済み、Claude Code再起動で有効化されているはず）
   - `search-console` — 登録はあるが OAuth Workspace問題で connected でない可能性大、connected でなければ手動CSV運用継続

2. **戦略書とタスクリストを読む**:
   - `claudedocs/content-marketing-strategy-2026-05.md`
   - `claudedocs/content-marketing-tasks-2026-05.md`

3. **現状の git status 確認**:
   - 前セッション末で `M claudedocs/content-marketing-strategy-2026-05.md` と `?? claudedocs/content-marketing-tasks-2026-05.md` がコミット未
   - 私（ユーザー）と相談して、これらをまずコミットするかどうか決める

## このセッションのゴール

DataForSEO MCP を使って以下を取得し、戦略書とタスクリストに反映:

### A. CDPクラスター KW調査
これらのクエリの月間検索ボリューム + 関連KW展開:
- CDPとは / CDP 構築 / CDP 比較
- コンポーザブルCDP / Composable CDP
- BigQuery CDP / cdp bi
- マーケティング データ分析 基盤
- cdp 顧客分析 / cdp データパイプライン

### B. AIクラスター KW調査
- 生成AI 受託開発
- AI受託開発 / AI開発 受託
- AI開発 流れ / AIエージェント 受託

### C. 失敗予防クラスター KW調査
- 要件定義 失敗
- システム開発 失敗 事例
- 使われないシステム

### D. 既に圏内にあるクエリの SV 確認
SC上で既にimp/click取れているクエリの月間SVを確認して、ROI試算（順位5位想定で何クリック取れるか）

### E. 戦略書/タスクリストへの反映
1. KW候補テーブルに月間SVを追記
2. 想定流入の試算根拠を追加
3. 「ROI低すぎるクエリ」があれば施策から削除
4. 関連KWで漏れている重要クエリがあれば追加

## 制約・前提

- 日本語コンテンツ優先のB2Bコーポレートサイト
- ターゲット: 情シス・PM・経営企画
- DataForSEO は最低$1のデポジット必要（前セッションでアカウント作成済み、デポジット未確認）
- DataForSEO API は1リクエスト$0.0006〜なので予算内で十分カバー可能
- Claude Code は再起動済み前提

## 最終アウトプット

1. KW月間SVを反映した戦略書 v2.1 へのアップデート
2. タスクリストの「P1b 新規コラム」セクションのKW候補テーブル更新
3. 着手順位の再確認（最大ROIから着手）

戦略書とタスクリスト読んでから、`/mcp` 確認 → DataForSEO使って調査開始してください。

## --- COPY END ---

---

## このプロンプトを使う流れ

1. このセッションを `/quit`
2. Claude Code を起動 → beekle.jp プロジェクトディレクトリで開始
3. `/mcp` で `dataforseo` が `connected` か確認（してなければ Claude Code を再起動）
4. 上の `--- COPY START ---` から `--- COPY END ---` までを貼り付け
5. 必要に応じて DataForSEO のデポジット状況を伝える（$1 入れたか / まだか）

## 補足: DataForSEOデポジット手順

別セッション開始前にやっておくと話が早い:
1. https://app.dataforseo.com/billing/payments
2. クレジットカード追加
3. $1 以上 Top up
4. 完了したら新セッションでKW調査が即動く
