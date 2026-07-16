---
globs: ["src/pages/column/**","src/pages/knowledge/**","src/lib/column-visuals.ts"]
---

# コラム本文HTMLを正規表現で処理するときは「MicroCMS自動id付き見出し」を前提にする

- MicroCMSサニタイザは `<h2>/<h3>` に `id="h<hash>"` を自動付与する。`[...slug].astro` 等でコラム本文HTMLに正規表現をかけるときは、属性なし `<h2>` だけのパターン（`/<h2>/`）を書かない。必ず `/<h([23])([^>]*)>/` のように属性を許容する
- 実例（2026-07-02修正）: TOC収集の正規表現が属性なし見出しのみマッチだったため、リッチHTML入稿記事（genai-introduction-complete-guide 等）で目次が丸ごと消えていた。markdown入稿記事は marked レンダラー経由で拾えていたので気づきにくい
- 本文への post-process（TOC収集など）は `renderColumnVisuals()` の {{MARKER}} 置換**前**に実行する。置換後だと差し込みCTAビジュアル内の見出しが目次等に混入する

# コラム本文の <li>/<p><strong>短ラベル</strong>： は自動で紫チップ化される（16文字ルール）

`src/pages/column/[...slug].astro` の「リード見出しラベルのチップ化」post-process（正規表現 `/(<(?:p|li)[^>]*>)\s*<strong>([^<]{1,16})<\/strong>(：|:)/g`）は、`<li>`/`<p>` 冒頭の `<strong>ラベル</strong>：` を、**ラベルが1〜16文字のとき**だけ `strong.lead-label` + `span.lead-colon`（薄紫のピル）に変換する。「質問」「ふつうのAI」「つないだAI」等の対比記事向けの装飾。

- 罠: 技術記事で `<strong>用語（英語）：</strong>説明` のような箇条書きを書くと、ラベル長が16文字以下の項目**だけ**が紫チップ化し、他は素の太字のまま=「中途半端に紫」になる（2026-07-05 graphrag-knowledge-search の「エージェント型（agentic）」=ちょうど16字だけ発火）。
- 回避: チップ化したくない箇条書きは**コロンを `<strong>` の内側に入れる**（`<strong>ラベル：</strong>説明`）。`</strong>` 直後にコロンが無くなり変換条件を外せる。長さに依存せず堅牢、項目間で統一もできる。
- 関連: [[column-rendering]]、strong の薄紫マーカーは通常 strong からは撤去済み（column-writing-style, PR #61）だが、この lead-label 経路は別で残っている。
