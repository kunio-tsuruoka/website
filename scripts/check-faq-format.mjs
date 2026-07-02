import { createClient } from 'microcms-js-sdk';
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});
// Get one column we know has FAQ
const c = await client.get({
  endpoint: 'columns',
  contentId: 'estimate-complete-guide',
  queries: { fields: 'id,title,content' },
});
const idx = c.content.search(/よくある質問|<h[23][^>]*>Q[0-9]?\.|<p><strong>Q\.|<p>Q\./);
if (idx >= 0) {
  console.log(`FAQ section starts at offset ${idx}:`);
  console.log(c.content.substring(idx, idx + 2500));
} else {
  console.log('No FAQ found in this article');
}
