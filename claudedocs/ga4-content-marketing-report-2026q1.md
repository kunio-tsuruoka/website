# Beekleコンテンツマーケティング 3ヶ月レポート

**期間**: 2026-02-01 〜 2026-04-30
**比較期間**: 2025-11-01 〜 2026-01-31
**対象**: GA4 property/355503040 (beekle.jp)
**作成日**: 2026-05-01

---

## 1. サマリー（結論先出し）

| 観点 | 結論 |
|---|---|
| 集客 | Organic Search が +34%（223→299セッション）でドライバー化。月次でも 64 → 117 → 119 と着実に積み上がり、コラム投資のSEO効果が出始めている |
| 質 | Organic は engagement rate 65%・平均5分滞在で直流入(36%/2.5分)を質で大きく上回る。コラム流入の「読まれている」事実は明確 |
| CV計測 | 致命的：keyEvents が全チャネル 0。GA4のキーイベント定義が抜けており、form_submit (6回/3人) も計測上CVとして扱われていない |
| CVファネル | form_start 107 → form_submit 6（完了率 約3%）。analytics-ga4.md で警告されている `contact_complete`/`generate_lead` イベントもGA4に届いていない |
| ツール | flow-mapper/story-builder/scope-manager 合計でわずか 11ユーザー（3ヶ月）。投資量に対して集客貢献は現状ほぼゼロ |

---

## 2. トラフィック全体（前期間比）

| チャネル | 当期セッション | 前期セッション | 増減 | engagement率 | 平均滞在 |
|---|---:|---:|---:|---:|---:|
| Direct | 475 | 440 | +8% | 36% | 2:31 |
| Organic Search | 299 | 223 | +34% | 65% | 4:58 |
| Referral | 56 | 25 | +124% | 79% | 7:43 |
| Organic Social | 2 | 0 | - | 50% | 1:07 |

- Organic Search の伸びは質を保ったままの純粋増（engagement率は前期65% → 当期65%で横ばい・PV/session も3.06で同水準）。母数が増えた = SEO資産が積み上がっている
- Referral の 124% 増は `web.yenta-app.com` 1ユーザーが33セッション踏んでいるノイズ寄り（除外すれば 25→23 で実質横ばい）
- Direct の伸びはブランド認知（社名指名・名刺・営業）由来。コンテンツマーケで動かせる領域ではない

### 月次のOrganic推移

| 月 | セッション | 前月比 |
|---|---:|---:|
| 2026-02 | 64 | - |
| 2026-03 | 117 | +83% |
| 2026-04 | 119 | +2% |

3月のジャンプが大きい。コラム公開のタイミングを特定して再現性を検証すべき。

---

## 3. コンテンツ別パフォーマンス（コラム）

### Top読まれているコラム

| URL | PV | UU | 平均UE時間 | 評価 |
|---|---:|---:|---:|---|
| /column (一覧) | 229 | 28 | 75秒 | 一覧→個別への動線として機能 |
| /column/project-management-complete-guide | 47 | 12 | 139秒 | ヘッドコンテンツ。投資継続 |
| /column/avoid-unused-system | 29 | 18 | 37秒 | 流入はあるが浅い → 改善余地 |
| /column/nqu29zwuq6 | 26 | 7 | 144秒 | 91%エンゲージで密度高 |
| /column/project-management-01 | 21 | 6 | 188秒 | 100%エンゲージで質MAX |
| /column/prevent-mismatch | 14 | 5 | 73秒 | LP流入で41分滞在のセッション有 |

### Search Console連携データ（GA4経由）

| ランディング | クリック | 表示 | CTR | 平均順位 |
|---|---:|---:|---:|---:|
| / | 64 | 259 | 24.7% | 2.4 |
| /members | 24 | 245 | 9.8% | 3.2 |
| /company | 22 | 627 | 3.5% | 3.0 |
| /services/ai-development/ | 6 | 614 | 0.98% | 31.5 |
| /column/progress-check-points | 3 | 86 | 3.5% | 7.0 |
| /column/avoid-unused-system | 2 | 37 | 5.4% | 6.3 |
| /column/project-management-complete-guide | 2 | 159 | 1.3% | 18.9 |

**注目**: /services/ai-development は 614表示で6クリック（CTR0.98%）、平均順位31位。AI開発系クエリで2〜3ページ目に乗り始めているが、まだ取りこぼし。1ページ目に押し上げれば月間クリック2〜3倍が見込める領域。

### 解釈

- コラムはSEO的に「種まき」フェーズ。順位 6〜26位の記事が多く、上位3位以内に入っているコラムはまだ無い
- ただし `project-management-complete-guide` のように指名読者のリピートで滞在質が高い記事は既に存在 → コンバージョン導線を強化する価値あり

---

## 4. ツール（/tools/*）の状況

| ツール | PV | UU | 総UE時間 |
|---|---:|---:|---:|
| /tools/flow-mapper | 103 | 3 | 48分 |
| /tools/story-builder | 56 | 4 | 9.6分 |
| /tools/scope-manager | 30 | 4 | 5.8分 |

合計UU 11人/3ヶ月。直近コミット `feat(cv): ツール3種にフローティングCTA追加` が入ったのは妥当な判断。ただしそもそも集客が無いので、フローティングCTA前にツールへの流入経路（コラム→ツール、検索流入）を作らないとCV源にはならない。

flow-mapper はUU3人で48分・103PV → 1人あたり16PV/30分以上の濃いユーザーがいる。少数のヘビーユーザーに刺さっているので、そのユーザー像を顧客像と一致させて前面に出す価値あり。

---

## 5. CV計測の致命的問題

### 問題1: GA4キーイベント未定義

全チャネルで `keyEvents = 0`。CLAUDE.md と `.claude/rules/gcp-workspace.md` に「SAは編集者ロール、Admin APIで keyEvents 作成可能」とある通り、設定する仕組みは整っているのに、実際には設定が抜けている。

### 問題2: contact_complete / generate_lead イベントが届いていない

`.claude/rules/analytics-ga4.md` に記載の通り、フォーム送信時に明示発火しているはずの `gtag('event', 'form_submit'/'generate_lead'/'contact_complete', ...)` が、eventName 一覧に `form_submit` (6) しか出てこない。

`generate_lead` と `contact_complete` が完全に欠落 → 二重保険として実装したはずの計測が実際は機能していない。analytics-ga4.md の "IIFE化されてwindow.gtagがundefined" 系の落とし穴を再度疑う必要あり。

### 問題3: フォーム完了率 約3%

- form_start: 107（62 + 43、`/contact/` と `/contact` の両方を別ページとして集計）
- form_submit: 6（unique users 3）
- 完了率 = 3/107 ≒ 2.8%

業界水準（B2B問合せフォームで20-30%）と比較して1桁低い。これは UX 問題というより、`form_submit` の発火条件 or `/thanks` 到達計測のどちらかが壊れている可能性が高い。実際の問合せ件数（Slack webhook 受信数）と突合すべき。

### 問題4: コラム→/contact 動線がほぼ未計測

コラム配下からの click イベントは全期間で2件のみ（/column/avoid-unused-system, /column/step-by-step-development から各1件）。これはコラムからCTAまでの誘導が実際に弱いのか、CTA計測が不足しているのかが不明。

---

## 6. 示唆と次のアクション（優先度順）

### P0: 計測の修復（これが直らないと他の判断ができない）

1. **GA4キーイベントを定義**: `form_submit`, `generate_lead`, `contact_complete` を Admin API で keyEvents 化（`.claude/rules/gcp-workspace.md` のSA + `analytics.edit` scopeで実行可能）
2. **gtag 発火検証**: `scripts/verify-contact-cv.mjs` を再実行し、3イベントが実際にdataLayerに積まれてGA4に届いているか確認。analytics-ga4.md の "IIFE化" 罠の再発を疑う
3. **Slack webhook 受信ログとGA4 form_submit を突合**: 「真のCV数」と「GA4で見えているCV数」の乖離を数値化

### P1: 効いている領域への増強投資

4. **/services/ai-development の SEO ブースト**: 614 imp / 平均順位31 は最大の伸び代。直近コミット `fix(seo): /services/ai-development の SEO meta と Service JSON-LD を強化` の効果を3〜4週間後に再計測
5. **Project Management 系コラム** に内部リンク網を作る: `project-management-complete-guide` (47PV) と `project-management-01` (21PV/100%エンゲージ) は読者の質が証明済み。関連コラム間のリンク強化で滞在 PV/session を伸ばす
6. **トップページのSEO最適化**: `/` は CTR 24.7% / 平均順位2.4で既に勝っている。ここを起点にしたサイト内回遊（/services/* と /column/* への誘導）を再設計

### P2: ツールの集客連結

7. **コラム → ツール の動線設計**: 例として `requirements-definition-process` 系コラム末尾に `/tools/scope-manager` への自然な誘導を埋め込む。`.claude/rules/microcms.md` の制約（`<a><code>` 不可など）に注意
8. **ツール3種にOG画像と検索流入用LP最適化**: 現状ツールは検索流入ゼロ。「業務フロー図 ツール」「ユーザーストーリー テンプレート」等の検索意図に合わせたmeta設計

### P3: 分析基盤

9. **`avoid-unused-system` の改善**: 18UU/29PVと流入はあるが engagement 47%・平均37秒。タイトルと本文の期待値ズレを疑う。Search Console で流入クエリを見て本文の冒頭を調整
10. **`/contact/` と `/contact` の正規化**: 末尾スラッシュで2URL扱いになっている（form_start で 62 + 43 に分裂）。`.claude/rules/cloudflare.md` の通り `_redirects` でやってはいけないので、astro `trailingSlash` 設定 + canonical で寄せる

---

## 7. 見方の補足

- **「コンテンツマーケが効いているか」への端的な答え**: SEO資産としては効き始めている（Organic +34%、特に3月以降）。ただし最終CVへの貢献は計測壊れで証明できない状態。今期は「種まきが芽吹いた」フェーズ、効果検証は次の3ヶ月でCV計測を直してから判断するのが正解
- 直近のコミット履歴を見るとSEO/CV回りに継続的に手が入っている（`fix(seo): GSC 404 ドリルダウン`, `feat(cv): フローティングCTA`, `fix(seo): ai-development meta 強化`）— 方向性は正しい。ただし**P0の計測修復が後回しのまま施策を打ち続けるとROI判断ができない**ので、次のスプリントは計測修復を最優先で

---

## 付録A: データソース

- GA4 Data API: `mcp__ga4__run_report` (property/355503040)
- Search Console連携: `landingPagePlusQueryString` × `organicGoogleSearch*` メトリクス
- 分析時タイムゾーン: Asia/Tokyo
- 通貨: JPY

## 付録B: 計測仕様の参考

- `.claude/rules/analytics-ga4.md` — gtag IIFE問題、form_submit発火条件
- `.claude/rules/gcp-workspace.md` — GA4 Admin API による keyEvents 作成手順
- `.claude/rules/analytics.md` — GA4↔Search Console 連携で取得可能な指標
