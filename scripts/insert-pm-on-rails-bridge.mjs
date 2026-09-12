/**
 * エンジニア向けクラスタ（Gherkin・仕様駆動開発・AI駆動開発）の記事に、
 * PM on Rails への導線を1記事1本で揃える。
 *
 * 背景（2026-09-12）:
 *   #194/#201 で gherkin-bdd-introduction と user-story-template-examples には
 *   ウェイトリストへのテキストリンク（UTM付き）が入ったが、他の記事は
 *   「UTM無しの素リンク」「intent/source 形式」「名前だけ出てリンク無し」とばらばらだった。
 *   {{PM_ON_RAILS_BRIDGE}}（src/lib/column-visuals.ts）を正として、
 *   スタンドアロンのリンク段落はマーカーに置換し、地の文の中のリンクは href だけ UTM 付きに直す。
 *
 * 前提: {{PM_ON_RAILS_BRIDGE}} を描画するコードが本番デプロイ済みであること
 *       （逆順にすると本番にリテラルのマーカーが露出する。.claude/rules/microcms.md）。
 *
 * 使い方:
 *   node --env-file=.env scripts/insert-pm-on-rails-bridge.mjs                         # dry-run（既定）
 *   node --env-file=.env scripts/insert-pm-on-rails-bridge.mjs --apply --backup-dir=<path>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const backupDir = process.argv
  .find((a) => a.startsWith('--backup-dir='))
  ?.slice('--backup-dir='.length);

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const MARKER = '{{PM_ON_RAILS_BRIDGE}}';

/** column-visuals.ts の buildPmOnRailsWaitlistUrl と同じ規約（属性値なので & は実体参照） */
function utmUrl(slug, path = '/waitlist') {
  const params = new URLSearchParams({
    utm_source: 'beekle.jp',
    utm_medium: 'column',
    utm_campaign: 'technical_cluster',
    utm_content: slug,
  });
  return `https://pmonrails.com${path}?${params.toString().replace(/&/g, '&amp;')}`;
}

const textOf = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** 指定テキストを含む <h2> の開始位置 */
function findH2(html, re) {
  const headRe = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g;
  let m = headRe.exec(html);
  while (m !== null) {
    if (re.test(textOf(m[1]))) return m.index;
    m = headRe.exec(html);
  }
  return -1;
}

/**
 * slug → 変換。各 fn は { html, note } を返す。変更不要なら html をそのまま返す。
 * 対象は「読者がエンジニア／テックリード」の記事だけ。買い手クラスタ
 * （scenario-test-cost-reduction, project-management-complete-guide, ai-driven-development 等）は入れない。
 */
const TARGETS = {
  // #194 でテキストリンク化済み。スタンドアロンのリンク段落をカードに置換（リンク本数は1のまま）
  'gherkin-bdd-introduction': (html, slug) => {
    const re =
      /<p><a href="https:\/\/pmonrails\.com\/waitlist\?[^"]*"[^>]*>PM on Railsのウェイティングリストに登録する<\/a><\/p>/;
    if (!re.test(html)) return { html, note: 'テキストリンク段落が見つからない' };
    return { html: html.replace(re, `<p>${MARKER}</p>`), note: 'リンク段落 → カード' };
  },
  'user-story-template-examples': (html, slug) => {
    const re =
      /<p><a href="https:\/\/pmonrails\.com\/waitlist\?[^"]*"[^>]*>PM on Railsの仕組みを見る<\/a><\/p>/;
    if (!re.test(html)) return { html, note: 'テキストリンク段落が見つからない' };
    return { html: html.replace(re, `<p>${MARKER}</p>`), note: 'リンク段落 → カード' };
  },
  // 素の <p><a href="https://pmonrails.com/">PM on Railsを見る</a></p> をカードに置換
  'requirements-definition-template': (html, slug) => {
    const re = /<p><a href="https:\/\/pmonrails\.com\/?">PM on Railsを見る<\/a><\/p>/;
    if (!re.test(html)) return { html, note: '素リンク段落が見つからない' };
    return { html: html.replace(re, `<p>${MARKER}</p>`), note: '素リンク段落 → カード' };
  },
  // 名前だけ3回出てリンクが無い。「参考にした書籍」の直前にカードを挿入
  'ai-agent-gherkin-evidence': (html, slug) => {
    if (html.includes('pmonrails.com')) return { html, note: '既にリンクあり' };
    const at = findH2(html, /参考にした書籍/);
    if (at === -1) return { html, note: '「参考にした書籍」見出しが見つからない' };
    return {
      html: `${html.slice(0, at)}\n<p>${MARKER}</p>\n${html.slice(at)}`,
      note: '「参考にした書籍」直前にカード挿入',
    };
  },
  // 地の文の中のリンク。文章は触らず href だけ UTM 付きに（本文中1本のルールなのでカードは足さない）
  'spec-driven-development': (html, slug) => {
    const re =
      /href="https:\/\/pmonrails\.com\/\?intent=column-bridge&amp;source=column-spec-driven-development"/;
    if (!re.test(html)) return { html, note: 'intent/source 形式のリンクが見つからない' };
    return { html: html.replace(re, `href="${utmUrl(slug, '/')}"`), note: 'href を UTM 形式に' };
  },
  // 地の文の中に生URLがアンカーテキストで出ている。表示は変えず href だけ UTM 付きに
  'ai-development-dor-gherkin': (html, slug) => {
    const re = /<a href="https:\/\/pmonrails\.com\/">https:\/\/pmonrails\.com\/<\/a>/;
    if (!re.test(html)) return { html, note: '生URLリンクが見つからない' };
    return {
      html: html.replace(re, `<a href="${utmUrl(slug, '/')}">https://pmonrails.com/</a>`),
      note: 'href を UTM 形式に（表示テキストは据え置き）',
    };
  },
};

if (apply && !backupDir) {
  console.error('--apply には --backup-dir=<path> が必須です');
  process.exit(1);
}
if (apply) mkdirSync(backupDir, { recursive: true });

console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}\n`);

const errors = [];
let changed = 0;

for (const [slug, transform] of Object.entries(TARGETS)) {
  let current;
  try {
    current = await client.get({
      endpoint: 'columns',
      contentId: slug,
      queries: { fields: 'id,title,content' },
    });
  } catch (e) {
    errors.push(`${slug}: 取得失敗 ${e.message}`);
    continue;
  }

  const before = current.content;
  if (before.includes(MARKER)) {
    console.log(`[${slug}] 既に ${MARKER} あり — スキップ`);
    continue;
  }

  const { html, note } = transform(before, slug);
  if (html === before) {
    errors.push(`${slug}: 変更なし（${note}）`);
    continue;
  }

  // 導線は1記事1本: pmonrails.com へのリンク＋マーカーの合計が1であることを固定する
  const links =
    (html.match(/href="https:\/\/pmonrails\.com/g) || []).length + (html.includes(MARKER) ? 1 : 0);
  if (links !== 1) {
    errors.push(`${slug}: PM on Rails 導線が ${links} 本になる（1本にする）`);
    continue;
  }

  changed += 1;
  console.log(`[${slug}] ${note} / ${before.length} → ${html.length} bytes`);

  if (apply) {
    writeFileSync(`${backupDir}/${slug}.html`, before, 'utf8');
    try {
      await client.update({ endpoint: 'columns', contentId: slug, content: { content: html } });
      const after = await client.get({
        endpoint: 'columns',
        contentId: slug,
        queries: { fields: 'content' },
      });
      // サニタイザに剥がされていないか（PATCH は 200 でも本文が変わらないことがある）
      const ok =
        after.content.includes(MARKER) || after.content.includes('utm_campaign=technical_cluster');
      console.log(
        ok ? '   PATCH OK（再取得で反映確認）' : '   PATCH 後の再取得で変更が見えない（要確認）'
      );
      if (!ok) errors.push(`${slug}: PATCH 後に反映されていない`);
    } catch (e) {
      errors.push(`${slug}: PATCH失敗 ${e.message}`);
    }
  }
}

console.log(`\n変更対象: ${changed} 記事`);
if (errors.length) {
  console.log('\n--- 要確認 ---');
  for (const e of errors) console.log(`  ${e}`);
  process.exit(1);
}
console.log(apply ? '完了' : 'dry-run 完了（--apply で反映）');
