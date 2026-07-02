import { createClient } from 'microcms-js-sdk';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// Get one ai-development article that has FAQ
const res = await client.get({
  endpoint: 'columns',
  queries: { filters: 'category[equals]ai-development', fields: 'id,title,content', limit: 100 },
});

const withFaq = res.contents.filter((c) => /よくある質問/.test(c.content || ''));
console.log(`AI columns with FAQ: ${withFaq.length}`);
if (withFaq[0]) {
  const c = withFaq[0];
  console.log(`\n=== Sample: ${c.id} :: ${c.title} ===`);
  const idx = c.content.indexOf('よくある質問');
  console.log(c.content.substring(Math.max(0, idx - 100), idx + 1500));
}
