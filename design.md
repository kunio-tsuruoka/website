# Beekle Website Design System

Beekle コーポレートサイト（beekle.jp）の正式なデザインシステム。
実装の単一ソースは `src/theme.json` と `tailwind.config.mjs`、コンポーネントは `src/components/ui/`。本ドキュメントは設計判断の根拠と「どこに何があるか」のインデックスとして機能する。

新しいページ・コンポーネントを作る時は、独自のCSS／色／角丸を発明する前に必ずここを参照すること。

---

## 1. デザイン原則

- **Pop Style** — フラットすぎず装飾を入れる。斜めバー（`decoration-bar-purple/cyan/yellow`）、丸ぼかし、ドット群を背景に重ね、紙面に動きを出す。
- **角丸は大きめ** — ボタンは `rounded-full`、カードは `rounded-[32px]`（`2xl`/`3xl`）。小さい角丸は使わない。
- **影は3段階** — `shadow-soft` / `shadow-medium` / `shadow-strong` のいずれかに揃える。任意の box-shadow を書かない。
- **日本語可読性優先** — 本文は Noto Sans JP、見出しの英字部分は Poppins / Montserrat。
- **モバイルでタップ領域 44px 確保** — `.claude/rules/mobile-responsive.md` のルールを守る。
- **Tailwind class を直接書く** — `cn()` でクラス結合、`src/components/ui/` の既存バリアントで足りるならそれを使う。任意の color HEX を書かない。

---

## 2. ブランドカラー

定義: `tailwind.config.mjs:36-145` / `src/theme.json`

### 2.1 Primary — Beekle Purple `#3D4DB7`

ブランドの主役。CTA、ヘッダー強調、リンク、フォーカスリング。

| Token | HEX | 用途 |
|---|---|---|
| `primary-50` | `#f0f1fb` | ライト背景、ホバー薄色 |
| `primary-100` | `#e0e3f6` | カードの薄い帯、アイコン背景 |
| `primary-300` | `#a2abe4` | サブテキスト on dark |
| `primary-500` | `#3D4DB7` | **本体（CTA・主要ボタン）** |
| `primary-600` | `#3544a4` | hover時 |
| `primary-900` | `#1c2556` | 濃いテキスト on white |

### 2.2 Accent — Dark Navy `#001738`

ダーク背景セクション、フッター、本文の最濃テキスト。

| Token | HEX | 用途 |
|---|---|---|
| `accent-950` | `#001738` | **本体（ダーク背景・本文最濃色）** |
| `accent-900` | `#001a3d` | ボタンhover |

### 2.3 Secondary — Cyan `#00c4cc`

差し色、補助CTA、ダーク背景上のリンク。Primary とのコントラストで使う。

| Token | HEX | 用途 |
|---|---|---|
| `secondary-50` | `#e6fafa` | 薄背景 |
| `secondary-500` | `#00c4cc` | **本体** |
| `secondary-600` | `#00b0b8` | hover |

### 2.4 Highlight — Yellow `#ffd600`

注意喚起・装飾ドット・ハイライトのみ。本文色には使わない（コントラスト不足）。

| Token | HEX | 用途 |
|---|---|---|
| `highlight-500` | `#ffd600` | **本体** |
| `highlight-100` | — (HSL) | バッジ "warning" 用薄背景 |

### 2.5 Neutral

`neutral-50` … `neutral-900` まで標準スケール。

| Token | 用途 |
|---|---|
| `neutral-50` `#f8fafc` | セクション背景（`Section variant="light"`） |
| `neutral-100` | カードの薄背景 |
| `neutral-200` | カード `outlined` のボーダー |
| `neutral-600` `#475569` | 本文のサブテキスト |
| `neutral-700` `#334155` | 本文 |

### 2.6 使用禁止 / 注意

- `indigo-*` / `purple-*` / `pink-*` は **legacy エイリアス**（`tailwind.config.mjs:126-145`）。新規コードでは使わず、`primary-*` / `accent-*` を直接書く。
- 任意のHEXコードを class や style に書かない。必ずトークン経由。
- ダーク背景上の本文に Highlight Yellow を使わない（AAA未達）。

---

## 3. タイポグラフィ

定義: `src/theme.json:80-100` / `src/styles/global.css:1`

### 3.1 フォントファミリー

| Token | スタック | 用途 |
|---|---|---|
| `font-Poppins` | Poppins, sans-serif | 英字見出し、ナンバーラベル（"01", "02"） |
| `font-Montserrat` | Montserrat, sans-serif | h1/h2 の英字 |
| `font-NotoSansJP` | Noto Sans JP, sans-serif | 日本語本文・日本語見出し |

`html` のデフォルトは Poppins → Noto Sans JP のフォールバック（`global.css:11`）。日本語文字は自動でNoto Sans JPに落ちる。

### 3.2 サイズスケール

`text-xs` (12px) から `text-9xl` (128px)、加えて `text-giant` (200px / `12.5rem`)。

| 用途 | 推奨class |
|---|---|
| h1（PageHero） | `text-4xl sm:text-5xl font-bold` |
| h2（SectionHeader） | `text-4xl lg:text-5xl font-bold` |
| h3（CardTitle） | `text-xl font-bold` または `text-2xl` |
| 本文 | `text-base leading-relaxed` |
| 注釈・キャプション | `text-sm text-neutral-600` |
| ラベル（"SERVICE"等） | `text-sm font-semibold tracking-wide uppercase` |
| ナンバー（"01"） | `font-Poppins text-5xl font-bold text-primary-500` |

### 3.3 モバイル最低ライン

`.claude/rules/mobile-responsive.md` のルール:
- 本文外リンク（フッター・パンくず・関連）に `text-xs` (12px) を使うのは注釈のみ。通常リンクは `text-sm` (14px) 以上。
- `<a>` `<button>` は `py-2` 以上で実高さ 40-44px を確保する。

---

## 4. スペーシング & レイアウト

### 4.1 セクションパディング

| Variant | clases | 用途 |
|---|---|---|
| `padding="sm"` | `py-16 md:py-20` | 短いセクション |
| `padding="md"` | `py-20 md:py-24` | 標準 |
| `padding="lg"` | `py-24 md:py-32` | デフォルト・主要セクション |

### 4.2 コンテナ

`Section` の `container` props（デフォルト true）が `container mx-auto px-8 lg:px-12 relative` を自動付与。手書きで container を書かない。

### 4.3 グリッド

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```
カードリストは 1→2→3 列のレスポンシブが標準。

---

## 5. 影（Shadow）

定義: `tailwind.config.mjs:20-24`

| Token | 値 | 用途 |
|---|---|---|
| `shadow-soft` | `0 4px 20px -4px rgba(0,23,56,0.08)` | カードのデフォルト |
| `shadow-medium` | `0 8px 30px -8px rgba(0,23,56,0.12)` | hover時 |
| `shadow-strong` | `0 16px 50px -12px rgba(0,23,56,0.18)` | フローティングCTA |

3段階以外の影を新規作成しない。色は `#001738` (Accent) ベースで統一。

---

## 6. 角丸（Border Radius）

| Token | 値 | 用途 |
|---|---|---|
| `rounded-full` | 9999px | **すべてのボタン**（`buttonVariants` で固定） |
| `rounded-2xl` | 32px | カード、アイコンコンテナ |
| `rounded-3xl` | 40px | 大きめのモジュール |
| `rounded-[32px]` | 32px | Card コンポーネントの実装値 |

`rounded-md` 以下の小さい角丸は基本的に使わない（バッジの一部・フォーム入力欄を除く）。

---

## 7. UIコンポーネント

すべて `src/components/ui/` 配下。`@/components/ui` から import する。

### 7.1 Section (`section.tsx`)

ページのセクション全体を囲む。背景・装飾・グリッドオーバーレイを一括制御。

```tsx
<Section variant="white" padding="lg" decoration="blursPurple">
  <SectionHeader title="..." subtitle="..." number="01" label="SERVICE" />
  {/* content */}
</Section>
```

**variant**: `white` / `light` / `lightPurple` / `lightCyan` / `primary` / `navy` / `cyan` / `muted`
**decoration**: `blursPurple` / `blursCyan` / `blursMix` / `bars` / `barsDark` / `dots` / `dotsDark` / `full` / `fullDark` / `none`
**padding**: `none` / `sm` / `md` / `lg`(default)

### 7.2 SectionHeader

セクション見出し。`number` + `label`（"01 SERVICE"）の Pop Style 表示に対応。`highlight` を渡すと該当文字列を Primary 色で装飾。

### 7.3 Card (`card.tsx`)

```tsx
<Card variant="white" padding="md" hover="lift" decoration="dots" number="01">
  <CardIcon variant="purple"><Icon /></CardIcon>
  <CardTitle>タイトル</CardTitle>
  <CardDescription>本文</CardDescription>
</Card>
```

**variant**: `white`(default) / `light` / `lightPurple` / `lightCyan` / `primary` / `navy` / `cyan` / `yellow` / `gradientPurple` / `gradientMix` / `outlined` / `outlinedPrimary` / `outlinedSecondary` / `glass` / `glassDark` / `legacy`
**hover**: `none` / `shadow` / `lift`(default) / `scale` / `glow` / `border`
**decoration**: `barPurple` / `barCyan` / `dots` / `dotsDark` / `none`

ダーク variant（`primary` / `navy` / `cyan` / `gradientPurple` / `gradientMix` / `glassDark`）を使う時は子の `CardTitle` `CardDescription` `CardContent` に `dark` props を渡す。

**FeatureCard** はプリセット。`number` `icon` `title` `description` を渡すだけで上記の組み合わせを生成。

### 7.4 Button / ButtonLink (`button.tsx`)

```tsx
<Button variant="primary" size="md">送信</Button>
<ButtonLink href="/contact" variant="primary" size="lg">お問い合わせはこちら</ButtonLink>
```

**variant**: `primary`(default) / `accent` / `secondary` / `highlight` / `white` / `outline` / `outlinePrimary` / `outlineNavy` / `ghost` / `link` / `destructive` / `muted`
**size**: `sm` / `md`(default) / `lg` / `xl`
すべて `rounded-full`。`<a>` で出したい時は `ButtonLink` を使う（`<button>` を `<a>` に書き換えない）。

### 7.5 Badge / StepBadge / CategoryBadge (`badge.tsx`)

タグ、ステップ番号、カテゴリ切替UI。`variant`: `primary` / `primaryLight` / `secondary` / `accent` / `outline` / `muted` / `success` / `warning` / `error` / `step`。`size`: `xs` / `sm`(default) / `md` / `lg` / `circle` / `circleLg`。

### 7.6 PageHero (`page-hero.tsx`)

各ページのヒーロー領域。`bg-primary-500` 固定、グリッドパターン入り。`title` `subtitle` `badge` `children`(CTA) を受ける。

### 7.7 FloatingCTA (`floating-cta.astro`)

スクロール追従の右下CTA。Astro コンポーネントなので `client:*` 不要。

---

## 8. Pop 装飾要素

定義: `src/styles/global.css:138-176` / `Section`/`Card` の `decoration` props

- **斜めバー**: `.decoration-bar-purple` (Primary), `.decoration-bar-cyan` (Secondary), `.decoration-bar-yellow` (Highlight)。グラデーション + `rotate(±25deg)`。
- **丸ぼかし**: `<div class="w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />` パターン。`Section variant="white"` + `decoration="blursPurple"` で両端に配置される。
- **ドット群**: ランダムに散らした小さい円。`Section decoration="dots"` または個別に `.dot-purple/cyan/yellow` 使用。

ダーク背景セクションでは `barsDark` / `dotsDark` / `fullDark` を使う（コントラスト確保のため不透明度が上がっている）。

---

## 9. アニメーション

| Class | キーフレーム | 用途 |
|---|---|---|
| `animate-fade-in-up` | opacity 0→1, translateY 20px→0 | コンテンツ初期表示 |
| `animate-float` | 6s 上下に揺れる | アイコン・装飾 |
| `animate-float-delay` | 8s + 1s delay | 複数装飾を時間差で動かす |
| `animate-float-slow` | 10s + 2s delay | 同上 |

Framer Motion を使う場合のパターン:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
```

`viewport={{ once: true }}` を必ず付ける（スクロールのたびに再アニメさせない）。

---

## 10. 命名規約と実装ルール

- **Tailwind class を優先**。CSS 変数や生のCSSは `global.css` の `@layer components` にまとめる時のみ。
- **`cn()` でクラス結合**。`clsx` + `tailwind-merge` の合成。後勝ち優先で衝突解決される。
- **インポートはエイリアス**: `import { Button } from '@/components/ui'`。相対パスは使わない。
- **シングルクォート、trailing comma es5、インデント2スペース**（Biome ルール）。
- **emoji は使わない**（プロジェクト規約、本ドキュメントを除く既存コードでも追加しない）。

---

## 11. 関連ドキュメント

- `CLAUDE.md` — プロジェクト全体の概要・コマンド
- `.claude/rules/styling.md` — Tailwind 詳細ルール
- `.claude/rules/components.md` — コンポーネントの書き方
- `.claude/rules/mobile-responsive.md` — モバイルタップ領域・文字サイズ
- `.claude/rules/ui-patterns.md` — ホバー時のオーバーラップ事故対策
- `.claude/rules/astro.md` — Astro pages / SSR ルール
- `.claude/rules/feature-architecture.md` — `/tools/*` 系の feature ベース構成

---

## 12. 変更履歴

設計上の重大な変更（カラースケール改訂、コンポーネント API 変更など）はここに追記する。日付は YYYY-MM-DD で。

- 2026-05-06 初版（既存実装からの抽出ドキュメント化）
