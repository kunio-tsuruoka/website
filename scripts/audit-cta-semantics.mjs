import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

async function audit(label, url, selectors) {
  console.log(`\n========== ${label} ==========`);
  console.log(`URL: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  for (const sel of selectors) {
    const els = await page.locator(sel).evaluateAll((nodes) =>
      nodes.map((n) => ({
        tag: n.tagName.toLowerCase(),
        role: n.getAttribute('role'),
        type: n.getAttribute('type'),
        href: n.getAttribute('href'),
        text: (n.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
        rect: (() => {
          const r = n.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        })(),
        styleLook: ((s) => {
          const cs = getComputedStyle(s);
          return {
            display: cs.display,
            bg: cs.backgroundColor,
            border: cs.borderRadius,
            cursor: cs.cursor,
          };
        })(n),
      }))
    );
    console.log(`\n  selector: ${sel}  (${els.length} found)`);
    for (const e of els) {
      console.log(
        `    <${e.tag}${e.role ? ` role="${e.role}"` : ''}${e.type ? ` type="${e.type}"` : ''}${e.href ? ` href="${e.href}"` : ''}>`
      );
      console.log(`      text: "${e.text}"  size: ${e.rect.w}x${e.rect.h}`);
      console.log(
        `      style: bg=${e.styleLook.bg} radius=${e.styleLook.border} cursor=${e.styleLook.cursor}`
      );
    }
  }
}

await audit(
  '記事末尾CTA (project-management 系)',
  `${BASE}/column/project-management-complete-guide`,
  ['a.column-cta-primary, a.column-cta-sub']
);

await audit('ツール: flow-mapper', `${BASE}/tools/flow-mapper`, ['a.tool-escape-cta']);

await audit('ツール: scope-manager', `${BASE}/tools/scope-manager`, ['a.tool-escape-cta']);

await audit('ツール: story-builder', `${BASE}/tools/story-builder`, ['a.tool-escape-cta']);

await audit('お問い合わせフォーム', `${BASE}/contact`, [
  'button[type="submit"]',
  'a[href^="mailto:"]',
  'a[href^="tel:"]',
]);

await browser.close();
