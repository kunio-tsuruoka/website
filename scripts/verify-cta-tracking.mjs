import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const events = [];
await page.exposeFunction('__captureEvent', (e) => {
  events.push(e);
});

await page.addInitScript(() => {
  const installHook = () => {
    if (!window.dataLayer) window.dataLayer = [];
    if (window.__hookInstalled) return;
    window.__hookInstalled = true;
    const orig = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (...args) => {
      try {
        for (const a of args) {
          if (a && typeof a === 'object' && a[0] === 'event' && typeof a[1] === 'string') {
            window.__captureEvent({ name: a[1], params: a[2] || null, url: location.pathname });
          }
        }
      } catch {}
      return orig(...args);
    };
  };
  installHook();
  setTimeout(installHook, 200);
});

// /api/contact をスタブ (Slackに飛ばさない)
await context.route('**/api/contact', (route) => {
  console.log('   [stub] /api/contact -> 200');
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  });
});

async function probeArticle(slug) {
  console.log(`\n=== 記事末尾CTA: /column/${slug} ===`);
  events.length = 0;
  await page.goto(`${BASE}/column/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
  // 記事末尾CTAの主+副リンクが存在するか
  const primary = await page
    .locator('a.column-cta-primary')
    .first()
    .evaluate((el) => ({ href: el.getAttribute('href'), id: el.dataset.ctaId }))
    .catch(() => null);
  const sub = await page
    .locator('a.column-cta-sub')
    .first()
    .evaluate((el) => ({ href: el.getAttribute('href'), id: el.dataset.ctaId }))
    .catch(() => null);
  console.log('   primary:', primary);
  console.log('   sub:', sub);

  // 主CTAクリック → cta_click イベント発火
  if (primary) {
    await page
      .locator('a.column-cta-primary')
      .first()
      .click({ trial: false })
      .catch(() => {});
    await page.waitForTimeout(500);
  }
  console.log(
    '   captured events:',
    events.map((e) => `${e.name}(${JSON.stringify(e.params)})`).join(', ') || '(none)'
  );
}

async function probeTool(toolPath, name) {
  console.log(`\n=== ツール: ${toolPath} ===`);
  events.length = 0;
  await page.goto(`${BASE}${toolPath}`, { waitUntil: 'networkidle', timeout: 30000 });
  const links = await page
    .locator('a.tool-escape-cta')
    .evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), id: el.dataset.ctaId }))
    );
  console.log(`   tool-escape-cta count: ${links.length}`);
  for (const l of links) console.log('     -', l);
  // 上部エスケープリンクをクリック (FlowMapper等の重い JS 後にずれる場合に備え scrollIntoView)
  const top = page.locator('a.tool-escape-cta[data-cta-id*="stuck"]').first();
  if ((await top.count()) > 0) {
    await top.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(200);
    await top.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    console.log(
      '   top-click events:',
      events.map((e) => `${e.name}(${JSON.stringify(e.params)})`).join(', ') || '(none)'
    );
    // /contact ページに飛んでいるはず → URL クエリと hidden フィールド確認
    if (page.url().includes('/contact')) {
      console.log('   landed:', page.url());
    }
  }
}

async function probeContactWithQuery() {
  console.log('\n=== /contact?source=tool-flow-mapper&intent=tool-stuck&phase=start ===');
  events.length = 0;
  await page.goto(`${BASE}/contact?source=tool-flow-mapper&intent=tool-stuck&phase=start`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForSelector('form', { timeout: 5000 });
  await page.selectOption('select[name="type"]', 'consultation');
  await page.fill('input[name="reply_to"]', `cta-test-${Date.now()}@beekle.test`);
  await page.fill(
    'textarea[name="message"]',
    '[CTA計測テスト] source/intent/phase が gtag と Slack に乗るか検証'
  );
  await Promise.all([
    page.waitForURL('**/thanks', { timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
  console.log('   submit後 events:');
  for (const e of events) console.log('     -', e.name, JSON.stringify(e.params));
}

async function probeStaticPageCta(path, expectedSource) {
  console.log(`\n=== 静的ページCTA: ${path} (source=${expectedSource}) ===`);
  events.length = 0;
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
  const selector = `[data-cta-source="${expectedSource}"]`;
  const found = await page.locator(selector).first().count();
  if (found === 0) {
    console.log('   ✗ 要素なし');
    return false;
  }
  // ナビゲーションを止める
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.addEventListener('click', (e) => e.preventDefault(), { capture: true });
  }, selector);
  await page.locator(selector).first().click({ noWaitAfter: true });
  await page.waitForTimeout(200);
  const fired = events.find((e) => e.name === 'cta_click' && e.params?.source === expectedSource);
  console.log(`   ${fired ? '✓ OK' : '✗ NG'}: cta_click ${JSON.stringify(fired?.params || {})}`);
  return Boolean(fired);
}

// 1) 記事末尾CTA (カテゴリ別動線確認)
await probeArticle('project-management-complete-guide');
await probeArticle('estimate-complete-guide');

// 2) ツール内エスケープ
await probeTool('/tools/flow-mapper', 'flow-mapper');
await probeTool('/tools/scope-manager', 'scope-manager');
await probeTool('/tools/story-builder', 'story-builder');

// 3) /contact のクエリ受け取り → submit イベントに source 含まれるか
await probeContactWithQuery();

// 4) 新規instrument済み静的ページCTA(layout側delegation経由)
console.log('\n=== 静的ページCTA一括検証 ===');
const staticPages = [
  ['/', 'home-zerostart'],
  ['/', 'home-final-cta'],
  ['/prooffirst', 'prooffirst-hero'],
  ['/prooffirst', 'prooffirst-mid'],
  ['/case-studies', 'case-studies-final'],
  ['/members', 'members-final'],
  ['/testimonial', 'testimonial-final'],
  ['/services/ai-development', 'services-ai-development-hero'],
  ['/column', 'column-list-final'],
  ['/strengths', 'strengths-final'],
  ['/qa', 'qa-hero'],
  ['/materials', 'materials-final'],
];
let pass = 0;
for (const [p, src] of staticPages) {
  if (await probeStaticPageCta(p, src)) pass++;
}
console.log(`\n${pass}/${staticPages.length} 静的ページOK`);

await browser.close();
