import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const TEST_EMAIL = `gtag-verify-${Date.now()}@beekle.test`;
const TEST_MESSAGE = `[GA4 計測検証] form_submit / generate_lead / contact_complete の発火確認用テスト送信。送信時刻 ${new Date().toISOString()}`;

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
            window.__captureEvent({
              kind: 'event',
              name: a[1],
              params: a[2] || null,
              url: location.pathname,
            });
          }
        }
      } catch {}
      return orig(...args);
    };
  };
  installHook();
  setTimeout(installHook, 200);
  setTimeout(installHook, 1000);
});

// /api/contact を 200 stub する(ローカルの Slack webhook が未設定のため)
await context.route('**/api/contact', (route) => {
  console.log('   [stub] /api/contact -> 200 success');
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true }),
  });
});
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log(`   [console.error] ${msg.text()}`);
});

console.log('1) /contact を開く');
await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle');
await page.waitForSelector('form', { timeout: 5000 });

console.log('2) フォーム入力');
await page.selectOption('select[name="type"]', 'consultation');
await page.fill('input[name="reply_to"]', TEST_EMAIL);
await page.fill('textarea[name="message"]', TEST_MESSAGE);

// 送信直前に window.gtag が定義されているか確認 + 直接呼んで dataLayer に積めるか確認
const gtagState = await page.evaluate(() => ({
  hasGtag: typeof window.gtag === 'function',
  gtagSource: typeof window.gtag === 'function' ? window.gtag.toString() : null,
  dataLayerLen: (window.dataLayer || []).length,
}));
console.log('   submit直前 gtag 状態:', gtagState);

await page.evaluate(() => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', '__probe__', { src: 'playwright_direct_call' });
  }
});

console.log('3) 送信');
await Promise.all([
  page.waitForURL('**/thanks', { timeout: 20000 }).catch((err) => {
    console.error('thanks 遷移待ちタイムアウト:', err.message);
  }),
  page.click('button[type="submit"]'),
]);

console.log('4) ロード完了を待つ');
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(2000);

console.log(`   現在URL: ${page.url()}`);

// エラー表示があれば取得
const errorText = await page
  .locator('[role="alert"]')
  .first()
  .textContent({ timeout: 1000 })
  .catch(() => null);
if (errorText) console.log(`   フォームエラー表示: ${errorText.trim()}`);

console.log('5) dataLayer をダンプ');
const dlSnapshot = await page.evaluate(() => {
  return (window.dataLayer || []).map((entry) => {
    // arguments-like の場合は配列化
    if (entry && typeof entry === 'object' && '0' in entry && !Array.isArray(entry)) {
      return Array.from(entry).concat(
        Object.fromEntries(Object.entries(entry).filter(([k]) => Number.isNaN(Number(k))))
      );
    }
    return entry;
  });
});

console.log('\n=== 捕捉した gtag イベント ===');
if (events.length === 0) console.log('(なし)');
for (const e of events) {
  console.log(`- [${e.url}] ${e.name}`, e.params || '');
}

console.log('\n=== dataLayer 全件 ===');
for (const entry of dlSnapshot) {
  console.log(JSON.stringify(entry));
}

const have = (name) => events.some((e) => e.name === name);
console.log('\n=== 検証 ===');
console.log(`generate_lead    : ${have('generate_lead') ? 'OK' : 'NG'}`);
console.log(`form_submit      : ${have('form_submit') ? 'OK' : 'NG'}`);
console.log(`contact_complete : ${have('contact_complete') ? 'OK' : 'NG'}`);

console.log(`\nテスト送信メール: ${TEST_EMAIL}`);
console.log('Slack に届いた問い合わせ本文で検証用と判別できます。');

await browser.close();
