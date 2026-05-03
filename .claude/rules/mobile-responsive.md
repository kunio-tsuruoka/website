# Mobile タップターゲットと文字サイズの最低ライン

iPhone 13 (390px) 監査でピラー記事 `/column/<slug>` に **高さ17〜23px のリンクが20箇所**、フッター・関連リンクで `<14px` のテキストが頻発していた（GA4でモバイル sessions ‐18%, engaged ‐38%, PV ‐44% と整合）。横スクロール overflow は出ていないため目視で気づきにくい劣化。

**ルール**
- リンク・ボタン (`<a>`, `<button>`) のクリック可能領域は **最低 44×44px**（Apple HIG）。テキストリンクをそのまま置く時は `py-2` 以上 or `block` + `min-h-[44px]` で領域を確保する。
- 本文外のテキストリンク（パンくず、フッター、関連リンク）は特に小さくしがち。Tailwind の `text-sm` (14px) を **モバイルでさらに小さくしない**（`text-xs` = 12px は注釈以外で使わない）。
- 監査スクリプトは `mobile-audit.mjs` パターン（playwright + iPhone 13 viewport で `getBoundingClientRect` の `height < 32` を検出）。再発防止に CI に乗せる候補。

**why**: モバイルでは「画面が崩れる」より「押せない／読めない」で静かに離脱する。GA4 のチャネル/デバイス比較で初めて気づくレベルの劣化につながる。

**how to apply**: 新規ページ・新規コンポーネントを書く時、`<a>` `<button>` の高さに `py-2` (16px padding ≈ 高さ40-44px) を必ず付ける。フッターやサイドバーのナビは `text-sm` 維持、`text-xs` は disclaimer 等の注釈のみ。
