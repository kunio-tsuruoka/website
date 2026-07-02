import { createClient } from 'microcms-js-sdk';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
const id = process.argv[2];
const c = await client.get({
  endpoint: 'columns',
  contentId: id,
  queries: { fields: 'id,title,description,content' },
});
console.log(`ID: ${c.id}\nTITLE: ${c.title}\nDESC: ${c.description || '(none)'}\n--- CONTENT ---`);
console.log(c.content);
