# CVポイント最適化プラン: サイト全体 + コラム記事

対象: beekle.jp
データソース: GA4 (90日 / 60日 / 30日) + 既存実装コード調査
作成: 2026-05-01

---

## 0. このドキュメントの目的

問い合わせCV（form_submit / generate_lead）が **3ユーザー / 90日** に留まっており、トラフィック増（4月末コンテンツ投入後ピーク 27 sess/日）に対してCVRが追従していない。原因を計測層・サイト層・記事層に分解し、**手を動かす単位の改善タスク**まで落とす。

数字を増やすための施策ではなく、**現在取りこぼしている確実なCVを拾う**ことを優先する。

---

## 1. 現状ファネル（実測）

### 1.1 90日サマリ

| 段階 | 値 | 備考 |
|---|---:|---|
| 総ユーザー | 587 | |
| /contact 系 PV ユーザー | 約51 | `/contact` + `/contact/` 合算 |
| form_start ユーザー | 103 | |
| form_submit ユーザー | **3** | 6イベント |
| ユーザーベースCVR | **0.51%** | 全体 |
| form_start→submit CVR | **約2.9%** | BtoB目安 5-10% に対し低い |

### 1.2 ページ別 form_start / form_submit（60日）

| パス | form_start | form_submit | 観察 |
|---|---:|---:|---|
| `/contact` | 31 (28u) | **6 (3u)** | submit はここに集中 |
| `/contact/` | **36 (36u)** | **0 (0u)** | 4/27までの遺産（下記参照） |
| `/` | 2 | 0 | トップ直下フォームなし → 計測ノイズ |

**`/contact/` の謎 → 調査の結果 解明済み**:
- 当初「計測ロスの疑い」としていたが、調査の結果これは **過去設定の遺産** だった
- `astro.config.mjs` に `trailingSlash: 'never'` が入ったのは **2026-04-28 (commit 8d58c3d)**
- それ以前は `/contact` も `/contact/` も両方 200 で同じフォームを serve していた
- 4/28以降は Cloudflare Pages が `/contact/` → `/contact` に **HTTP 308** で恒久リダイレクト（実機確認済み）
- 実測: 4/28〜5/1 の `/contact/` への form_start は **1件のみ**（誤差レベル、ブラウザ履歴等の残骸）
- 本質は **「/contact/ 経由の36ユーザーが偶然全員submitしなかった」事実**であり、計測層の修復対象ではない

### 1.3 高エンゲージ記事（60日）

| 記事 | sess | PV | 平均滞在 | bounce | 評価 |
|---|---:|---:|---:|---:|---|
| `/column/project-management-complete-guide` | 32 | 47 | **1671s** | 22% | 最大の温度感 |
| `/column/nqu29zwuq6` | 22 | 26 | 1005s | 9% | 温度高 |
| `/column/project-management-01` | 13 | 21 | 1125s | 0% | 温度高 |
| `/column/avoid-unused-system` | 16 | 25 | 411s | 50% | 中 |
| `/tools/flow-mapper` | 10 | 103 | **2907s** | - | 異常に高い操作時間 |

→ 記事側に「読み込んでいるが /contact に到達しない層」が存在。

---

## 2. 改善ポイント分解

### 2.1 計測層（着手最優先）

| # | 課題 | 仮説 | 対応 |
|---|---|---|---|
| ~~M1~~ | ~~`/contact/` の form_submit ゼロ~~ | trailingSlash 統一前の遺産 | **対応不要**（4/28に解消済み・上記1.2参照） |
| **M2** | form_start CVR を CTA 単位で見られない | CTA クリックに `click` イベントが乗っていない（90日で `click` 3件のみ） | 全 CTA に `data-cta-id` を付与し、`gtag('event','cta_click', { cta_id, source_path })` を発火。`src/lib/cta-tracking.ts` に集約 |
| M3 | generate_lead の取りこぼし懸念 | `analytics-ga4.md` の既知ルールどおり sendBeacon タイミング問題 | 既に対応済み（4/29 実装）。直近30日で再検証のみ |
| **M4** | 記事 → contact の経路が紐づかない | UTMもなく source/intent パラメータも未付与（フォーム側は受信実装済み） | 記事内CTAリンクを `/contact?source=column-<slug>&intent=<cluster>` で生成 |

### 2.2 サイト層

| # | 課題 | 対応 |
|---|---|---|
| S1 | /contact フォームの送信ボタンしか「最終CTA」がない | フォーム上部に **「メールで直接送る」`mailto:`** と **「Google Meet 候補日を選ぶ」（Calendar 予約リンク）** を併設し3ルート化 |
| S2 | 必須フィールドが「種別 / メール / 本文」の3つだが、本文プレースホルダが重い（"課題・規模感"） | プレースホルダを「ひとことで構いません（例: 〇〇を相談したい）」に変更。下の補足文と一体化 |
| S3 | 営業お断りの amber ボックスがフォーム直下で重い印象 | フォーム送信成功時のサンクスページか、フォームの一番下＋折り畳みデフォルト closed のままでOK（現状OK、変更不要） |
| S4 | /tools/* の滞在時間が異常に長い（flow-mapper 2907s）が CTA 観測なし | 既に「フローティングCTA」追加済（commit 55ee9d0）。**ツール完了時イベント**（保存/エクスポート押下）を `tool_complete` として送り、それに紐づくCV率を測定 |
| S5 | /services/cdp-development/ が SC で 636 imp / 0 click（pos 39.7） | これはCV最適化ではなくSEO起点。content-marketing-strategy-2026-05.md の P0 として既出のため、本書では追わない |

### 2.3 記事層

| # | 課題 | 対応 |
|---|---|---|
| A1 | `{{CONTACT_CTA}}` マーカーは導入済（feedback memory にあり）だが、記事内の **配置箇所が末尾1箇所のみ** | 高滞在記事（PMコンプリートガイド等）には **冒頭サマリ後 + 中盤 + 末尾** の3箇所に挿入 |
| A2 | CTA文言がクラスター不問で同一 | クラスター別に `CONTACT_CTA_PM` / `CONTACT_CTA_AI` / `CONTACT_CTA_CDP` を `column-visuals.ts` に追加。関連サービスへの導線文言を変える（PM記事 → 「プロジェクト立て直し相談」、AI記事 → 「AIエージェント開発相談」） |
| A3 | source/intent パラメータが付いていない | A2 のCTAリンクを `/contact?source=column-<slug>&intent=<cluster>` で生成 |
| A4 | 記事末尾「関連記事」が無い記事が多く、回遊が contact に流れない | 同クラスター内の上位3記事を末尾に出すコンポーネント化（既存 column 詳細ページに差し込み） |
| A5 | ツール記事への動線が記事内にない | PM/要件定義クラスターの記事末尾に「**実際にツールで試す**」リンクで /tools/scope-manager や /tools/story-builder を提示。ツール側のフローティングCTA経由で contact へ |

---

## 3. 実行順序（依存関係ベース）

### Phase 1（計測の基盤整備）— ここから他の効果測定が成立する

1. ✅ **M2 (済 2026-05-01)**: 全CTAに `data-cta-source` + `data-cta-id` 付与、`?source=` クエリ含む `/contact` href、Layout共通の click delegation で `cta_click` を一元発火。新規instrument 17箇所 (Header×2, Home×2, Prooffirst×4, Services×2, Members, Strengths, Testimonial, Case-studies, Column一覧, Materials, QA×2, Checklists, 404)。Playwright で全件発火確認済み
2. ✅ **M4 (済 2026-05-01)**: source/intent/phase ボキャブラリを `claudedocs/cta-param-vocab.md` に確定。既存 source 21値・intent 4値・phase 3値 を集約、命名NG例と追加チェックリストも明記
3. **M3**: 直近30日で `generate_lead` と `form_submit` の件数差をチェック（差が大なら追加調査）

### Phase 2（記事層・低リスク高ROI）

4. ✅ **A2 + A3 (済 2026-05-01)**: `{{CONTACT_CTA}}` マーカーを記事ごとの `source=column-<slug>&intent=article-final` 付き動的HTMLに変更。`{{CONTACT_CTA_MID}}` (intent=article-mid) も追加。Layout側 click delegation で自動計測される
5. ✅ **A1 (済 2026-05-01)**: 高滞在Top5記事 (`project-management-complete-guide` 1671s, `project-management-01` 1125s, `nqu29zwuq6` 1005s, `estimate-complete-guide` 615s, `progress-check-points` 564s) のMicroCMS本文中央 h2 直前に `{{CONTACT_CTA_MID}}` を挿入。`scripts/insert-mid-cta.mjs --apply` で5/5更新完了、ローカルで動的展開 + cta_click発火を確認。末尾CTAは [...slug].astro:387 の固定セクションが既に担うため重複させず
6. ✅ **A4 (既存)**: 関連記事セクションは [...slug].astro:303-369 に既に存在

### Phase 3（サイト層）

7. **S1**: /contact に Meet 予約リンク + mailto 併設（3ルート化）
8. **S2**: フォーム本文プレースホルダ軽量化
9. **S4**: ツール `tool_complete` イベント発火

### Phase 4（観測と打ち返し）

10. Phase 1-3 完了から30日のデータで以下を見る:
    - `cta_click` → form_start CVR（クラスター別）
    - source パラメータ別の form_submit
    - Meet予約ルートの利用率（mailto/フォームとの分岐）
11. 効果のないCTA文言は廃止、効果出ているクラスターに偏らせる

---

## 4. 成功基準

| 指標 | 現在 | 目標（Phase 1-3 完了後） |
|---|---:|---:|
| form_start ユーザー / 月 | 約34 | 50+ |
| form_start → submit CVR | 2.9% | 5%+ |
| /contact/ form_submit | 0 | 計測ロス解消で実数化 |
| 記事 → /contact 遷移 user | 不明（計測未） | 全PV比 5%+ |
| Meet予約ルート CV | 0 | 月1件+ |

絶対数のリード件数目標は traffic 不確実性が高いので置かない。**「測定可能なCV経路を増やす」と「ロストを止める」**が本質。

---

## 5. やらないこと（明示）

- A/Bテストツール導入（母数が小さすぎて統計的有意に至らない）
- フォームを複数ステップ化（離脱増のリスクが大）
- ライブチャット導入（運用コスト > リード価値、現フェーズでは未対応）
- ポップアップ式 exit-intent CTA（UX劣化、信頼を損なう）

---

## 6. オープン項目

- Google Calendar の予約リンクを誰のカレンダーに紐づけるか（営業窓口の確定が必要）
- クラスター別 CTA 文言の確定（執筆判断）
- ツール `tool_complete` の定義（保存・エクスポート・両方？）

これらは決まり次第本書に追記する。
