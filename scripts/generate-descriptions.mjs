/**
 * コラム記事のmeta descriptionをOpenRouter経由でAI生成し、MicroCMSに保存するスクリプト
 *
 * 前提条件:
 *   - MicroCMSの「columns」スキーマに「description」テキストフィールドを追加済み
 *   - 環境変数: MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY, OPENROUTER_API_KEY
 *
 * 使い方:
 *   node scripts/generate-descriptions.mjs          # descriptionが空の記事のみ生成
 *   node scripts/generate-descriptions.mjs --all    # 全記事を再生成
 *   node scripts/generate-descriptions.mjs --dry    # 生成結果を表示のみ（保存しない）
 */

import 'dotenv/config';
import { createClient } from 'microcms-js-sdk';

const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();

if (!MICROCMS_SERVICE_DOMAIN || !MICROCMS_API_KEY) {
  console.error('Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY');
  process.exit(1);
}
if (!OPENROUTER_API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

const client = createClient({
  serviceDomain: MICROCMS_SERVICE_DOMAIN,
  apiKey: MICROCMS_API_KEY,
});

const flags = process.argv.slice(2);
const forceAll = flags.includes('--all');
const dryRun = flags.includes('--dry');

/**
 * OpenRouter経由でmeta descriptionを生成
 */
async function generateDescription(title, content) {
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const truncated = plainText.substring(0, 2000);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `以下のブログ記事のmeta descriptionを生成してください。

ルール:
- 80〜120文字以内（日本語）
- 記事の核心的な価値を簡潔に伝える
- 感嘆符や疑問符は使わない
- 「この記事では」「本記事では」などの前置きは不要
- 検索ユーザーがクリックしたくなる内容にする
- 穏やかで専門的なトーン

タイトル: ${title}

本文:
${truncated}

meta descriptionのみを出力してください。`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim().replace(/^["「]|["」]$/g, '');
}

async function main() {
  console.log('Fetching articles from MicroCMS...');
  const data = await client.get({
    endpoint: 'columns',
    queries: { limit: 100, fields: 'id,title,content,description' },
  });

  const articles = data.contents;
  console.log(`Found ${articles.length} articles\n`);

  let generated = 0;
  let skipped = 0;

  for (const article of articles) {
    if (article.description && !forceAll) {
      console.log(`⏭️  ${article.id}: already has description, skipping`);
      skipped++;
      continue;
    }

    console.log(`🔄 ${article.id}: generating...`);
    try {
      const description = await generateDescription(article.title, article.content);
      console.log(`   → ${description}`);

      if (!dryRun) {
        await client.update({
          endpoint: 'columns',
          contentId: article.id,
          content: { description },
        });
        console.log('   ✅ saved to MicroCMS');
      } else {
        console.log('   (dry run - not saved)');
      }

      generated++;

      // レート制限対策
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
