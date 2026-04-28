# Tasks / リマインダー

## 保留中

### Search Console API 連携の完了確認（2026-04-28 設定中）

**状態**: サービスアカウント作成済みだが、SC側の権限反映待ちで 403 が継続中。

**サービスアカウント**: `gsc-reader@ga4-mcp-beekle.iam.gserviceaccount.com`
**キーファイル**: `~/.gsc-reader-key.json`
**GCP プロジェクト**: `ga4-mcp-beekle`
**Search Console API**: 有効化済み

**やること（再試行時）**:

1. 動作確認コマンド:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=$HOME/.gsc-reader-key.json node -e "
   const {GoogleAuth} = require('google-auth-library');
   (async () => {
     const auth = new GoogleAuth({
       keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
       scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
     });
     const client = await auth.getClient();
     const res = await client.request({
       url: 'https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent('sc-domain:beekle.jp') + '/searchAnalytics/query',
       method: 'POST',
       data: { startDate: '2026-04-01', endDate: '2026-04-28', dimensions: ['query'], rowLimit: 10 }
     });
     console.log(JSON.stringify(res.data, null, 2));
   })().catch(e => console.error(e.message));
   "
   ```

2. 200 が返れば次のステップへ:
   - `scripts/fetch-sc-queries.mjs` を作成（クエリ × ページのレポート出力）
   - `claudedocs/sc-queries-2026-04.md` を生成
   - SEO戦略 (`claudedocs/seo-search-console-2026-04.md`) を実クエリで再補正

3. それでも 403 の場合の切り分け:
   - SC管理画面 → 設定 → ユーザーと権限 で `gsc-reader@ga4-mcp-beekle.iam.gserviceaccount.com` が表示されているか確認
   - 権限を「フル」に変更
   - kunio.tsuruoka@beekle.jp が「所有者」権限か確認
   - プロパティタイプを確認（`sc-domain:beekle.jp` / `https://beekle.jp/` / `https://www.beekle.jp/` のいずれか）

**関連ドキュメント**:
- `claudedocs/seo-search-console-2026-04.md` (SC連携データに基づくSEO戦略)
- `claudedocs/ga4-report-2026-04.md` (4月GA4月次レポート)
- `claudedocs/content-marketing-strategy-2026-05.md` (5月以降のコンテンツ戦略)

---

### コンテンツマーケティング戦略実装（2026-04-28〜）

**完了**: 技術系のSEO基盤整備
- [x] URL正規化（trailing slash 既知URL → `_redirects` 12項目）
- [x] sitemap に `/qa`, `/tools/story-builder`, `/tools/scope-manager`, `/checklists/dev-process` を追加
- [x] `llms.txt` を現状ページ構成に合わせて更新（pillar記事を明示、廃止URL `/knowledge` 削除）
- [x] ビルド成功確認（`npm run build`）

**保留・要ユーザー判断**: コンテンツ作成・MicroCMS反映

新規記事ドラフト3本（クラスターC「見積もり/費用」）を `claudedocs/drafts/` に作成済み。MicroCMSに投入するかはユーザー判断。
- `cluster-c-01-cost-breakdown.md` — 費用の内訳完全ガイド
- `cluster-c-02-cost-by-scale.md` — Webシステム費用の規模別レンジ
- `cluster-c-03-quote-comparison-checklist.md` — 見積もり比較チェックリスト

**残タスク**（戦略文書 §5 スプリント1〜3 のうち未着手）
- [ ] 既存ピラー3本のリライト（`project-management-complete-guide`, `avoid-unused-system`, `estimate-complete-guide`）
  - 必要作業: MicroCMS本文更新（FAQ追加、内部リンク強化、目次階層化）
  - 手段: `scripts/apply-improvements.mjs` のパターンを流用するか、MicroCMS管理画面で直接編集
- [ ] クラスターC 3本ドラフトのMicroCMS投入（レビュー後）
- [ ] ツール解説コラム（`/tools/story-builder`, `/tools/scope-manager` 用）×2本ドラフト作成
- [ ] クラスターA/B/D/E 残記事の執筆
- [ ] `/services/ai-development/` のテコ入れ（順位37位→1ページ目）
- [ ] OGP画像の動的生成（戦略文書 §4 P4）

---

## 完了済み

- 2026-04-28: GA4月次レポート / コンテンツ戦略 / SEO実データ補正レポート 作成
- 2026-04-28: SEO基盤の技術系整備（URL正規化 / sitemap / llms.txt）
