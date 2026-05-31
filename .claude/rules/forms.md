---
globs: ["src/components/**/*-form.tsx","src/components/**/contact*.tsx"]
---

# `<form noValidate>` を付けるなら client-side 検証を必ず実装する

contact-form / download-zero-start-form 両方に \`noValidate\` 属性が付いていたため、\`required\` や \`type="email"\` のHTML5バリデーションが無効化され、**空フォームのまま fetch が飛んでサーバーで弾く** UX になっていた（2026-05-06、ユーザー指摘で発覚）。

**ルール**:
- カスタムバリデーションUIを実装しないなら **noValidate を付けない**。HTML5 標準の検証で十分（required / type / pattern / minlength 等）
- noValidate を付けるなら、\`handleSubmit\` 内で fetch する前に **必ず明示的なクライアント側チェック**（同じ zod スキーマか手書き）を入れる
- 「サーバーで弾けば良い」考えはダメ — 無駄なネットワーク往復、UXが悪い、不正リクエスト増

**how to apply**:
- 新規フォームを書く時、\`<form>\` に \`noValidate\` を付けたくなったら自問: 「対応する client-side validation を書いたか？」NO なら付けない
- 既存フォームの noValidate を見つけたら、対応する JS バリデーションがあるか確認、無ければ noValidate を外す

# フォームは react-hook-form + zod + @hookform/resolvers で実装する

2026-05-31 導入。`react-hook-form@7` + `@hookform/resolvers@5`（zod v4 対応、`@hookform/resolvers/zod` の `zodResolver`）。
新規フォームは useState手書きバリデーションでなく、zodスキーマ + useForm({resolver: zodResolver(schema)}) + register/handleSubmit/formState.errors で書く。
初例: `src/features/flow-interview/components/ContactModal.tsx`（在席のまま氏名/会社/メール→/api/contact→Slack。生成内容を message に同梱）。

**フォローアップ（未対応）**: 既存の `src/components/contact-form.tsx` はまだ useState 手書きバリデーション。RHF+zod へ移行する（ユーザー指摘 2026-05-31「contact formもRHFにしないとダメ、まあ後で」）。download-zero-start-form.tsx も同様。

Turnstile はRHFのフィールド外として別 state で持ち、onValid 内でトークン有無をチェックする（widgetはuseTurnstileでマウント）。
