import { createClient } from 'microcms-js-sdk';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const all = [];
let offset = 0;
while (true) {
  const res = await client.get({
    endpoint: 'columns',
    queries: { fields: 'id,title,category,content', limit: 100, offset },
  });
  all.push(...res.contents);
  if (all.length >= res.totalCount) break;
  offset += 100;
}

// Strict patterns matching what JsonLd FAQ extraction actually picks up
// (matching the regex in src/pages/column/[...slug].astro:140-159)
const STRICT_PATTERNS = [
  /<p><strong>Q\.\s*(.*?)<\/strong>\s*A\.\s*([\s\S]*?)<\/p>/,
  /<p>Q\.\s*(.*?)\s*A\.\s*([\s\S]*?)<\/p>/,
  /<p>Q\.\s*(.*?)<\/p>\s*<p>A\.\s*([\s\S]*?)<\/p>/,
  /<h[23][^>]*>Q\d*\.?\s*([^<]+?)<\/h[23]>[\s\S]*?<p>[\s\S]*?<\/p>/,
];

const strictHasFaq = (c) => STRICT_PATTERNS.some((p) => p.test(c.content || ''));

const byCat = {};
const noFaq = [];
for (const c of all) {
  const cat = c.category?.id || 'uncategorized';
  byCat[cat] ??= { total: 0, withFaq: 0 };
  byCat[cat].total++;
  if (strictHasFaq(c)) byCat[cat].withFaq++;
  else noFaq.push({ id: c.id, title: c.title, cat });
}

console.log(`Total: ${all.length}`);
console.log(`With FAQ (strict, would emit FAQPage schema): ${all.length - noFaq.length}`);
console.log(`No FAQ: ${noFaq.length}`);
console.log('\nPer category:');
for (const [k, v] of Object.entries(byCat).sort()) {
  console.log(`  ${k.padEnd(24)} ${v.withFaq}/${v.total}`);
}
console.log('\nAll non-FAQ columns by category:');
const grouped = {};
for (const c of noFaq) {
  if (!grouped[c.cat]) grouped[c.cat] = [];
  grouped[c.cat].push(c);
}
for (const [cat, list] of Object.entries(grouped).sort()) {
  console.log(`\n[${cat}] ${list.length}本:`);
  for (const c of list) console.log(`  - ${c.id} :: ${c.title}`);
}
