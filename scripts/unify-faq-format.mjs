/**
 * コラム記事内のFAQ形式を統一するスクリプト
 *
 * MicroCMS記事本文中のインラインFAQパターンを見出し形式に変換し、
 * MicroCMS APIで更新する。
 *
 * 対象パターン（HTML）:
 *   - <p>Q. question A. answer</p>
 *   - <p><strong>Q. question</strong> A. answer</p>
 *   - <p>Q. question</p><p>A. answer</p>
 *   - <p>FAQ</p> → <h2>FAQ</h2>
 *
 * 変換後:
 *   <h2>FAQ</h2> (既にあれば維持)
 *   <h2>Q1. question</h2><p>A. answer</p>
 *
 * 使い方:
 *   node scripts/unify-faq-format.mjs          # 変換が必要な記事のみ更新
 *   node scripts/unify-faq-format.mjs --dry    # プレビュー（保存しない）
 */

import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;

if (!MICROCMS_SERVICE_DOMAIN || !MICROCMS_API_KEY) {
  console.error('Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY');
  process.exit(1);
}

const client = createClient({
  serviceDomain: MICROCMS_SERVICE_DOMAIN,
  apiKey: MICROCMS_API_KEY,
});

const dryRun = process.argv.includes('--dry');

/**
 * 記事HTML内のインラインFAQを見出し形式に変換
 */
function convertFaqHtml(content) {
  let result = content;
  let changed = false;
  let qCounter = 0;

  // 既存の ## Q1. 形式の番号を取得
  const existingNums = [...result.matchAll(/<h2[^>]*>Q(\d+)\./g)].map((m) =>
    Number.parseInt(m[1]),
  );
  if (existingNums.length > 0) {
    qCounter = Math.max(...existingNums);
  }

  // 「<p>FAQ</p>」→「<h2>FAQ</h2>」に変換
  result = result.replace(/<p>FAQ<\/p>/g, () => {
    changed = true;
    return '<h2 id="h330c4af367">FAQ</h2>';
  });

  // パターン1: <p><strong>Q. question</strong> A. answer</p>
  result = result.replace(
    /<p(?:\s[^>]*)?>(?:\s*)<strong>Q\.\s*(.*?)<\/strong>\s*A\.\s*([\s\S]*?)<\/p>/g,
    (_match, q, a) => {
      changed = true;
      qCounter++;
      return `<h2>Q${qCounter}. ${q.trim()}</h2><p>A. ${a.trim()}</p>`;
    },
  );

  // パターン2: <p>Q. question</p><p>A. answer</p>（別々のpタグ）
  result = result.replace(
    /<p(?:\s[^>]*)?>Q\.\s*(.*?)<\/p>\s*<p(?:\s[^>]*)?>A\.\s*([\s\S]*?)<\/p>/g,
    (_match, q, a) => {
      changed = true;
      qCounter++;
      return `<h2>Q${qCounter}. ${q.trim()}</h2><p>A. ${a.trim()}</p>`;
    },
  );

  // パターン3: <p>Q. question A. answer</p>（1つのpタグ内）
  result = result.replace(
    /<p(?:\s[^>]*)?>Q\.\s*(.*?)\s+A\.\s*([\s\S]*?)<\/p>/g,
    (_match, q, a) => {
      changed = true;
      qCounter++;
      return `<h2>Q${qCounter}. ${q.trim()}</h2><p>A. ${a.trim()}</p>`;
    },
  );

  return { content: result, changed, qCount: qCounter };
}

async function main() {
  console.log('Fetching articles from MicroCMS...');
  const data = await client.get({
    endpoint: 'columns',
    queries: { limit: 100, fields: 'id,title,content' },
  });

  const articles = data.contents;
  console.log(`Found ${articles.length} articles\n`);

  let updated = 0;
  let skipped = 0;

  for (const article of articles) {
    // インラインFAQパターンがあるか検出
    const hasInlineFaq =
      /<p[^>]*>(?:<strong>)?Q\.\s/m.test(article.content) ||
      /<p>FAQ<\/p>/m.test(article.content);

    if (!hasInlineFaq) {
      skipped++;
      continue;
    }

    console.log(`🔄 ${article.id} (${article.title})`);

    const { content: newContent, changed, qCount } = convertFaqHtml(article.content);

    if (!changed) {
      console.log('   ⏭️  No changes needed');
      skipped++;
      continue;
    }

    console.log(`   → ${qCount} FAQ items converted`);

    // 変換後のFAQ見出しを表示
    const faqHeadings = [...newContent.matchAll(/<h2>Q\d+\.\s*(.*?)<\/h2>/g)];
    for (const m of faqHeadings) {
      console.log(`   → Q: ${m[1]}`);
    }

    if (!dryRun) {
      await client.update({
        endpoint: 'columns',
        contentId: article.id,
        content: { content: newContent },
      });
      console.log('   ✅ saved to MicroCMS');
    } else {
      console.log('   (dry run - not saved)');
    }

    updated++;

    // レート制限対策
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
