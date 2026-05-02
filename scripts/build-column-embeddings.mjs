/**
 * MicroCMSの全コラム記事をWorkers AI BGE-M3で埋め込み、
 * src/data/column-embeddings.json に書き出す。
 *
 * 前提:
 *   - 環境変数: MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY,
 *               CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 *   - 記事追加・更新後に手動で実行 → 生成JSONをcommit
 *
 * 使い方:
 *   node scripts/build-column-embeddings.mjs
 *   node scripts/build-column-embeddings.mjs --dry   # 件数とサンプルだけ表示
 */

import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from 'microcms-js-sdk';
import { BEEKLE_GLOSSARY } from './beekle-glossary.mjs';

const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;
// CLOUDFLARE_API_TOKEN は env > .cloudflare/api-token (gitignored) の優先順位
const TOKEN_FILE = resolve(process.cwd(), '.cloudflare/api-token');
const CF_TOKEN =
  process.env.CLOUDFLARE_API_TOKEN ??
  (existsSync(TOKEN_FILE) ? readFileSync(TOKEN_FILE, 'utf8').trim() : null);
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID ?? '163fc8ca531cbe925ad7597ee0196f3a';

if (!MICROCMS_SERVICE_DOMAIN || !MICROCMS_API_KEY) {
  console.error('Missing MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY');
  process.exit(1);
}
if (!CF_TOKEN) {
  console.error('Missing CLOUDFLARE_API_TOKEN (need Workers AI access)');
  process.exit(1);
}

const dry = process.argv.includes('--dry');
const OUT_PATH = resolve(process.cwd(), 'src/data/column-embeddings.json');
const MODEL = '@cf/baai/bge-m3';
const MAX_BODY_FOR_EMBED = 1500; // 埋め込み入力の長さ
const MAX_EXCERPT_FOR_PROMPT = 700; // LLM へ送る抜粋（具体的に引用させるため長め）

const client = createClient({
  serviceDomain: MICROCMS_SERVICE_DOMAIN,
  apiKey: MICROCMS_API_KEY,
});

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function embed(texts) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/${MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${CF_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  });
  if (!res.ok) {
    throw new Error(`Workers AI ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(`Workers AI error: ${JSON.stringify(json.errors)}`);
  }
  return json.result.data;
}

async function fetchAllColumns() {
  const data = await client.get({
    endpoint: 'columns',
    queries: { orders: '-publishedAt', limit: 100 },
  });
  return data.contents;
}

async function main() {
  console.log('Fetching columns from MicroCMS...');
  const columns = await fetchAllColumns();
  console.log(`Found ${columns.length} columns`);

  const records = [];
  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    const plainBody = stripHtml(c.content ?? '');
    const embedText = `${c.title}\n\n${c.description ?? ''}\n\n${plainBody.slice(
      0,
      MAX_BODY_FOR_EMBED
    )}`.trim();
    // LLM に渡す抜粋は description + 本文先頭をしっかり長めに。
    const excerptParts = [c.description?.trim() ?? '', plainBody].filter(Boolean);
    const excerpt = excerptParts.join('\n').slice(0, MAX_EXCERPT_FOR_PROMPT);

    if (dry) {
      console.log(`[${i + 1}/${columns.length}] ${c.id} :: ${c.title}`);
      records.push({ id: c.id, title: c.title, url: `/column/${c.id}`, excerpt });
      continue;
    }

    process.stdout.write(`[${i + 1}/${columns.length}] ${c.id}... `);
    const [vector] = await embed([embedText]);
    process.stdout.write(`done (dim=${vector.length})\n`);
    records.push({
      id: c.id,
      title: c.title,
      url: `/column/${c.id}`,
      excerpt,
      vector,
    });
  }

  console.log(`Embedding ${BEEKLE_GLOSSARY.length} glossary entries...`);
  for (let i = 0; i < BEEKLE_GLOSSARY.length; i++) {
    const g = BEEKLE_GLOSSARY[i];
    const embedText = `${g.title}\n\n${g.excerpt}`.trim();
    if (dry) {
      console.log(`[glossary ${i + 1}/${BEEKLE_GLOSSARY.length}] ${g.id} :: ${g.title}`);
      records.push({ id: g.id, title: g.title, url: g.url, excerpt: g.excerpt });
      continue;
    }
    process.stdout.write(`[glossary ${i + 1}/${BEEKLE_GLOSSARY.length}] ${g.id}... `);
    const [vector] = await embed([embedText]);
    process.stdout.write(`done (dim=${vector.length})\n`);
    records.push({ id: g.id, title: g.title, url: g.url, excerpt: g.excerpt, vector });
  }

  if (dry) {
    console.log('\n--dry mode: not writing file. Sample:');
    console.log(JSON.stringify(records.slice(0, 2), null, 2));
    return;
  }

  const payload = {
    model: MODEL,
    builtAt: new Date().toISOString(),
    records,
  };
  writeFileSync(OUT_PATH, JSON.stringify(payload));
  console.log(`\nWrote ${records.length} embeddings to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
