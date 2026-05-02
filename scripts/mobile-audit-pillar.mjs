import { chromium, devices } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321/column/project-management-complete-guide';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const items = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('a, button').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width >= 32 && r.height >= 32) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') return;

    const path = [];
    let cur = el;
    while (cur && cur !== document.body && path.length < 6) {
      const cls = (cur.className || '').toString().slice(0, 50);
      path.push(`${cur.tagName.toLowerCase()}${cls ? '.' + cls.split(' ')[0] : ''}`);
      cur = cur.parentElement;
    }

    out.push({
      tag: el.tagName.toLowerCase(),
      w: Math.round(r.width),
      h: Math.round(r.height),
      txt: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 50),
      cls: (el.className || '').toString().slice(0, 100),
      href: el.getAttribute('href') || '',
      path: path.slice(0, 4).join(' > '),
    });
  });
  return out;
});

for (const i of items) {
  console.log(`${i.h}x${i.w}px [${i.tag}] "${i.txt}" href=${i.href}`);
  console.log(`  path: ${i.path}`);
  console.log(`  cls: ${i.cls}`);
}
console.log(`\nTotal: ${items.length}`);
await browser.close();
