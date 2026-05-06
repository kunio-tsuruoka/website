# Hover-only action handles must not overlap their parent card

ホバーで現れる小さなアクションボタン（`+` 接続ハンドル、`×` 削除など）を `position: absolute` でカードの右端／隅に置く時、Tailwind の `-right-N w-M` の組み合わせで「ボタンの一部がカード本体の上にかぶさる」状態を作ってはいけない。`opacity-0` でも要素はクリックを受けるため、ユーザーがカード本体をクリックしたつもりでハンドルを誤発火する。

**ルール**
- `right` のオフセットは絶対値で `width` 以上にする（例: `w-6` = 24px なら `-right-7` = -28px 以上）
- `opacity-0 group-hover:opacity-100` には必ず `pointer-events-none group-hover:pointer-events-auto` をセットで付ける（不可視時は完全に非干渉）
- これは `+`／`×`／メニュー など、メイン操作と異なる副次操作のハンドル全般に適用

**原因事例（2026-04-29）**
flow-mapper StepCard で `-right-3 w-6` の `+` ハンドルがカード右端に4pxめり込んでいて、カードクリックが接続モード起動に取られて編集パネルが開かないバグ。Playwright で `elementFromPoint` を使って衝突を可視化して特定した。

# `overflow-hidden` ancestor breaks `position: sticky` (Tailwind gotcha)

`<section class="... overflow-hidden">` の中で `lg:sticky lg:top-28` を使っても sticky は効かない。CSS仕様で sticky の祖先に `overflow != visible` がひとつでもあると無効化される（`hidden` / `auto` / `scroll` すべて該当）。

このプロジェクトでは各セクションに装飾用 absolute blob を clip するため `overflow-hidden` を雛形コピペで付けている。sticky 要素を含むセクションでは、装飾 blob が無いことを確認した上で `overflow-hidden` を外すこと。

**症状**: FAQ + 横並び CTA カード構成で、accordion 開閉や FAQ スクロール中に CTA カードが追従せずに画面外へ消える（「カードが下がっていく」と見える）。

**原因事例 (2026-05-06)**: `src/pages/prooffirst.astro` 07 FAQ セクション。`overflow-hidden` を外したら `lg:sticky lg:top-28` が機能した。

**ルール**:
- sticky 要素を持つセクションでは雛形の `overflow-hidden` を外す
- 装飾 blob を残したい場合は、blob を内側の `<div class="overflow-hidden">` で囲み、sticky の親パスから clip 祖先を除く構造に分離する
