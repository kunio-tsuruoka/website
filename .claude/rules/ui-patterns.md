# Hover-only action handles must not overlap their parent card

ホバーで現れる小さなアクションボタン（`+` 接続ハンドル、`×` 削除など）を `position: absolute` でカードの右端／隅に置く時、Tailwind の `-right-N w-M` の組み合わせで「ボタンの一部がカード本体の上にかぶさる」状態を作ってはいけない。`opacity-0` でも要素はクリックを受けるため、ユーザーがカード本体をクリックしたつもりでハンドルを誤発火する。

**ルール**
- `right` のオフセットは絶対値で `width` 以上にする（例: `w-6` = 24px なら `-right-7` = -28px 以上）
- `opacity-0 group-hover:opacity-100` には必ず `pointer-events-none group-hover:pointer-events-auto` をセットで付ける（不可視時は完全に非干渉）
- これは `+`／`×`／メニュー など、メイン操作と異なる副次操作のハンドル全般に適用

**原因事例（2026-04-29）**
flow-mapper StepCard で `-right-3 w-6` の `+` ハンドルがカード右端に4pxめり込んでいて、カードクリックが接続モード起動に取られて編集パネルが開かないバグ。Playwright で `elementFromPoint` を使って衝突を可視化して特定した。
