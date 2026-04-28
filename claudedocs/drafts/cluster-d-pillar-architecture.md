# 要件定義クラスター: ピラー構成案（v2.1 P1）

## 目的

SV最大の「要件定義」(12,100/月) を中心に、ハブ&スポーク型のピラー記事群で **検討フェーズの主戦場** を取りに行く。Beekle のサービス境界（要件定義支援 + `/tools/story-builder` + `/tools/scope-manager`）と完全に一致するため、CV補助価値も最大。

## ハブ&スポーク図

```
                     [ ピラー: requirements-definition-complete-guide ]
                                   SV 12,100 + 6,600 + 5,400
                                   競合 LOW / CPC $2.49-3.00
                                              │
        ┌──────────────────┬──────────────────┼──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼                  ▼
   [テンプレート]      [進め方]           [要求vs要件]       [既存: EARS]       [既存: MoSCoW/FM]
   SV 1,900+590     SV 720+480         SV 590             ears-requirements   requirements-
   competition LOW  competition LOW    competition LOW    -syntax-guide       prioritization-
   CPC $2.49-3.77   CPC $2.06-3.93     CPC $1.22                              moscow-fm
        │                  │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼                  ▼
   [PDF/Excel DL]    [実プロジェクト       [用語ミスを       [EARS文法→         [MoSCoW優先順位
   メアド取得導線     例で5フェーズ        防ぎたい初学者     story-builder]    →scope-manager]
   →リード化]        構造化]              →ピラー誘導]
                                                                  │                  │
                                                                  └──────────────────┘
                                                                           ▼
                                                            [ 既存: user-story-template-examples
                                                              + ears-gherkin-workflow ]
                                                              (実装フェーズへの導線)
                                                                           │
                                                                           ▼
                                                            [ /tools/story-builder
                                                              /tools/scope-manager ]
                                                              CV: ツール体験 → 商談
```

## 4本の新規記事仕様

### 1. ピラー: `requirements-definition-complete-guide`

**狙うクエリ**: 要件定義(12,100) / 要件定義とは(6,600) / 要件定義書(5,400)

**記事タイプ**: 完全ガイド（5,000-7,000字）

**title案**:
- 要件定義とは？目的・進め方・要件定義書テンプレートまで完全ガイド【2026年版】

**meta description案**:
- 要件定義の目的、進め方、要件定義書の書き方をプロジェクト経験から解説。EARS記法・MoSCoW法・FMといった実務テクニック、テンプレート無料DL付き。

**H2構造**:
1. 要件定義とは何か（定義・目的・要求定義との違い）
2. なぜ要件定義で失敗するのか（DX失敗SV260への内部リンク）
3. 要件定義の5つのフェーズ（→ `requirements-definition-process` へ深掘り）
4. 要件定義書に書くべき項目（→ `requirements-definition-template` へ）
5. 要件の優先順位付け（→ 既存 `requirements-prioritization-moscow-fm`）
6. 要件の書き方ルール: EARS記法（→ 既存 `ears-requirements-syntax-guide`）
7. ユーザーストーリーで要件を明確化（→ 既存 `user-story-template-examples` + `/tools/story-builder`）
8. 要件定義のスコープ管理（→ 既存 `scope-management-fm-method` + `/tools/scope-manager`）
9. 要件定義の成果物チェックリスト
10. FAQ（要件定義 期間 / 要件定義 費用 / 要件定義 担当者 等のロングテール吸収）

**CV導線**:
- 中盤: テンプレートDL（`requirements-definition-template` 経由でリード化）
- 終盤: `/tools/story-builder` `/tools/scope-manager` 体験 → 「要件定義の相談」CTA

**構造化データ**: Article + FAQPage（H10セクション）

**競合分析メモ**:
- LOW(4-5) → 上位記事は IT用語辞典系の薄い解説が多い。Beekle は「実プロジェクトの失敗・成功例」を入れ込めば差別化容易
- 上位3-5位は IPA / @IT / TechAcademy → コーポレートサイトとして勝つには **「実務テンプレ＋ツール体験」** で勝負

---

### 2. テンプレート: `requirements-definition-template`

**狙うクエリ**: 要件定義書 サンプル(1,900) / 要件定義書 テンプレート(590)

**既存ドラフト活用**: `src/content/columns/beekle-knowhow/02-requirements-template-ears.md` を流用・強化

**記事タイプ**: テンプレ配布型（3,000-4,000字 + DL素材）

**title案**:
- 【無料DL】要件定義書テンプレート＋EARS記法とユーザーストーリーの実例集

**H2構造**:
1. なぜテンプレートが必要か（属人化・抜け漏れ防止）
2. 要件定義書テンプレート全体構造（10章立て）
3. 機能要件の書き方（EARS記法のフォーマット例）
4. 非機能要件の書き方（性能・セキュリティ・可用性）
5. ユーザーストーリーで要件を補強する実例
6. 優先順位付け（MoSCoW欄の使い方）
7. テンプレートのダウンロード（Word + Excel + Markdown）
8. 記入例 ＋ よくある記入ミス

**CV導線**:
- DL前にメアド取得（HubSpot/CRMフォーム）
- DL後フォローメールで `/services/ai-development/` `/services/cdp-development/` の事例紹介

**競合差別化**:
- 上位は IPA 公開テンプレ・無料サンプル集 → Beekle は「**EARS記法で書いた具体例**」「**ユーザーストーリーとセットの構成**」「**Excel記入支援**」で差別化

---

### 3. 進め方: `requirements-definition-process`

**狙うクエリ**: 要件定義 進め方(720) / 要件定義 例(480)

**記事タイプ**: 実例ベースのプロセス解説（4,000-5,000字）

**title案**:
- 要件定義の進め方｜実プロジェクト例で学ぶ5フェーズ完全ロードマップ

**H2構造**:
1. 要件定義の全体フロー（5フェーズ図解）
2. フェーズ1: ステークホルダー特定とゴール定義
3. フェーズ2: 業務フロー可視化（→ `/tools/flow-mapper` 体験）
4. フェーズ3: 要求の収集とユーザーストーリー化（→ `/tools/story-builder`）
5. フェーズ4: 要件の整理と優先順位付け（→ `/tools/scope-manager` + 既存 `requirements-prioritization-moscow-fm`）
6. フェーズ5: 要件定義書の作成とレビュー（→ `requirements-definition-template`）
7. 失敗するプロジェクトの典型パターン（→ 既存ドラフト `avoid-failure/04-dx-failure-patterns.md`）
8. FAQ: 期間・体制・必要なドキュメント

**CV導線**: 各フェーズで該当ツール体験に誘導 → 全フェーズ消化したら「無料相談」CTA

---

### 4. 補助: `requirements-vs-requests`

**狙うクエリ**: 要求定義 要件定義(590)

**記事タイプ**: 用語整理（2,000-2,500字、軽量）

**title案**:
- 要求定義と要件定義の違い｜混同しやすい3つのポイントと実例

**H2構造**:
1. 結論: 要求 = 「やりたいこと」、要件 = 「実装する条件」
2. 違い1: 主語（顧客 vs システム）
3. 違い2: 抽象度（What vs How to ensure）
4. 違い3: 検証可能性（曖昧 vs 測定可能）
5. 実例: 同じ要望が要求 → 要件 になる過程
6. 混同したまま進めるとどうなるか（再見積もり・スコープクリープ）
7. 次に読むべき: ピラー記事

**役割**: 用語混同で離脱しがちな初学者を捕捉してピラー記事に送る。低工数で書けるので最後に書く。

---

## 既存記事との連携設計

| 既存記事 | 連携方法 |
|---|---|
| `ears-requirements-syntax-guide` | ピラーのH6から内部リンク。EARS構文の詳細掘り下げ役 |
| `requirements-prioritization-moscow-fm` | ピラーのH5、進め方のフェーズ4から内部リンク |
| `scope-management-fm-method` | ピラーのH8、進め方のフェーズ4から内部リンク |
| `user-story-template-examples` | ピラーのH7、進め方のフェーズ3から内部リンク |
| `ears-gherkin-workflow` | ピラーのFAQから「テスト工程との連動」として内部リンク |
| `gherkin-bdd-introduction` | EARS記事と相互リンク（既に運用中なら現状維持） |

**重要**: 既存6本 + 新規4本 = **計10本の要件定義クラスター**。被リンクの蓄積で全記事の順位を底上げ。

## 内部リンク方針

```
/services/ai-development/ ─┐
/services/cdp-development/ ─┼─→ ピラー記事（"要件定義の相談はこちら"CTA）
/services/web-mobile-development/ ─┘
                                   │
                                   ▼
                          [ピラー記事] ⇄ [4本のスポーク]
                                   │              │
                                   ▼              ▼
                          [既存6本のEARS/MoSCoW/Story/Scope記事]
                                   │
                                   ▼
                          [/tools/story-builder, scope-manager, flow-mapper]
                                   │
                                   ▼
                          [/contact (相談)]
```

## 公開順序（依存関係ベース）

| 順 | 記事 | 理由 |
|---|---|---|
| 1 | テンプレ (`requirements-definition-template`) | 既存ドラフトあり、最速で公開可能、リード獲得を早期に開始 |
| 2 | ピラー (`requirements-definition-complete-guide`) | 1のDL導線を組み込んだ形で公開 |
| 3 | 進め方 (`requirements-definition-process`) | 1, 2 への内部リンクが必要 |
| 4 | 補助 (`requirements-vs-requests`) | 短く、最後にまとめて補完 |

## 成果指標（90日後）

| 指標 | 現状 | 目標 |
|---|---:|---:|
| クラスター記事数 | 既存6本 | 10本 |
| 「要件定義」関連クエリの月間 imp | 22 | **800+** |
| 「要件定義」関連クエリの月間 click | 0 | **30+** |
| ピラー記事の平均順位 | — | **20位以内** |
| テンプレDLによるリード獲得 | 0 | **月10件** |

## 次のステップ

1. **テンプレ記事の MicroCMS 入稿準備** （既存ドラフト `beekle-knowhow/02-requirements-template-ears.md` をベース）
2. **ピラー記事のH2-H4詳細アウトライン作成** （別タスク）
3. **DL素材作成** （Word/Excelテンプレ）
4. **既存6本のリンク張り直し** （ピラー公開後）
