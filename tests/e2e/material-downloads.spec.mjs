// テンプレート・資料取得導線のE2E
// 起動方法:
//   ターミナル1: bun dev
//   ターミナル2: node tests/e2e/material-downloads.spec.mjs

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4321';
const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const events = [];
let apiContactHits = 0;
await page.exposeFunction('__captureMaterialEvent', (event) => {
  events.push(event);
});
await page.addInitScript(() => {
  const installHook = () => {
    window.dataLayer = window.dataLayer || [];
    if (window.__materialDownloadHookInstalled) return;
    window.__materialDownloadHookInstalled = true;
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (...args) => {
      for (const arg of args) {
        if (arg && typeof arg === 'object' && arg[0] === 'event' && typeof arg[1] === 'string') {
          window.__captureMaterialEvent({
            name: arg[1],
            params: arg[2] || null,
            path: location.pathname,
          });
        }
      }
      return originalPush(...args);
    };
  };
  installHook();
  setTimeout(installHook, 200);
});
await context.route('**/api/contact', (route) => {
  apiContactHits += 1;
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  });
});

try {
  events.length = 0;
  apiContactHits = 0;
  const templateRes = await context.request.get(`${BASE}/docs/requirements-definition-template.md`);
  const templateText = await templateRes.text();
  record(
    '要件定義テンプレートは公開URLから直接取得できる',
    templateRes.status() === 200 && templateText.includes('# 要件定義書テンプレート'),
    `status=${templateRes.status()}`
  );
  record('/api/contact を呼ばない', apiContactHits === 0, `hits=${apiContactHits}`);
  record(
    'テンプレート取得をContact Conversion計測しない',
    !events.some((e) => ['generate_lead', 'form_submit', 'contact_complete'].includes(e.name)),
    events.map((e) => e.name).join(', ') || 'events=none'
  );

  const deckRes = await context.request.get(`${BASE}/downloads/beekle-zero-start-sales-deck.pdf`);
  record('サービス資料PDFは直接取得できる', deckRes.status() === 200, `status=${deckRes.status()}`);

  const columnRes = await page.goto(`${BASE}/column`, { waitUntil: 'networkidle' });
  const deprecatedCtaCount = await page
    .locator('a[href*="/downloads/zero-start"], [data-cta-id="download-zero-start"]')
    .count();
  record(
    '/column に廃止済みdownload-zero-start導線がない',
    deprecatedCtaCount === 0,
    `count=${deprecatedCtaCount}`
  );
  record('/column が表示できる', columnRes?.status() === 200, `status=${columnRes?.status() ?? 0}`);

  const oldRouteRes = await page.goto(`${BASE}/downloads/zero-start`, {
    waitUntil: 'domcontentloaded',
  });
  record(
    '廃止済みフォームLP /downloads/zero-start は公開されていない',
    oldRouteRes?.status() === 404,
    `status=${oldRouteRes?.status() ?? 0}`
  );
} finally {
  await browser.close();
}

const failed = results.filter((result) => !result.ok);
console.log('\n========================================');
console.log(
  `Total: ${results.length} / Passed: ${results.length - failed.length} / Failed: ${failed.length}`
);
console.log('========================================');
if (failed.length > 0) {
  console.log('\nFailed tests:');
  for (const result of failed) console.log(`  ✗ ${result.name} — ${result.detail}`);
  process.exit(1);
}
