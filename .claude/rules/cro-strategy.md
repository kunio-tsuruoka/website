# サイト内からツールへ送客しない（2026-07-27 ユーザー判断・最優先）

**目的は問い合わせ獲得。ツール利用はその手段になっていないので、サイト側からツールへ送客しない。**

- **コラム本文に `/tools/*` へのリンクを書かない。** 記事内のアクション導線は「相談（/contact）」か、フォームを経由しない公開資料・記事へのリンクのみ。
- ヘッダー・ホームページ・コラム一覧など、**回遊動線からツールを外す**。ツールページ自体（`/tools/*`）は残す（直接流入・被リンク・既存SEO資産があり、各ツール内に `/contact` CTA が3箇所ある）が、こちらから送り込まない。
- ツール同士のリンク（story-builder → scope-manager 等）はツール利用中のユーザー向けなので残してよい。
- 「ノウハウ系記事→ツール誘導」という旧方針（下記の2026-05-03版）は**廃止**。

## 経緯（2026-07-27）

記事末CTA（`src/lib/column-cta-mapping.ts` → `[...slug].astro`）は全128記事で `/contact` に向いていて正しかった。問題は**本文中**で、26記事に `/tools/*` リンクが計108本あり、うち8記事は本文中のCV点がゼロでツールリンクしか無かった。AI引用が最も多い買い手クラスタほど比率が壊れていた（project-management-complete-guide はツール12本 vs 本文CTA1本、requirements-definition-complete-guide は6本 vs 1本）。20記事で「本文中に最初に現れるアクション導線がツール」＝記事末CTAに到達する前にツールへ抜けていた。

対応（実施済み）:
- 本文のツールリンク 108本 → 0本。文中の言及は文脈ごと書き換え（ツール名を消して手法の説明として自立させる）、「関連ツール」リスト項目は削除、ツール宣伝セクションは相談CTAマーカーに置換。スクリプト: `scripts/remove-tool-links-from-columns.mjs`（dry-run既定・曖昧一致は中断・`--backup-dir` 必須）。
- 本文CV点ゼロだった15記事に、意図別の中盤CTAマーカー（`{{REQ_CONSULT_MID}}` / `{{ESTIMATE_CONSULT_MID}}` / `{{CONTACT_CTA_MID}}`）を挿入。本文CTA保有 113/128 → 127/128。
- ヘッダーの「発注準備キット」ドロップダウン（PC・モバイル）、ホームページの06 TOOLSセクション、`/column` のスコープ管理ツールカード（→ ゼロスタート資料DLに差し替え）を撤去。

## 未対応

- `project-management-04` だけ MicroCMS が `The status cannot be changed because it is closed.` で PATCH を拒否し、中盤CTAを入れられていない。管理画面で公開状態を直してから再実行する（`node --env-file=.env scripts/remove-tool-links-from-columns.mjs --apply --backup-dir=<path>` は冪等）。

---

# CRO方針: 資料取得は問い合わせと分離（2026-08-22更新）

**完全公開（メアド取得しない）**:
- 業界別テンプレート(経理締め・営業案件・採用フローなど)
- コラム記事
- チェックリスト
- サービス資料・事例PDF・比較資料

**問い合わせとして扱うもの**:
- 開発相談
- 見積もり依頼
- 打ち合わせ希望
- 導入相談

**Why**:
- テンプレートや資料を取得しただけでは、Contact Conversion / CRM Lead / Qualified Lead として扱わない。

**How to apply**:
- 「Beekleの何を提供しているか」を見せる類の資料 → `public/downloads/` や `public/docs/` から直接配布
- コラム末CTAは記事カテゴリ／スラッグで分岐（`src/lib/column-cta-mapping.ts`）。主動線は常に相談、副動線は直接DL資料かゼロスタートLP。**ツールは出さない。**
