import { readFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const envText = readFileSync('.env', 'utf8');
for (const line of envText.split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const NEW_TITLE = '要求定義と要件定義の違いは？要求＝「やりたいこと」、要件＝「満たすべき条件」';
const NEW_DESCRIPTION =
  '要求は顧客の「やりたいこと」、要件はシステムが「満たすべき条件」。主語・抽象度・検証可能性の3軸で違いを整理し、混同で起きる失敗と、要求から要件へ変換する手順を実例で解説します。';

const FAQ_BLOCK = `
<h2 id="terminology-clarification">関連用語の整理：「要望」「要求整理」との関係</h2>
<p>「要求」「要件」と似た用語に「要望（よぼう）」「要求整理」があります。実務で混同しやすいので、ここで関係を整理しておきます。</p>
<h3 id="yobou-vs-yoken">「要望」と「要件」の違い</h3>
<p>要望は「あったらいいな」レベルの願望で、要求よりさらに前段階の素材です。</p>
<ul>
<li><strong>要望</strong>：個別ユーザーから集まる「こうだったらいいのに」の声（散発・重複・矛盾を含んでよい）</li>
<li><strong>要求</strong>：要望を整理して「顧客として何を実現したいか」にまとめたもの（重複・矛盾を解消した状態）</li>
<li><strong>要件</strong>：要求を「システムが満たすべき条件」に変換したもの（実装・テスト可能なレベル）</li>
</ul>
<p>つまり <strong>要望 → 要求 → 要件</strong> の順で具体化されていくと考えると整理しやすくなります。</p>
<h3 id="yokyu-seiri-vs-yoken-teigi">「要求整理」と「要件定義」の違い</h3>
<p>「要求整理」は散発的な要望を集めて要求にまとめる工程、「要件定義」は要求をシステム要件に変換する工程です。</p>
<ul>
<li><strong>要求整理</strong>：要望の集約・重複排除・優先順位付け（要求定義の前半に位置づけられることが多い）</li>
<li><strong>要件定義</strong>：整理された要求をシステム要件に翻訳する（要求定義の後半 〜 次工程）</li>
</ul>
<p>会社や書籍によって「要求定義」の範囲は揺れますが、重要なのは用語ラベルではなく <strong>「やりたいこと」と「実装する条件」が分離されているか</strong> です。</p>
<h3 id="short-queries">「要求 要件 違い」と検索された方へ</h3>
<p>「定義」を付けない短い表記でも、本記事冒頭で説明した3つの違い（主語・抽象度・検証可能性）がそのまま当てはまります。要点だけ確認したい方は <a href="#h055bc8023b">結論セクション</a> をご覧ください。</p>
`.trim();

function formatBlocks(html) {
  return html
    .replace(/>\s*(<(?:h[1-6]|p|ul|ol|li|blockquote|hr|table|thead|tbody|tr|td|th)\b)/g, '>\n$1')
    .replace(/(<\/(?:h[1-6]|p|ul|ol|li|blockquote|table|thead|tbody|tr|td|th)>)\s*</g, '$1\n<');
}

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');

const current = await client.get({ endpoint: 'columns', contentId: 'requirements-vs-requests' });

const NEXT_ARTICLES_MARKER = /<h2[^>]*>\s*次に読むべき記事\s*<\/h2>/;
if (!NEXT_ARTICLES_MARKER.test(current.content)) {
  console.error('ERROR: insertion marker "次に読むべき記事" not found.');
  process.exit(1);
}

const formatted = formatBlocks(current.content);
const withFAQ = formatted.replace(NEXT_ARTICLES_MARKER, `${FAQ_BLOCK}\n$&`);

console.log('=== Title ===');
console.log('OLD:', current.title);
console.log('NEW:', NEW_TITLE);
console.log();
console.log('=== Description ===');
console.log('OLD:', current.description);
console.log('NEW:', NEW_DESCRIPTION);
console.log();
console.log('=== Content delta (last 1200 chars of new) ===');
console.log(withFAQ.slice(-1200));
console.log();
console.log('OLD length:', current.content.length, '  NEW length:', withFAQ.length);

if (!APPLY) {
  console.log('\n[dry-run] Pass --apply to PATCH MicroCMS.');
  process.exit(0);
}

await client.update({
  endpoint: 'columns',
  contentId: 'requirements-vs-requests',
  content: {
    title: NEW_TITLE,
    description: NEW_DESCRIPTION,
    content: withFAQ,
  },
});

console.log('\nPATCH done. Verifying...');
const after = await client.get({ endpoint: 'columns', contentId: 'requirements-vs-requests' });
console.log('after.title:', after.title);
console.log('after.description:', after.description);
console.log('after.content length:', after.content.length);
const stillHasH2 = /<h2[^>]*>\s*関連用語の整理/.test(after.content);
const stillHasNext = /<h2[^>]*>\s*次に読むべき記事/.test(after.content);
console.log('FAQ h2 present:', stillHasH2);
console.log('"次に読むべき記事" h2 present:', stillHasNext);
