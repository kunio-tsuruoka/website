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

## Design System

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

### Biome Rules

- シングルクォート
- trailing comma: es5
- インデント: スペース2

## MicroCMS Integration

- API上限: 100件/リクエスト
- クライアント: `src/lib/microcms.ts`
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`

## Important Notes

- Astroページは `.astro` 拡張子
- Reactコンポーネントは `.tsx` 拡張子
- サーバーサイドレンダリング (output: 'server')
- 日本語コンテンツ優先

## Do NOT

- 不要な英語コメントを追加しない
- 既存のデザインシステムを無視しない
- biome.jsonのルールを変更しない
