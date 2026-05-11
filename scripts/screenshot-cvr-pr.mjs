#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'claudedocs', 'screenshots', 'cvr-quick-wins');
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL || 'http://localhost:4321';

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function shoot(page, viewport, path, file) {
  await page.setViewportSize(viewport);
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
  await page.addStyleTag({
    content:
      'astro-dev-toolbar, astro-dev-overlay { display: none !important; visibility: hidden !important; }',
  });
  await page.waitForTimeout(3500); // give Turnstile time to render
  const out = join(OUT, file);
  await page.screenshot({ path: out, fullPage: true });
  console.log('saved', out);
}

const targets = [
  { path: '/', file: 'home-desktop.png', viewport: DESKTOP },
  { path: '/', file: 'home-mobile.png', viewport: MOBILE },
  { path: '/contact', file: 'contact-desktop.png', viewport: DESKTOP },
  { path: '/contact', file: 'contact-mobile.png', viewport: MOBILE },
  { path: '/downloads/zero-start', file: 'download-zero-start-desktop.png', viewport: DESKTOP },
  { path: '/downloads/zero-start', file: 'download-zero-start-mobile.png', viewport: MOBILE },
];

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

for (const t of targets) {
  try {
    await shoot(page, t.viewport, t.path, t.file);
  } catch (e) {
    console.error('fail', t.path, e?.message ?? e);
  }
}

// Open mobile menu screenshot (tall viewport to capture bottom CTAs)
try {
  await page.setViewportSize({ width: 390, height: 1600 });
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
  await page.addStyleTag({
    content:
      'astro-dev-toolbar, astro-dev-overlay { display: none !important; visibility: hidden !important; }',
  });
  await page.waitForTimeout(800);
  await page.click('button[aria-label="メニューを開閉"]');
  await page.waitForTimeout(800);
  // Scroll modal to bottom to ensure new buttons are in screenshot
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0 .bg-navy-950');
    if (modal) modal.scrollTo({ top: modal.scrollHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, 'mobile-menu-bottom.png'), fullPage: false });
  console.log('saved mobile-menu-bottom.png');

  // Also take a screenshot at top of the menu
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0 .bg-navy-950');
    if (modal) modal.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, 'mobile-menu-top.png'), fullPage: false });
  console.log('saved mobile-menu-top.png');
} catch (e) {
  console.error('mobile-menu fail', e?.message ?? e);
}

await browser.close();
