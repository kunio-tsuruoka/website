# Beekle Website Design System

Beekle コーポレートサイト（beekle.jp）の正式なデザインシステム。
実装の単一ソースは `src/theme.json` と `tailwind.config.mjs`、コンポーネントは `src/components/ui/`。本ドキュメントは設計判断の根拠と「どこに何があるか」のインデックスとして機能する。

新しいページ・コンポーネントを作る時は、独自のCSS／色／角丸を発明する前に必ずここを参照すること。

---

## 0. ドキュメント上の位置づけ

- `design.md` はデザインシステムの正式な参照先。
- ページ別のデザイン検討メモは `docs/design/` に置く。
- マーケティング調査・SEO・記事ドラフトは `docs/marketing/` に置く。`docs/marketing/` はGit管理しない。
- 技術実装メモは `docs/program/`、意思決定記録は `docs/adr/` に置く。

---

## 1. デザイン原則

- **Editorial / Decision Sheet** — 装飾より判断材料を優先する。背景は薄いNeutral面、情報は白い面、強調は左罫線・表・ログで作る。
- **角丸は控えめ** — カード、表、FAQは原則 `rounded-lg` まで。大きい角丸（`2xl`/`3xl`/`[32px]`）はモーダルや特殊な埋め込みに限定する。
- **影に頼らない** — 通常の情報面は `border-neutral-200/300` で分離する。影はCTAやフォームなど、操作対象を浮かせる必要がある場合だけ最小限に使う。
- **日本語可読性優先** — 本文は Noto Sans JP、見出しの英字部分は Poppins / Montserrat。
- **モバイルでタップ領域 44px 確保** — `.claude/rules/mobile-responsive.md` のルールを守る。
- **モバイルは上から下に読む前提** — PCで横並びに見せる情報も、モバイルでは上から流し読みできる順序にする。横方向の比較に依存しない。
- **LPは業務価値を先に出す** — 技術名・機能名より先に「誰の、どの業務が、どう良くなるか」を見せる。
- **白一色にしない** — `PageHero` や大きいセクションの地は `neutral-50` / `neutral-100` を基本にし、白い情報面が見分けられるようにする。
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
| `neutral-50` `#f8fafc` | ページHero、標準セクション背景 |
| `neutral-100` | 隣接セクション背景、薄い区切り面 |
| `neutral-200` | カード `outlined` のボーダー |
| `neutral-600` `#475569` | 本文のサブテキスト |
| `neutral-700` `#334155` | 本文 |

### 2.6 使用禁止 / 注意

- `indigo-*` / `purple-*` / `pink-*` は **legacy エイリアス**（`tailwind.config.mjs:126-145`）。新規コードでは使わず、`primary-*` / `accent-*` を直接書く。
- 任意のHEXコードを class や style に書かない。必ずトークン経由。
- ダーク背景上の本文に Highlight Yellow を使わない（AAA未達）。
- ダーク背景上の本文は `text-white` / `text-white/80` 以上を基本にする。`text-white/60` 以下を長文に使わない。
- 薄い背景上の文字は `text-accent-950` / `text-navy-950` / `text-neutral-700` を基本にする。装飾色を本文色にしない。

---

## 2.7 LP情報設計

サービスLPは、流し読みでも価値が伝わる順序にする。

1. **業務メリット** — 何が楽になるか、何が速くなるか。
2. **具体例** — 読者が自分ごと化できる業務シーン。
3. **よくある失敗** — 一般的な作り方や既存手法の限界。
4. **Beekleの作り方** — なぜうちは優れたものを作れるのか。
5. **導入価値** — 工数削減、判断速度、品質、運用性。
6. **詳細説明** — 技術・構成・専門用語は後半に置く。

### ストーリー型セクション

AIサービスLPでは、比較表だけで説明しない。以下の型を優先する。

```text
具体例
→ 現場で起きる困りごと
→ 一般的な作り方の限界
→ Beekleの設計
→ 業務で得られる価値
```

### GraphRAGの説明ルール

- 「GraphRAGは常に高精度」と書かない。
- 正確には「必要情報が複数資料・複数チャンクに分散している場合、通常RAGより網羅的で判断しやすい回答になりやすい」と表現する。
- 強みは `情報分散への対応`、`全体像の把握`、`大規模資料のノイズ抑制` として説明する。
- 非エンジニア向けには `チャンク` `エンティティ` `コミュニティ` などの語を避け、`資料の一部` `情報同士のつながり` `全体像` と言い換える。

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

原則として、ページの情報面・カード・CTAに影を使わない。階層は背景面、境界線、余白、見出しサイズで作る。

既存互換の `shadow-soft` / `shadow-medium` / `shadow-strong` は残っていても、新規UIでは使わない。hover は影や浮き上がりではなく、`hover:border-primary-300` や背景色の軽い変化で表す。

---

## 6. 角丸（Border Radius）

| Token | 値 | 用途 |
|---|---|---|
| `rounded-md` | 6px | ボタン、入力、ナビの操作面 |
| `rounded-lg` | 8px | カード、フォーム、白い情報面 |
| `rounded-xl` | 12px | 画像など、やや広い面に限定 |
| `rounded-full` | 9999px | ステータス点、番号、タグなど形状に意味がある小要素 |

`rounded-md` / `rounded-lg` を基本にする。丸いカードを並べると視線の優先順位が弱くなるため、通常の情報面に `rounded-2xl` 以上は使わない。

---

## 7. UIコンポーネント

すべて `src/components/ui/` 配下。`@/components/ui` から import する。

### 7.1 Section (`section.tsx`)

ページのセクション全体を囲む。背景・装飾・グリッドオーバーレイを一括制御。

```tsx
<Section variant="white" padding="lg" decoration="none">
  <SectionHeader title="..." subtitle="..." number="01" label="SERVICE" />
  {/* content */}
</Section>
```

**variant**: `white` / `light` / `lightPurple` / `lightCyan` / `primary` / `navy` / `cyan` / `muted`
**decoration**: `blursPurple` / `blursCyan` / `blursMix` / `bars` / `barsDark` / `dots` / `dotsDark` / `full` / `fullDark` / `none`
**padding**: `none` / `sm` / `md` / `lg`(default)

### 7.2 SectionHeader

セクション見出し。`number` + `label`（"01 SERVICE"）の補助ラベルに対応。`highlight` を渡すと該当文字列を Primary 色で装飾。

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
ボタンは `rounded-md` を基本にする。`<a>` で出したい時は `ButtonLink` を使う（`<button>` を `<a>` に書き換えない）。

### 7.5 Badge / StepBadge / CategoryBadge (`badge.tsx`)

タグ、ステップ番号、カテゴリ切替UI。`variant`: `primary` / `primaryLight` / `secondary` / `accent` / `outline` / `muted` / `success` / `warning` / `error` / `step`。`size`: `xs` / `sm`(default) / `md` / `lg` / `circle` / `circleLg`。

### 7.6 PageHero (`page-hero.tsx`)

各ページのヒーロー領域。`border-b border-neutral-300 bg-neutral-100` の編集面として扱い、紫のポスター面にしない。`title` `subtitle` `badge` `children`(CTA) を受ける。

### 7.7 FloatingCTA (`floating-cta.astro`)

スクロール追従の右下CTA。Astro コンポーネントなので `client:*` 不要。

---

## 8. Pop 装飾要素

定義: `src/styles/global.css:138-176` / `Section`/`Card` の `decoration` props

斜めバー、丸ぼかし、ドット群は旧 Pop 装飾。新規UIでは使わない。必要な強調は、左罫線、番号、タグ、薄い背景色で表す。

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
