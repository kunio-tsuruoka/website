// 01-00 project-management-complete-guide の構造系（issue-0005, 0009）。
//   0005: Gherkin サンプルの <blockquote> を <pre><code> に変換（コードとして読ませる）
//   0009: 冒頭リード直後に「対象読者の明示 + この記事で分かること + 目次」を追加
// 使い方: node --env-file=.env scripts/patch-01-00-structural.mjs [--apply]

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SLUG = 'project-management-complete-guide';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// 0009 で挿入する導入＋目次（プレーンHTML。サニタイザを通る要素のみ）
const INTRO_BLOCK =
  '<p>本記事は、<strong>中小〜中堅企業の経営者・事業責任者・情報システム担当の方</strong>が、外部の開発ベンダーや社内エンジニアと一緒にシステム開発を進めるときに、「どこまで自分たちで決めればよいか」「何を任せてよいか」を整理するためのガイドです。</p>' +
  '<p>この記事を読むと、次のことが分かります。</p>' +
  '<ul><li>プロジェクトを失敗させる典型パターンと、その予防策</li><li>発注側が押さえるべき6つのステップと、その具体的な進め方</li><li>生成AIを活用しつつ「使われるシステム」を作るための考え方</li></ul>';

function convertGherkin(html) {
  // 在庫検索 を含む blockquote を pre><code に変換
  const re = /<blockquote>([\s\S]*?在庫検索[\s\S]*?)<\/blockquote>/;
  const m = html.match(re);
  if (!m) return { html, did: false };
  // <p>...</p> を改行に、<br> を改行に変換してプレーンテキスト化
  const text = m[1]
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<\/?p>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .trim();
  const pre = `<pre><code>${text}\n</code></pre>`;
  return { html: html.replace(m[0], pre), did: true };
}

function insertIntro(html) {
  if (html.includes('この記事を読むと、次のことが分かります')) return { html, did: false };
  // 最初の </p>（リード文の終わり）の直後に挿入
  const idx = html.indexOf('</p>');
  if (idx === -1) return { html, did: false };
  const at = idx + 4;
  return { html: html.slice(0, at) + INTRO_BLOCK + html.slice(at), did: true };
}

(async () => {
  const cur = await client.get({
    endpoint: 'columns',
    contentId: SLUG,
    queries: { fields: 'content' },
  });
  let html = cur.content;
  const g = convertGherkin(html);
  html = g.html;
  const i = insertIntro(html);
  html = i.html;

  console.log(`0005 Gherkin→pre: ${g.did ? 'OK' : '対象なし/適用済'}`);
  console.log(`0009 導入+目次挿入: ${i.did ? 'OK' : '対象なし/適用済'}`);
  if (!g.did && !i.did) {
    console.log('変更なし');
    return;
  }
  if (!APPLY) {
    const pi = html.indexOf('この記事を読むと');
    console.log(`\n--- 導入挿入プレビュー ---\n${pi >= 0 ? html.slice(pi - 80, pi + 240) : ''}`);
    const gi = html.indexOf('<pre><code>Scenario');
    console.log(
      `\n--- Gherkin変換プレビュー ---\n${gi >= 0 ? html.slice(gi, gi + 200) : '(なし)'}`
    );
    console.log('\n[dry-run]（--apply で本番適用）');
    return;
  }
  await client.update({ endpoint: 'columns', contentId: SLUG, content: { content: html } });
  const after = (
    await client.get({ endpoint: 'columns', contentId: SLUG, queries: { fields: 'content' } })
  ).content;
  const ok =
    after.includes('この記事を読むと、次のことが分かります') &&
    after.includes('<pre><code>Scenario');
  console.log(ok ? '\n✅ PATCH + 検証OK' : '\n⚠ 一部未確認（要目視）');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
