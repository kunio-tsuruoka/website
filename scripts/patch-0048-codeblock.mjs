// issue-0048: requirements-definition-process の As-Is/To-Be アウトプット例。
// 暗い <pre><code> 内に「問題点:/期待効果:」リストがプレーン埋め込みで読みにくい。
// フロー図(ASCII矢印)は monospace の <pre> に残し、リスト部分を <pre> の外の
// <p><strong>ラベル</strong></p><ul><li>...</li></ul> に出して視認性を上げる。
//
// 使い方: node --env-file=.env scripts/patch-0048-codeblock.mjs [--apply]

import { createClient } from 'microcms-js-sdk';

const APPLY = process.argv.includes('--apply');
const SLUG = 'requirements-definition-process';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// pre ブロック内の "ラベル:\n- a\n- b" を <pre> 外の見出し+リストへ分離する。
function splitBlock(html, label, outLabel) {
  // 対象 pre を含む `<pre><code> ... ラベル:\n- ...\n</code></pre>` を1つ探す
  const preRe = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
  let m;
  let changed = html;
  let did = false;
  // biome-ignore lint/suspicious/noAssignInExpressions: 正規表現の逐次マッチに必要
  while ((m = preRe.exec(html)) !== null) {
    const inner = m[1];
    const idx = inner.indexOf(`${label}:`);
    if (idx === -1) continue;
    const flow = inner.slice(0, idx).replace(/\s+$/,'');
    const listPart = inner.slice(idx + label.length + 1); // ":" の後
    const items = listPart
      .split('\n')
      .map((l) => l.replace(/^\s*[-・]\s*/, '').trim())
      .filter((l) => l.length > 0);
    if (items.length === 0) continue;
    const lis = items.map((it) => `<li>${it}</li>`).join('');
    const rebuilt = `<pre><code>${flow}\n</code></pre><p><strong>${outLabel}</strong></p><ul>${lis}</ul>`;
    changed = changed.replace(m[0], rebuilt);
    did = true;
  }
  return { changed, did };
}

(async () => {
  const cur = await client.get({ endpoint: 'columns', contentId: SLUG, queries: { fields: 'content' } });
  let html = cur.content;
  const r1 = splitBlock(html, '問題点', 'As-Is の問題点');
  html = r1.changed;
  const r2 = splitBlock(html, '期待効果', 'To-Be の期待効果');
  html = r2.changed;

  console.log(`問題点ブロック分離: ${r1.did ? 'OK' : '対象なし'}`);
  console.log(`期待効果ブロック分離: ${r2.did ? 'OK' : '対象なし'}`);
  if (!r1.did && !r2.did) {
    console.log('変更なし（既に適用済みの可能性）');
    return;
  }
  // 変換後プレビュー
  const pi = html.indexOf('As-Is の問題点');
  console.log('\n--- 変換後プレビュー ---\n' + (pi >= 0 ? html.slice(pi - 120, pi + 400) : '(プレビュー位置不明)'));

  if (!APPLY) {
    console.log('\n[dry-run]（--apply で本番適用）');
    return;
  }
  await client.update({ endpoint: 'columns', contentId: SLUG, content: { content: html } });
  const after = await client.get({ endpoint: 'columns', contentId: SLUG, queries: { fields: 'content' } });
  const ok = after.content.includes('<strong>As-Is の問題点</strong>') && after.content.includes('<strong>To-Be の期待効果</strong>');
  console.log(ok ? '\n✅ PATCH + 検証OK' : '\n❌ 検証失敗');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
