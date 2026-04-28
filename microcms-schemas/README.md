# MicroCMS Schemas

MicroCMS の管理画面「API設定 → APIスキーマ → インポート」で以下の JSON を読み込んで API を作成します。

## 作成手順（順番に注意）

1. `qa-categories.json` を先にインポート
   - エンドポイント: `qa-categories`
   - API の型: **リスト形式**
2. `qa.json` をインポート
   - エンドポイント: `qa`
   - API の型: **リスト形式**
   - インポート後、`category` フィールドの「コンテンツ参照」設定で参照先 API として `qa-categories` を選択

## 補足

- `category` は MicroCMS 上で「コンテンツ参照（単一）」として手動設定が必要です（インポート JSON には参照先 API を含められないため）。
- 参照先表示用の項目には `qa-categories.title` を選んでください。
- スキーマ作成後、`bun run scripts/seed-qa.mjs` でサンプルデータを投入できます。
