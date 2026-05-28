# Beekle Website - Claude Code Instructions

## Project Overview

Beekle株式会社のコーポレートサイト（日本語）

## Tech Stack

- **Framework**: Astro 5 (SSR mode)
- **UI**: React 18 + Tailwind CSS 3
- **Hosting**: Cloudflare Pages
- **CMS**: MicroCMS (columns/categories)
- **Linter/Formatter**: Biome
- **Animation**: Framer Motion

## Commands

```bash
bun dev          # 開発サーバー起動
bun build        # プロダクションビルド
bun preview      # ビルド結果のプレビュー
bun check        # Biome lint + format (自動修正)
bun check:ci     # CI用チェック（修正なし）
```

## Directory Structure

```
src/
├── components/     # React/Astroコンポーネント
│   └── ui/        # 共通UIコンポーネント (Button, Card, Section等)
├── pages/         # Astroページ (.astro)
├── layouts/       # レイアウト
├── data/          # 静的データ (.ts)
├── lib/           # ユーティリティ (utils.ts, microcms.ts)
├── types/         # 型定義
└── styles/        # グローバルCSS
```

## Documentation Structure

内部ドキュメントは目的別に分ける。

```
docs/
├── adr/          # 意思決定記録。長期的に残す設計判断
├── design/       # デザイン検討メモ。正式ルールは root の design.md
├── program/      # 技術実装、インフラ、API/MCP、検証手順
└── marketing/    # SEO、記事ドラフト、GA4/GSC、競合調査（gitignore）
```

- マーケティング関連の調査・記事ドラフト・Search Console/GA4出力は `docs/marketing/` に置く。
- `docs/marketing/` はローカル作業用で、Git管理しない。
- 公開配布物は `public/docs/` に置く。内部docsと混ぜない。
- ADRは `docs/adr/0001-title.md` の形式で追加する。

## Design System

正式なデザインシステムは `design.md` を参照する。

### Brand Colors

- **Primary**: Beekle Purple `#3D4DB7` (primary-500)
- **Accent**: Dark Navy `#001738` (accent-950)
- **Secondary**: Cyan `#00c4cc` (secondary-500)
- **Highlight**: Yellow `#ffd600` (highlight-500)

### Fonts

- **Headings**: Poppins, Montserrat
- **Body (JP)**: Noto Sans JP

### Key Components

- `Section`: ページセクション (variant: white/light/navy/primary)
- `SectionHeader`: セクション見出し (title, subtitle, number, label)
- `Button`: ボタン (variant: primary/secondary/outline)
- `Card`: カード

## Coding Conventions

### Imports

```typescript
// エイリアス使用
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

### Styling

- Tailwind CSS classes優先
- `cn()` でクラス結合 (clsx + tailwind-merge)
- CSS変数は `src/theme.json` で定義
- 新規UIは `design.md` のコントラスト・モバイル可読性ルールを優先
- LPでは技術説明より「業務課題 → 具体例 → Beekleの作り方 → 導入価値」の順で見せる

### Biome Rules

- シングルクォート
- trailing comma: es5
- インデント: スペース2

## MicroCMS Integration

- API上限: 100件/リクエスト
- クライアント: `src/lib/microcms.ts`
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`
- エンドポイント: `columns`（コラム記事）、`categories`（カテゴリー）

### 記事追加時の作業

新しいコラム記事をMicroCMSに追加した後、以下を実行してmeta descriptionを自動生成する：

```bash
node scripts/generate-descriptions.mjs       # descriptionが空の記事のみ生成
node scripts/generate-descriptions.mjs --all  # 全記事を再生成
node scripts/generate-descriptions.mjs --dry  # プレビュー（保存しない）
```

- OpenRouter API（Claude Haiku）で記事本文からSEO用のdescriptionを生成
- 生成結果はMicroCMSの `description` フィールドに保存される
- 環境変数 `OPENROUTER_API_KEY` が必要（`.env` に設定済み）

## Important Notes

- Astroページは `.astro` 拡張子
- Reactコンポーネントは `.tsx` 拡張子
- サーバーサイドレンダリング (output: 'server')
- 日本語コンテンツ優先
- 既存の未追跡マーケティング資料は `docs/marketing/` に整理し、Gitに追加しない

## Do NOT

- 不要な英語コメントを追加しない
- 既存のデザインシステムを無視しない
- biome.jsonのルールを変更しない
- `docs/marketing/` の資料をコミットしない
- コラム本文に「自分が思う〜」「自分が考える〜」のような冗長な主語明示を書かない（AIっぽさが出る、詳細は `.claude/rules/column-writing-style.md`）
- MicroCMS入稿HTMLに `**bold**` や `# heading` などのMarkdown記法を残さない（`<strong>` `<h2>` 等を使う）
