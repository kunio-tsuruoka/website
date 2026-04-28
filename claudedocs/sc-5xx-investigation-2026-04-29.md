# P0-1 / P0-2: 5xx 調査ログ（2026-04-29）

## 結論（2026-04-29 確定）

- **22件すべて `/knowledge/*` の旧URL**（`claudedocs/beekle.jp-Coverage-Drilldown-2026-04-29/Table.csv` で確定）
- **現在の挙動**: 19件は 308 → 404、3件は直接 404（`/knowledge/*` は現在のコードベースに存在しない）
- **SC の 5xx 表示は古い履歴**（最終クロール 2025-11〜2026-02、3〜5ヶ月前）
- **対応方針**: **A. 404のまま放置 + SCで「修正を検証」**
  - 理由: トピックが現戦略（AI開発失敗予防/要件定義/DX失敗）と不一致 → 強制301はsoft-404扱いのリスク
  - 410と404の差は実質ほぼなし（Google公式）
  - 22URLは1〜2週間で自動的にインデックスから消える

## ユーザー側アクション（手動・5分）
1. Search Console → ページのインデックス登録 → 「Server error (5xx)」 → 右上「**修正を検証**」
2. 同じく「Not found (404)」 → 「**修正を検証**」
3. 1〜2週間後に再分類されることを確認

## 旧調査メモ（参考）

- **副次発見1**: `/services/*` が末尾スラッシュ無し→有り の 308 リダイレクト中。canonical（スラッシュ無し）と sitemap（スラッシュ無し）に対して、HTTP 配信が `/`-付きへ強制リダイレクトしている。SC の "Page with redirect" 5件はこれが原因の可能性。
- **副次発見2**: 旧スラッグ 2件 (`7hhc1tib7dft`, `nqu29zwuq6`) は `_redirects` で 301 化済み。問題なし。
- **副次発見3 (本調査)**: `/knowledge/*` のtrailing-slash付きURLも 308 → 404 経由の挙動。Cloudflare Pages の暗黙挙動による。

## 自前クロール結果

**手順**: sitemap.xml から URL 抽出 → Googlebot UA で全件 HEAD 相当の `curl` 実行

| Status | 件数 | 内訳 |
|---:|---:|---|
| 200 | 43 | 通常ページ |
| 308 | 6 | `/services/*` 全6本（末尾スラッシュ自動付与） |
| 301 | 2 | 旧スラッグ正規化（`_redirects` 設定済み） |
| **5xx** | **0** | **sitemap内には 5xx なし** |
| 4xx | 0 | sitemap 外も probe したが特定再現なし |

データ: `/tmp/beekle-status-codes.tsv`

## 副次発見1: `/services/*` 308 リダイレクト

```
GET /services/cdp-development
HTTP/2 308
location: /services/cdp-development/
```

矛盾:
- `astro.config.mjs`: `trailingSlash: 'never'`
- `<link rel="canonical">`: `https://beekle.jp/services/cdp-development`（スラッシュ無し）
- `<meta property="og:url">`: 同上
- `sitemap.xml`: スラッシュ無し
- 実際の HTTP 配信: スラッシュ**有り** にリダイレクト

原因仮説:
- `src/pages/services/[id].astro` 1本のみ（SSR動的ルート）
- Cloudflare Pages のアセット解決層が、ディレクトリ風パスに `/` を強制追加している可能性
- `_redirects` には末尾スラッシュ規則は無い（既に削除済み）

**対応案**: `[id].astro` ではなく `[id]/index.astro` 構造にするか、Cloudflare 側で `Always Use Trailing Slash = Off` を確認する。ただし今やるべきは P0-1 → P0-2 の本筋なので、この件は **P1a に組み込んでサービスページ刷新時に同時対応**する。

## 副次発見2: SC が見ている可能性のある URL パターン

22件の 5xx は以下に分布している可能性が高い（手動エクスポートで確定する必要あり）:

1. **旧 column スラッグ** — MicroCMS 入稿時の自動 ID（`7hhc1tib7dft` 形式）。`_redirects` で 2 件は対応済みだが、過去公開履歴のあるスラッグは他にもありえる。
2. **削除済みページ** — `/qa` `/_redirects` に元あったが今は無いパス
3. **パラメータ付き URL** — クエリ文字列で SSR がエラーを返すケース
4. **API ルート** — `/api/*` で内部エラーしているもの
5. **MicroCMS 取得失敗** — 一過性の `getColumn()` タイムアウトを 500 として返している可能性（`src/pages/column/[...slug].astro` を要確認）

## 次アクション

### ユーザー側（手動）
1. SC を開く → 「ページのインデックス登録」 → 「Server error (5xx)」をクリック
2. 右上「エクスポート」 → CSV をダウンロード
3. `claudedocs/sc-5xx-pages-2026-04.csv` に保存して通知

### Claude 側（並行で着手済み）
1. `[P1a-1]` `/services/cdp-development/` リライト計画作成 ← **本セッションで開始**
2. `[副次]` 308 リダイレクト問題は P1a リライト時に同時修正候補として記録

### 5xx CSV 入手後
1. 各 URL を `curl -A "Googlebot" -i` で再現確認
2. 再現するもの → `wrangler pages deployment tail` でログ取得 → 修正
3. 再現しないもの → 一過性として SC「修正を検証」で再クロール依頼
