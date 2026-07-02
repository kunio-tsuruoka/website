import { createClient } from 'microcms-js-sdk';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const ids = process.argv.slice(2);
for (const id of ids) {
  const c = await client.get({
    endpoint: 'columns',
    contentId: id,
    queries: { fields: 'id,title,description,content' },
  });
  console.log(`\n========== ${c.id} ==========`);
  console.log(`TITLE: ${c.title}`);
  console.log(`DESC: ${c.description || '(none)'}`);
  console.log(`--- CONTENT (length=${c.content.length}) ---`);
  console.log(c.content);
}
