# MicroCMS コンテンツインポートガイド

このガイドでは、作成したカテゴリーとコラムデータをMicroCMSにインポートする手順を説明します。

## 1. MicroCMSでAPIを作成

### カテゴリーAPI (`categories`)

1. MicroCMSの管理画面で「API作成」をクリック
2. API名: `categories`
3. エンドポイント: `categories`
4. APIの型: **リスト形式**
5. 以下のフィールドを追加:

| フィールドID | 表示名 | 種類 | 必須 |
|-------------|--------|------|------|
| title | タイトル | テキストフィールド | ✓ |
| description | 説明 | テキストフィールド | ✓ |
| icon | アイコン | テキストフィールド | - |
| order | 表示順序 | 数値 | ✓ |

### コラムAPI (`columns`)

1. MicroCMSの管理画面で「API作成」をクリック
2. API名: `columns`
3. エンドポイント: `columns`
4. APIの型: **リスト形式**
5. 以下のフィールドを追加:

| フィールドID | 表示名 | 種類 | 必須 |
|-------------|--------|------|------|
| title | タイトル | テキストフィールド | ✓ |
| content | 本文 | テキストエリア | ✓ |
| category | カテゴリー | コンテンツ参照 (categories) | ✓ |

**注意**: `category` フィールドは、先に作成した `categories` APIを参照する設定にしてください。

## 2. カテゴリーデータを登録

`microcms-categories.json` の内容をMicroCMSに登録します。

### 手動登録の場合

MicroCMSの `categories` APIで、以下の2つのコンテンツを作成してください:

#### カテゴリー1: プロジェクトの進め方
- **コンテンツID**: `project-management`
- **title**: プロジェクトの進め方
- **description**: 発注側の技術④：プロジェクトを成功に導く進行管理技術
- **icon**: 📋
- **order**: 4

#### カテゴリー2: プロジェクト管理とコミュニケーション
- **コンテンツID**: `communication`
- **title**: プロジェクト管理とコミュニケーション
- **description**: 発注側の技術⑤：可視化と意思疎通の技術
- **icon**: 💬
- **order**: 5

### APIでの一括登録（推奨）

MicroCMSのManagement APIを使用して一括登録することも可能です。

```bash
# カテゴリー登録スクリプト（例）
# 各カテゴリーごとにPOSTリクエストを送信
```

## 3. コラムデータを登録

### 第4章のコラム（10記事）

`microcms-columns-chapter4.json` の内容をMicroCMSの `columns` APIに登録します。

各記事のコンテンツIDは以下の通り:
- `project-management-01` から `project-management-10`

**重要**: `category` フィールドには、先ほど作成した `project-management` カテゴリーを選択してください。

### 第5章のコラム（8記事）

`microcms-columns-chapter5.json` の内容をMicroCMSの `columns` APIに登録します。

各記事のコンテンツIDは以下の通り:
- `communication-01` から `communication-08`

**重要**: `category` フィールドには、先ほど作成した `communication` カテゴリーを選択してください。

## 4. 動作確認

すべてのデータを登録したら、以下のコマンドで動作確認してください:

```bash
npm run dev
```

ブラウザで `http://localhost:4321/column` にアクセスし、以下を確認:

- カテゴリーが2つ表示されている
- 第4章に10記事、第5章に8記事表示されている
- 各記事をクリックして詳細ページが表示される

## トラブルシューティング

### カテゴリーが表示されない

- `.env` ファイルに `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` が正しく設定されているか確認
- MicroCMSで `categories` APIが作成されているか確認

### コラムが表示されない

- MicroCMSで `columns` APIが作成されているか確認
- 各コラムの `category` フィールドが正しく設定されているか確認

### ビルドエラーが出る

```bash
npm run build
```

エラーメッセージを確認し、MicroCMSのAPIキーやサービスドメインが正しいか確認してください。

## 参考

- JSONファイル:
  - `microcms-categories.json`: カテゴリーマスタデータ
  - `microcms-columns-chapter4.json`: 第4章コラムデータ
  - `microcms-columns-chapter5.json`: 第5章コラムデータ
