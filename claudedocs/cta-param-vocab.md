# CTA計測パラメータ ボキャブラリ

`/contact` への遷移リンクに付与するクエリパラメータ (`source`, `intent`, `phase`) と、`gtag('event','cta_click', { source, cta })` で送る値の正典。

新規CTAを追加するときは、ここに登録された値の中から選ぶ。新しい値が必要な場合は本書を更新してから実装。

---

## source の決定ルール

`<page>-<position>` 形式を基本とする。`<page>` は配置されているページの正規名、`<position>` はページ内の役割。

### 既存値一覧 (2026-05-01 時点)

#### サイト全体ナビ
| source | 配置 |
|---|---|
| `header-desktop` | Header 右上のContactボタン (PC) |
| `header-mobile` | Header モバイルメニュー内 |

#### ページ別 静的CTA
| source | ページ | position意味 |
|---|---|---|
| `home-zerostart` | `/` | ゼロスタート訴求セクションのCTA |
| `home-final-cta` | `/` | ページ末尾の最終CTA |
| `prooffirst-hero` | `/prooffirst` | Heroセクション |
| `prooffirst-mid` | `/prooffirst` | 中盤の本文後 |
| `prooffirst-zerostart` | `/prooffirst` | ゼロスタート訴求ブロック |
| `prooffirst-final` | `/prooffirst` | ページ末尾 |
| `services-<id>-hero` | `/services/[id]` | サービス詳細Hero (`<id>` 例: `ai-development`) |
| `services-<id>-final` | `/services/[id]` | サービス詳細末尾 |
| `case-studies-final` | `/case-studies` | 事例一覧末尾 |
| `members-final` | `/members` | メンバー一覧末尾 |
| `strengths-final` | `/strengths` | 強みページ末尾 |
| `testimonial-final` | `/testimonial` | お客様の声末尾 |
| `column-list-final` | `/column` | コラム一覧末尾 |
| `materials-final` | `/materials` | 関連資料ページ末尾 |
| `qa-hero` | `/qa` | QA Hero下のサブCTA |
| `qa-final` | `/qa` | QA一覧末尾 |
| `checklists-dev-final` | `/checklists/dev-process` | チェックリスト末尾 |
| `404-card` | `/404` | エラーページの相談カード |
| `process-final` | `/process` | プロセスページ末尾 (CTASection) |
| `process-cta-section` | (default fallback) | CTASectionの既定値 |

#### コラム記事内
| source | 配置 |
|---|---|
| `column-<slug>` | コラム詳細ページ (現状: 末尾CTA・カテゴリ別) |

`<slug>` は MicroCMS の `column.id`。`getCategoryCta()` の戻り値 + `column.id` を組み合わせて自動生成。

#### ツール内
| source | 配置 |
|---|---|
| `tool-flow-mapper` | `/tools/flow-mapper` 内のエスケープCTA各種 |
| `tool-scope-manager` | `/tools/scope-manager` 内 |
| `tool-story-builder` | `/tools/story-builder` 内 |

---

## intent の決定ルール

ユーザーの行動文脈を表す。短い動詞句のスナケース。

### 既存値一覧

| intent | 意味 | 主な使用箇所 |
|---|---|---|
| `pre-tool` | ツール使用前の相談意向 | コラム末尾CTA (`column-cta-sub`) |
| `tool-stuck` | ツール操作中で詰まった | `/tools/*` の冒頭エスケープCTA |
| `floating-stuck` | フローティングCTA経由(操作中) | `/tools/*` のフローティングCTA |
| `review-request` | ツール出力をレビュー依頼 | `/tools/*` の完了後CTA |

新しい intent を増やすときは「ユーザー側の動機」を表現する語にする (`buy`, `inquiry` のような汎用語は避ける)。

---

## phase の決定ルール

ユーザーがツール使用フローのどこで離脱しようとしているかを表す。

| phase | 意味 |
|---|---|
| `start` | 着手直後・冒頭 |
| `mid` | 操作途中 (フローティングCTA経由) |
| `complete` | 完了直後 (出力した後) |

`phase` は今のところ `/tools/*` でしか使っていない。記事側に拡張する必要が出るまで追加しない。

---

## 命名のNG例

- `contact1`, `contact2` のような連番 → どこに置いてあるか追えない
- `top`, `bottom` のような汎用語 → ページ間で衝突する
- `home-button`, `home-link` のような実装語 → 役割が読めない
- `cta-1` のような目的不明 → 集計時に意味付けできない

---

## 増やすときのチェックリスト

新規CTAを追加する際、本書に登録されているか確認 → なければ:

1. 上記NG例を踏まないか
2. 既存パターン (`<page>-<position>`) で表現できるか
3. 本書の対応する表に1行追加してから実装
