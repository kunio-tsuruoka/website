# 📱 スマホからコラム記事を編集するガイド

Beekleのコラムシステムは、GitHubにプッシュすると自動でサイトに反映されます。
スマホから簡単に記事を書く・編集する方法を解説します。

## 🎯 編集の流れ

```
記事をMarkdownで書く
↓
GitHubにプッシュ
↓
自動的にサイトに反映（3-5分）
```

---

## 📲 推奨アプリ

### **iPhone/iPad の場合**

#### オプション1: GitHub Mobile（無料・簡単）
- **ダウンロード**: [App Store](https://apps.apple.com/app/github/id1477376905)
- **メリット**: 無料、シンプル
- **デメリット**: プレビュー機能が弱い

#### オプション2: Working Copy（推奨）
- **ダウンロード**: [App Store](https://apps.apple.com/app/working-copy/id896694807)
- **メリット**: Markdownプレビュー、強力なエディタ
- **デメリット**: 有料版が必要（買い切り）

### **Android の場合**

#### GitHub Mobile（無料）
- **ダウンロード**: [Google Play](https://play.google.com/store/apps/details?id=com.github.android)

---

## 📝 記事の書き方

### 1. ファイル配置

新しい記事は以下のディレクトリに作成：

```
src/content/columns/記事のスラッグ.md
```

**例**: `src/content/columns/five-reasons-for-failure.md`

### 2. Frontmatter（メタデータ）

記事の先頭に以下の情報を必ず記載：

```yaml
---
title: "記事のタイトル"
description: "記事の概要（1-2行）"
category: "avoid-failure"  # カテゴリー
number: "01"  # カテゴリー内の番号
readTime: "8分"  # 読了時間
difficulty: "初級"  # 初級/中級/上級
publishedAt: "2025-01-23"  # 公開日（YYYY-MM-DD）
author: "Beekle編集部"
tags: ["タグ1", "タグ2", "タグ3"]  # 関連タグ
---
```

### 3. カテゴリー一覧

| カテゴリーID | タイトル |
|------------|---------|
| `avoid-failure` | システム開発で失敗しないために |
| `fast-development` | 早くシステムを作るために |
| `procurement-checklist` | システムを発注する際のチェックリスト |
| `selecting-tech-partner` | 良い技術パートナーを選ぶために |

### 4. 記事本文の書き方

#### ✅ おすすめの構成

```markdown
# メインタイトル（H1）

導入文：読者の課題に共感する

## セクション1（H2）

### サブセクション（H3）

**太字**: 重要なポイント

> 引用: 事例やデータ

- 箇条書き
- 読みやすく

## まとめ

次のアクションを提示
```

#### ✅ よく使うMarkdown

```markdown
# 見出し1
## 見出し2
### 見出し3

**太字**
*イタリック*

- リスト項目
- リスト項目

1. 番号付きリスト
2. 番号付きリスト

[リンクテキスト](URL)

> 引用文

`コード`

\`\`\`
コードブロック
\`\`\`

| 表 | ヘッダー |
|----|---------|
| データ | データ |
```

---

## 📱 GitHub Mobileでの編集手順

### **新規記事を作成する場合**

1. **GitHub Mobileを開く**
2. **リポジトリ `website` を開く**
3. **`Code` タブ → `src/content/columns/` に移動**
4. **右上の `...` → `Create new file`**
5. **ファイル名を入力**: `記事のスラッグ.md`
6. **Frontmatterを記入**（コピペ推奨）
7. **本文をMarkdownで書く**
8. **下にスクロール → `Commit changes`**
9. **コミットメッセージ**: 「新規記事: タイトル」
10. **`Commit to main` をタップ**

### **既存記事を編集する場合**

1. **GitHub Mobileを開く**
2. **`src/content/columns/記事名.md` を開く**
3. **右上の鉛筆アイコン（編集）をタップ**
4. **内容を編集**
5. **`Commit changes`**
6. **コミットメッセージ**: 「記事更新: 変更内容」
7. **`Commit to main` をタップ**

---

## 🚀 Working Copyでの編集手順（推奨）

### 初回セットアップ

1. **Working Copyをダウンロード**
2. **GitHubアカウントと連携**
3. **`website` リポジトリをクローン**

### 記事の作成・編集

1. **Working Copyで `website` を開く**
2. **`src/content/columns/` に移動**
3. **新規作成 or 既存ファイルを編集**
4. **Markdownエディタで執筆**
   - リアルタイムプレビュー機能あり
5. **保存 → Commit → Push**

**メリット**:
- ✅ Markdownプレビューがリアルタイム
- ✅ オフライン編集可能
- ✅ 複数ファイルを同時編集

---

## ✅ 記事公開チェックリスト

記事を公開する前に確認：

- [ ] Frontmatterが正しく記載されている
- [ ] `title`, `description`, `category` が入力されている
- [ ] `publishedAt` が今日の日付になっている
- [ ] 本文に見出し（H2, H3）が適切に配置されている
- [ ] 誤字脱字がないか確認
- [ ] 内部リンク（ゼロスタート、お問い合わせ）が入っている
- [ ] CTAボタンが適切に配置されている

---

## 🎨 記事に使える装飾

### 強調ボックス

```markdown
<div style="background: linear-gradient(to right, #EEF2FF, #FAF5FF); padding: 2rem; border-radius: 1rem; margin: 3rem 0;">

### 💡 ポイント

重要な情報をボックスで強調できます

</div>
```

### CTAボタン

```markdown
<div style="text-align: center; margin: 3rem 0;">
  <a href="/prooffirst" style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(to right, #4F46E5, #7C3AED); color: white; border-radius: 9999px; text-decoration: none; font-weight: bold;">
    ゼロスタートについて詳しく見る →
  </a>
</div>
```

### テーブル

```markdown
| 項目 | 従来開発 | ゼロスタート |
|------|---------|------------|
| 初期費用 | 高い | 0円 |
| リスク | 高い | 低い |
```

---

## 🔄 公開後の確認

### 1. サイトに反映されているか確認

GitHubにプッシュ後、3-5分待つと自動デプロイされます。

確認URL:
```
https://your-domain.com/column/記事のスラッグ
```

### 2. 表示確認項目

- [ ] タイトルが正しく表示されている
- [ ] Frontmatterの情報（難易度、読了時間）が表示されている
- [ ] 本文のMarkdownが正しくレンダリングされている
- [ ] リンクが機能している
- [ ] 関連記事が表示されている
- [ ] モバイルでも読みやすい

---

## 💡 執筆のコツ

### ✅ Do（やるべきこと）

1. **顧客インサイトを反映**
   - 「わからない・怖い・選べない」に共感
2. **具体例を入れる**
   - 失敗事例、成功事例、数字
3. **ゼロスタートへの導線**
   - 各記事から自然にLPへ誘導
4. **わかりやすい言葉**
   - 非エンジニア向けに平易な表現
5. **視覚的に読みやすく**
   - 見出し、箇条書き、表を活用

### ❌ Don't（避けるべきこと）

1. **技術用語の乱用**
   - 専門用語は必ず説明を添える
2. **長すぎる段落**
   - 3-4行で改行
3. **CV導線の欠如**
   - 必ず問い合わせ・ゼロスタートへの導線を入れる
4. **データなしの主張**
   - 主張には根拠を
5. **他社のコピペ**
   - 独自の視点と事例を

---

## 🆘 トラブルシューティング

### Q: 記事が表示されない

**A**: 以下を確認
- Frontmatterの構文エラーがないか
- ファイル名が`.md`で終わっているか
- GitHubに正しくプッシュされているか

### Q: Markdownが正しく表示されない

**A**: Markdown構文を確認
- 見出しの前後に空行があるか
- リストの前後に空行があるか
- コードブロックが正しく閉じられているか

### Q: デプロイされない

**A**: GitHubのActionsを確認
- エラーログを確認
- ビルドエラーがないか

---

## 📞 サポート

質問がある場合は、Beekle開発チームに連絡してください。

---

**作成日**: 2025-01-23
**更新日**: 2025-01-23
**バージョン**: 1.0
