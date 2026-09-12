/**
 * project-management カテゴリの全記事に {{PM_ON_RAILS_ASSURANCE}} を1本入れる。
 *
 * 背景（2026-09-12 ユーザー判断）:
 *   project-management の記事は読者がエンジニアに寄っていて買い手クエリではないので、
 *   コンバージョンを PM on Rails ウェイトリストに揃える。記事末CTAは column-cta-mapping.ts の
 *   カテゴリ既定で切り替え、本文側はこのブロック（h3＋安心の3段落＋ブリッジカード）で揃える。
 *
 * 挿入ルール:
 *   - 既に pmonrails.com への導線（リンク or {{PM_ON_RAILS_BRIDGE}}）がある記事は飛ばす（1記事1本）
 *   - 本文末尾側の相談マーカー（{{CONTACT_CTA}} / {{ZERO_START_CONSULT_CTA}} / {{*_CONSULT}}、_MID は除く）は
 *     このブロックに置き換える（相談は記事末の副CTAに残る）
 *   - 相談マーカーが無ければ、「関連記事」「次に読むべき記事」「参考文献」「ご相談」の h2 の直前、
 *     それも無ければ本文末尾に追加する
 *
 * 前提: {{PM_ON_RAILS_ASSURANCE}} を描画するコードが本番デプロイ済みであること
 *       （逆順にすると本番にリテラルのマーカーが露出する。.claude/rules/microcms.md）。
 *
 * 使い方:
 *   node --env-file=.env scripts/insert-pm-on-rails-assurance.mjs                          # dry-run（既定）
 *   node --env-file=.env scripts/insert-pm-on-rails-assurance.mjs --apply --backup-dir=<path>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from 'microcms-js-sdk';

const apply = process.argv.includes('--apply');
const backupDir = process.argv
  .find((a) => a.startsWith('--backup-dir='))
  ?.slice('--backup-dir='.length);
if (apply && !backupDir) {
  console.error('--apply には --backup-dir=<path> が必須です');
  process.exit(1);
}

const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

const MARKER = '{{PM_ON_RAILS_ASSURANCE}}';
const BLOCK = `<p>${MARKER}</p>`;
const CATEGORY = 'project-management';
/** 買い手経路として残す記事（記事末も本文も相談のまま）。ユーザー判断 2026-09-12 */
const EXCLUDE = new Set(['how-to-write-rfp']);

/** 末尾側の相談マーカー（_MID は本文中盤用なので触らない） */
const TRAILING_CONSULT_RE =
  /<p>\s*\{\{(CONTACT_CTA|ZERO_START_CONSULT_CTA|[A-Z_]+_CONSULT)\}\}\s*<\/p>\n?/g;
const TAIL_H2_RE =
  /<h2(?:\s[^>]*)?>\s*(関連記事|次に読むべき記事|参考文献|ご相談|あわせて読みたい)\s*<\/h2>/;

function hasPmOnRailsLink(html) {
  return (
    html.includes('pmonrails.com') ||
    html.includes('{{PM_ON_RAILS_BRIDGE}}') ||
    html.includes(MARKER)
  );
}

function transform(html) {
  if (hasPmOnRailsLink(html)) return { html, note: '既に PM on Rails 導線あり（skip）' };
  const consults = [...html.matchAll(TRAILING_CONSULT_RE)];
  if (consults.length > 0) {
    // 最後の相談マーカーをブロックに置き換え、他の末尾相談マーカーは削除
    const last = consults[consults.length - 1];
    let next = `${html.slice(0, last.index)}${BLOCK}\n${html.slice(last.index + last[0].length)}`;
    for (const m of consults.slice(0, -1).reverse()) {
      next = next.slice(0, m.index) + next.slice(m.index + m[0].length);
    }
    // 「ご相談」見出しの直下にあった場合は、その見出しも外す（PM on Rails ブロックの見出しは自前で持つ）
    next = next.replace(
      /<h2(?:\s[^>]*)?>\s*ご相談\s*<\/h2>\n?(?=<p>\{\{PM_ON_RAILS_ASSURANCE\}\}<\/p>)/,
      ''
    );
    return { html: next, note: `相談マーカー ${consults.map((m) => m[1]).join(',')} を置換` };
  }
  const h2 = html.match(TAIL_H2_RE);
  if (h2) {
    return {
      html: `${html.slice(0, h2.index)}${BLOCK}\n${html.slice(h2.index)}`,
      note: `「${h2[1]}」の直前に挿入`,
    };
  }
  return { html: `${html.replace(/\s*$/, '')}\n${BLOCK}`, note: '末尾に追加' };
}

async function fetchAll() {
  const out = [];
  for (let offset = 0; ; offset += 100) {
    const res = await client.get({
      endpoint: 'columns',
      queries: {
        limit: 100,
        offset,
        fields: 'id,title,content',
        filters: `category[equals]${CATEGORY}`,
      },
    });
    out.push(...res.contents);
    if (out.length >= res.totalCount) break;
  }
  return out;
}

const columns = await fetchAll();
console.log(`${CATEGORY}: ${columns.length} 記事 (${apply ? 'APPLY' : 'dry-run'})`);
if (apply) mkdirSync(backupDir, { recursive: true });
let changed = 0;
for (const col of columns) {
  const { html, note } = EXCLUDE.has(col.id)
    ? { html: col.content, note: '買い手記事として除外（skip）' }
    : transform(col.content);
  if (html === col.content) {
    console.log(`- ${col.id}: ${note}`);
    continue;
  }
  const links =
    (html.match(/href="https:\/\/pmonrails\.com/g) || []).length +
    (html.includes('{{PM_ON_RAILS_BRIDGE}}') ? 1 : 0) +
    (html.includes(MARKER) ? 1 : 0);
  if (links !== 1) {
    console.log(`! ${col.id}: 導線が ${links} 本になるため中断`);
    continue;
  }
  console.log(`* ${col.id}: ${note}`);
  changed++;
  if (!apply) continue;
  writeFileSync(`${backupDir}/${col.id}.before.html`, col.content);
  try {
    await client.update({ endpoint: 'columns', contentId: col.id, content: { content: html } });
    const after = await client.get({
      endpoint: 'columns',
      contentId: col.id,
      queries: { fields: 'content' },
    });
    console.log(
      `  -> ${after.content.includes(MARKER) ? 'OK' : 'NG: マーカーが反映されていない（公開ステータスを確認）'}`
    );
  } catch (e) {
    console.log(`  -> PATCH 失敗: ${e.message ?? e}`);
  }
  await new Promise((r) => setTimeout(r, 1200));
}
console.log(`変更対象 ${changed} 記事`);
