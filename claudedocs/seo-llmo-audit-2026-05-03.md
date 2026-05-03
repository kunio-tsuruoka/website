# Beekle SEO・LLMO 監査レポート

- 監査日: 2026-05-03
- 対象: beekle.jp 全ページ + MicroCMS columns 65本 + 構造化データ実装 + RAG 実装
- 観点: SEO（E-E-A-T / 構造化データ / 内部リンク / sitemap）と LLMO（AI Overview / ChatGPT search / Perplexity 引用最適化）の2軸
- 総評: **構造化データ実装は中堅企業サイトとして十分なレベル**。最大の改善余地は **(1) Beekle 固有主張（BPO起点 / FM法 / ゼロスタート / 6ステップ）が AI 知識空間で「Beekle」と紐づくスニペットになっていない、(2) 旧記事と新記事のフォーマット品質に2極化、(3) OG画像が不在で SNS シェアと記事個別の Rich Results が機能していない**の3点。

---

## 着手順序サマリー（優先度高い順）

| # | 課題 | 領域 | 工数 | 効果 |
|---|---|---|---|---|
| 1 | OG画像 `/public/og-image.png` を作成 + 記事個別画像生成 | SEO | 1〜2h | 大（SNSシェア・SERPサムネ） |
| 2 | Glossary に Beekle / ゼロスタート / 6ステップ / BPO起点 / Tools の5件追加 | LLMO | 1〜2h | 大（RAG・AI引用） |
| 3 | column-rag.ts のシステムプロンプトに「Beekle の立場で答える」指示追加 | LLMO | 30min | 大 |
| 4 | ピラー記事5本の冒頭に Beekle 主語の TL;DR blockquote 追加 | LLMO | 2h | 大 |
| 5 | sitemap.xml.ts の欠落ページ追加（rfp-builder, demos, checklists等） | SEO | 15min | 中（即効） |
| 6 | services の seoTitle/seoDescription を全4サービスに展開 | SEO | 30min | 中（CTR） |
| 7 | 旧4記事（project-management-02/04, communication-03/07）のリライトor削除 | SEO+LLMO | 半日 | 中 |
| 8 | json-ld.astro の Article schema に `about`/`keywords`/`articleSection` 追加 | SEO+LLMO | 1h | 中 |
| 9 | コラム冒頭の h2 を「◯◯とは〜です」型の定義文に揃える | LLMO | 1h | 中 |
| 10 | FAQ 自動抽出の h2 `Q1.` パターン対応 | SEO | 30min | 中 |

---

## 優先度【高】SEO

### S-H1. OG画像 `og-image.png` が存在しない

- **ファイル**: `src/components/seo/seo-head.astro:21` / `src/components/seo/json-ld.astro:48,89,99` / `public/`
- **問題**: `seoHead.astro` の `ogImage` デフォルトは `/og-image.png`、`json-ld.astro` の Article schema・Organization の `logo` も `${siteUrl}/og-image.png` `${siteUrl}/logo.png` を参照。`public/` には `logo.png` のみで **`og-image.png` が存在しない**。SNSシェア時に画像 404、Twitter Card `summary_large_image` 指定だが画像欠落、Article schema の `image` も Rich Results で警告リスク。
- **対応**: `public/og-image.png`（1200×630、ロゴ + 「動くプロトタイプから始めるシステム開発」等）を作成。`/`, `/prooffirst`, ピラー記事, ツールには個別 OG 画像を作って `<Layout ogImage="...">` で渡す。

### S-H2. コラム記事の `Article.author` / `reviewedBy` が全件デフォルト固定

- **ファイル**: `src/pages/column/[...slug].astro:174-184` / `src/components/seo/json-ld.astro:73-81`
- **問題**: 65本全コラムで `JsonLd type="article"` に `data.authorId` / `data.reviewerId` を渡していないため、すべて `defaultAuthor=tsuruoka` / `defaultReviewer=nakamura` 固定。レビューしていない記事に `reviewedBy` を出すのは schema spam リスク。可視テキストでクレジットも一切出ていない。
- **対応**:
  1. MicroCMS `Column` 型に `author` / `reviewer` フィールド追加
  2. 過渡期は記事末に「執筆: 鶴岡邦夫 / 監修: 中村有貴」と可視テキストで明記
  3. レビュー未実施の記事は `reviewerId={null}` を渡して `reviewedBy` を出力しない

### S-H3. `Organization` schema に `sameAs` 空 / `telephone` 欠落

- **ファイル**: `src/components/seo/json-ld.astro:42-68`
- **問題**: `sameAs: []` 空配列。Knowledge Graph での企業エンティティ確立を遅らせる。
- **対応**: 公式 X / GitHub Org / Wantedly / note 等があれば `sameAs` に列挙。`geo`（緯度経度）追加でローカルSEO 効果。

### S-H4. `sitemap.xml` に `/tools/rfp-builder`, `/demos/*`, `/checklists/dev-process` が抜けている

- **ファイル**: `src/pages/sitemap.xml.ts:8-26`
- **問題**: 既にヘッダーに掲載されている `/tools/rfp-builder`、`/demos`, `/demos/it-advisor`, `/demos/ocr`、`/checklists/dev-process` が `staticPages` 配列に含まれていない。
- **対応**: 追記。コラムから内部リンク導線が走っている重要ページ。

### S-H5. コラム本文の OG/Twitter 画像が全記事「`/og-image.png` (=不在)」固定

- **ファイル**: `src/pages/column/[...slug].astro:166-173`
- **問題**: `ogImage` を渡していないため `seo-head.astro` のデフォルト `/og-image.png` 固定。MicroCMS の `Column` 型に `eyecatch` / `thumbnail` フィールド未定義。SNSシェア時に全記事同じ汎用画像で CTR 取り逃がし。
- **対応**: MicroCMS スキーマに `eyecatch` 追加。当面はタイトルから動的生成する OG 画像 API（Cloudflare Image Resizing or Vercel `@vercel/og` 相当）を `pages/og/[slug].png.ts` で実装する手も。

### S-H6. `services/web-mobile-development` 等に `seoTitle` / `seoDescription` が無い

- **ファイル**: `src/data/service.ts:7-10` / `src/pages/services/[id].astro:21-22`
- **問題**: `seoTitle`/`seoDescription` を持つのは `cdp-development` (line 106) と `ai-development` (line 411) のみ。`web-mobile-development` と `ai-b2b-website` は短すぎる title（「WEBアプリ・モバイルアプリ開発 | Beekle」）で検索結果 CTR を取り逃がし。
- **対応**: 4サービスすべてに `seoTitle` `seoDescription` を埋める。例: 「WEBアプリ・モバイルアプリ開発｜要件定義から運用まで一貫サポート | Beekle」。

### S-H7. トップページの title が検索意図キーワード不足

- **ファイル**: `src/pages/index.astro:16` 周辺（`<title>Beekle - 技術を用いて人を幸せに</title>`）
- **問題**: ブランディング寄りで「ゼロスタート」「動くプロトタイプ」「初期費用0円」「システム開発」が title に入っていない。
- **対応**: 「動くプロトタイプから始めるシステム開発｜Beekle株式会社」のようにキーワードを盛り込む。

### S-H8. 本文中インラインリンクのタップターゲット 44px 未達

- **ファイル**: `src/pages/column/[...slug].astro:509-520`（`.markdown-content :global(a)::after`）
- **問題**: 本文 `text-lg`（18px）行高 1.7 → 約30px 行高、`mobile-responsive.md` 規約の 44px 未達。
- **対応**: 本文中インラインリンクは構造的に 44px 確保困難。「重要なリンクは pill 化（既存の `p > a[href^="/contact"]:only-child` パターン）して必ず段落単独に置く」運用を `column-writing-style.md` に追記。

### S-H9. `_redirects` の `/feed/`, `/category/*` が全部トップへ

- **ファイル**: `public/_redirects`
- **問題**: WordPress 旧URLの被リンクがあれば台無しになっている。
- **対応**: GSC で `/category/...` `/feed` の旧URLにインプレッションが残っているか確認 → 残っていれば `/column` か `/qa` に振り分け。

### S-H10. `/qa` の `<h1>` が「一問一答」だけで検索意図キーワード弱い

- **問題**: 「システム開発 発注 よくある質問」のような検索意図キーワードを `subtitle` ではなく `<h1>` に含めたい。
- **対応**: PageHero の title を「一問一答｜システム開発の発注に関するよくある質問」等に変更。

---

## 優先度【高】LLMO

### L-H1. 用語集（glossary）に "Beekle" "ゼロスタート" "6ステップパイプライン" が無い

- **ファイル**: `scripts/beekle-glossary.mjs`
- **問題**: 現 12件は FM / AsIs/ToBe / RFP / KGI / 機能要件 など**一般用語の解説**に寄りすぎ。Beekle 固有の主張で AI に引用してほしいエントリ（Beekle株式会社の定義 / ゼロスタート / 6ステップパイプライン / BPO起点 / 3つのツール）が**全部欠落**。ChatGPT search / Perplexity が「Beekleって?」と聞かれた時の回答ベースが無い。
- **対応**: 以下5件を追加 → `bun run embed:columns` → commit。

```js
{
  id: 'glossary-beekle-company',
  title: 'Beekle株式会社とは',
  url: '/',
  excerpt:
    'Beekle株式会社（ビークル、英: Beekle Inc.）は、東京都大田区に本社を置くシステム開発会社。代表は鶴岡邦夫、設立は2023年2月。AI / Webアプリ / モバイルアプリの受託開発を行う。Beekle の特徴は (1) システム開発の前にBPO（既存業務プロセス）の見直しから始める「BPO起点」のアプローチ、(2) 初期費用0円で動くプロトタイプを先に体験できる「ゼロスタート」モデル、(3) ヒアリング → As-Is/To-Be → ユーザーストーリー → FM法 → Gherkin → Laravel Inertia という「6ステップパイプライン」で要件定義から実装までを一気通貫で進めること。フローマッパー・ストーリービルダー・スコープマネージャーの3つの無料ツールを公開している。コーポレートサイトは https://beekle.jp。',
},
{
  id: 'glossary-zero-start',
  title: 'ゼロスタート（Beekleの初期費用0円プロトタイプ体験）とは',
  url: '/prooffirst',
  excerpt:
    'ゼロスタートは、Beekle株式会社が提供する初期費用0円で動くプロトタイプを体験できるサービスモデル。本契約の前に実際に触れる動くシステムを試してから発注を決められる。対象は中堅企業のDX担当者。詳細は https://beekle.jp/prooffirst。',
},
{
  id: 'glossary-six-step-pipeline',
  title: 'Beekleの6ステップパイプライン',
  url: '/process',
  excerpt:
    '6ステップパイプラインは、Beekle が要件定義から実装までを一直線でつなぐ独自プロセス。(1) アクター洗い出し、(2) As-Is（現状業務フロー）と To-Be（改善後フロー）の可視化、(3) ユーザーストーリーと EARS 記法での要件記述、(4) FM法での優先度判定、(5) Gherkin（Given/When/Then）でのシナリオテスト記述、(6) Laravel + Inertia.js での実装、の6段階。各ステップで生成 AI を活用し、上流の決定が下流に欠落なく伝わる仕組み。',
},
{
  id: 'glossary-bpo-first',
  title: 'BPO起点アプローチ（BeekleのDX進め方）',
  url: '/column/dx-josys-as-is-bpo-guide',
  excerpt:
    'BPO起点とは、システム開発を「新しいシステムを作る」ではなく「既存業務プロセスに問題がないか確認する」から始めるアプローチ。Beekle が受託開発の現場で実践しており、「悪い業務を高速・正確に自動化する」DX失敗を防ぐ入口になる。BPO見直し → As-Is/To-Be可視化 → ユーザーストーリー → FM法 → 費用対効果から逆算 の順で進める。一般的な「ビジョンを描いて、ロードマップを作って」型のDX解説とは順番が逆。',
},
{
  id: 'glossary-beekle-tools',
  title: 'Beekleが公開している3つの発注準備ツール',
  url: '/tools',
  excerpt:
    'Beekle は発注者向けに3つの無料Webツールを公開。(1) フローマッパー (/tools/flow-mapper): 業務フローをスイムレーン形式でAs-Is/To-Be可視化。(2) ストーリービルダー (/tools/story-builder): 要望をユーザーストーリー形式に分解しREQ-XXX形式のIDで管理。(3) スコープマネージャー (/tools/scope-manager): FM法で3軸評価して優先度を決定。3ツールはMarkdownで連携でき、ヒアリング → ストーリー化 → 優先度判定 がツール上で完結する。すべてメアド登録不要。',
},
```

### L-H2. 旧記事の冒頭が Markdown 残骸 + LLMO 反パターン

- **対象**: `project-management-02`, `project-management-04`, `communication-03`, `communication-07`（FAQ記事）
- **問題**:
  1. `<p># タイトル</p>` `<p>## 見出し</p>` のように Markdown 記法が `<p>` 内に残存（`microcms.md` 違反）
  2. `project-management-04` 冒頭に章番号がプレーンテキストで露出、h2/h3 階層が崩壊
  3. `communication-07`（FAQ記事）は **FAQPage スキーマの最有力ソースなのに `<p>` 1個に Q&A が詰まっている** → FAQ 自動抽出にも `Article` のスニペットにも合致しない
  4. 全4本に description 空 → AI Overview スニペット候補に上がりにくい
- **対応**:
  - **(A)** 内容が薄い旧記事は新記事カテゴリに統合してリダイレクト
  - **(B)** 残すなら新記事と同じ HTML フォーマットで全面リライト（`<h2>` `<h3>` `<ul>` `<strong>`）
  - **(C)** 最低限 `node scripts/generate-descriptions.mjs` で description 補充 + Markdown 残骸を一括 PATCH
  - `communication-07` は最優先で B か C（FAQ schema は PAA 露出に直結）

### L-H3. ピラー記事に「Beekle の主張」TL;DR 段落がない

- **対象**: `dx-josys-as-is-bpo-guide`, `how-to-write-rfp`, `requirements-definition-complete-guide`, `dx-failure-patterns`, `cdp-explained`
- **問題**: 結論先出しはしているが、**「Beekle が」という主語が冒頭に出てこない**。AI に引用されても「一般論」として認識され、Beekle 固有 IP として知識グラフに紐づかない。
- **対応**: 各ピラー記事冒頭の `<h2>はじめに</h2>` 直下に、Beekle 主語の TL;DR blockquote を追加。例:

```html
<blockquote>
<p><strong>この記事の結論</strong>: Beekle は中堅企業のDX案件で、教科書通りの「ビジョン → 現状可視化 → ロードマップ」ではなく、<strong>「BPO（既存業務プロセス）の問題確認 → As-Is/To-Be可視化 → ユーザーストーリー → FM法で優先度判定 → 費用対効果で逆算」</strong>の順で進めることを推奨しています。「悪い業務を高速・正確に自動化するDX」を防ぐ入口になります。</p>
</blockquote>
```

これで AI が「Beekle が推奨する DX の進め方は…」の形で回答に組み込みやすくなる。**5本のピラーだけでも入れれば、ChatGPT search で「Beekle DX 進め方」のクエリで Beekle 固有主張が引用される確率が大幅に上がる。**

### L-H4. RAG context のシステムプロンプトが「Beekle の立場で答える」指示を欠く

- **ファイル**: `src/lib/column-rag.ts:104`（`formatColumnContext`）
- **問題**: `/api/ai/chat`（IT-advisor）のプロンプトは「前置きを書かない」指示はあるが、「Beekle の方法論として答える」指示が無く、汎用解説 LLM のように答えてしまう。
- **対応**: 以下を `formatColumnContext` のシステム指示末尾に追加:

```ts
- Beekle のサイト経由の質問なので、Beekle 固有の方法論（BPO起点 / FM法 / ゼロスタート / 6ステップパイプライン）が抜粋にあれば優先的に紹介する
- 「Beekle が」「Beekle では」を主語にして、汎用解説ではなく Beekle の立場として答える
- 抜粋に Beekle 関連の URL（/tools/*, /prooffirst, /process, /column/*）があれば、関連の深いものを末尾に1件案内する
```

### L-H5. Article schema に `about` / `mentions` / `keywords` が無い

- **ファイル**: `src/components/seo/json-ld.astro:83-107`
- **問題**: 現在 `headline / description / image / author / publisher` のみ。`about`（主題）/ `mentions`（言及エンティティ）/ `keywords` が無く、AI が「この記事は何の話か」を構造化データから判定しにくい。
- **対応**: コラム個別ページで以下を追加:

```ts
keywords: data.keywords as string | undefined,
about: data.about ? (data.about as Array<{name:string; url?:string}>).map(a => ({
  '@type': 'Thing',
  name: a.name,
  ...(a.url ? { url: a.url } : {}),
})) : undefined,
articleSection: data.categoryName as string | undefined,
inLanguage: 'ja',
```

呼び出し側で `column.category?.title` と Beekle 主張エンティティを渡す。

---

## 優先度【中】

### M1. fallbackDescription の Markdown 残骸混入

- **ファイル**: `src/pages/column/[...slug].astro:131`
- **問題**: `column.description` 空の旧記事で fallback が本文HTMLストリップだが、Markdown 記号（`#`, `**`, `[]()`）が残ったまま description として出力される可能性。
- **対応**:

```ts
const fallbackDescription = (() => {
  const text = (column.content || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_`]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 120 ? `${text.substring(0, 120)}...` : text;
})();
```

### M2. og:image が記事個別なし → SERP 多様性ロジックで抑制リスク

- **対応**: 中期施策。`/api/og?title=...` のような Cloudflare Pages Function で動的生成。

### M3. `cdp-explained` 等の用語定義 h2 が「定義型」になっていない

- **対象**: `cdp-explained`, `bigquery-explained` 等
- **問題**: 1つ目の h2 がシナリオ説明や前置きで、定義文（「◯◯とは〜です」）が後ろにある。AI Overview は h2 が定義型かで定義スニペットを取りに行く。
- **対応**: 1つ目 h2 を「{用語}とは {1文での定義}」に固定。`cdp-explained` は2つ目の h2 が既にこの形式なので **順番入れ替えだけで OK**。

### M4. FAQ 自動抽出が h2 `Q1.` パターンに対応していない

- **ファイル**: `src/pages/column/[...slug].astro:137-154`
- **問題**: 現状の faqPatterns は `<p>` ベースの3パターン。新ピラー記事は `<h2>Q1. 質問</h2><p>A. 回答</p>` 形式で書かれている → **FAQPage schema が一切出ていない可能性**。
- **対応**:

```ts
const h2qPattern = /<h2[^>]*>Q\d+\.\s*([^<]+)<\/h2>([\s\S]*?)(?=<h2|<hr|$)/g;
for (const match of (column.content || '').matchAll(h2qPattern)) {
  const question = match[1].trim();
  if (faqSet.has(question)) continue;
  faqSet.add(question);
  const ansMatch = match[2].match(/<p>(?:A\.\s*)?([\s\S]*?)<\/p>/);
  if (ansMatch) {
    faqs.push({ question, answer: ansMatch[1].replace(/<[^>]*>/g, '').trim() });
  }
}
```

検証: `curl -s https://beekle.jp/column/dx-josys-as-is-bpo-guide | grep -c '"@type":"FAQPage"'` で 1 が期待値。

### M5. Person schema が記事個別では Article 内入れ子のみ

- **問題**: 著者の独立した Person ノードが記事ページから出ていない（`/members` のみ）。`@id` で記事内 author の `@id` と `/members#tsuruoka` の Person ノードを一致させると AI に「同一エンティティ」と認識される。
- **対応**: 中期施策。`/members` の Person ノードと記事の author で `@id` を共有。

### M6. `/materials` ページの description / 構造化データ未整備

- **問題**: PDF 1点だけのページ。description 無し。
- **対応**: CRO 戦略上ゲート対象なら `noindex` でも可。検索流入を狙うなら `itemList` schema + description 整備。

### M7. `/checklists/dev-process` が Breadcrumb のみ

- **対応**: `Article` または `HowTo` schema を出すと Rich Results 候補。

### M8. `/case-studies` 内画像に loading="lazy" 未指定

- **ファイル**: `src/pages/case-studies.astro:315`
- **対応**: `loading="lazy"` を明示。LCP 対象でないなら効果あり。

### M9. Article schema に `wordCount` / `articleSection` が無い

- **対応**: `column.category.title` を `articleSection` に入れるだけで簡単。

### M10. トップページ・サービス・コラムのキーワード薄

- **問題**: トップ title「Beekle - 技術を用いて人を幸せに」は検索意図キーワード薄い。サービスも同様。
- **対応**: S-H6, S-H7 と一体で対応。

---

## 優先度【低】

- L1. **`glossary-fm` が長すぎる**（360字超 → 80〜150字推奨）。先頭1〜2文を簡潔な定義に絞る
- L2. ピラー記事の冒頭結論先出しを `requirements-prioritization-moscow-fm` のような型に統一
- L3. RAG embedding の excerpt 構成見直し（`scripts/build-column-embeddings.mjs`）
- L4. `header.tsx` のロゴ alt が `alt="logo"` → `alt="Beekle"` 推奨
- L5. `Article.publisher.logo` のサイズが Google 推奨（最低112px）を満たしているか確認
- L6. `members.astro:91` の直接 `JSON.stringify` を `json-ld.astro` の `personSchema` 経由に統一（DRY）
- L7. SVG アイコンに `aria-hidden` 推奨

---

## 着手のヒント

### 「最初の3手」推奨

1. **L-H1（glossary 5件追加） + L-H4（RAG プロンプト追加）** をセットで実施
   - 効果: `/api/ai/chat` の応答が即座に「Beekle の立場」になり、Perplexity / ChatGPT search が Beekle サイトを巡回した時のシグナルが一気に強化
   - 工数: 2〜3h
2. **L-H3（ピラー5本に Beekle 主語の TL;DR 追加）**
   - 効果: AI Overview / ChatGPT search で「Beekle DX 進め方」「Beekle 要件定義」のクエリで Beekle 固有主張が引用される確率が大幅向上
   - 工数: 2h
3. **S-H1（OG画像作成） + S-H4（sitemap欠落対応）**
   - 効果: SNS シェア時の見栄え改善 + Google クロール網羅性向上
   - 工数: 1〜2h

### 関連ファイル

- 構造化データ実装: `src/components/seo/json-ld.astro`
- meta/canonical/OG: `src/components/seo/seo-head.astro`
- Layout 共通: `src/layouts/layout.astro`
- sitemap: `src/pages/sitemap.xml.ts`
- コラムSSR: `src/pages/column/[...slug].astro`
- サービス詳細: `src/pages/services/[id].astro` / データ: `src/data/service.ts`
- 著者データ: `src/data/authors.ts`
- 用語集: `scripts/beekle-glossary.mjs`
- RAG: `src/lib/column-rag.ts` / `src/data/column-embeddings.json`
- CTA mapping: `src/lib/column-cta-mapping.ts`
- リダイレクト: `public/_redirects`
- robots: `public/robots.txt`
