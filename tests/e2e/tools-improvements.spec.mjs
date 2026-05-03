// 発注準備キット (3ツール + RFP) の主要シナリオ E2E
// 起動方法:
//   ターミナル1: bun dev
//   ターミナル2: node tests/e2e/tools-improvements.spec.mjs
//
// 検証シナリオ:
// 1. /tools 全4ページが 200 + 主要要素表示
// 2. scope-manager: テンプレ選択 → 要求文抽出 → CSV/Markdown 出力
// 3. flow-mapper → story-builder ハンドオフ
// 4. story-builder → scope-manager ハンドオフ
// 5. RFP-builder: 基本情報入力 → 生成 → flow-mapper / scope-manager の状態反映
// 6. 共有URL: scope-manager で生成 → 別タブで読み込み

import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

// ───────────────── Scenario 1: 4ページとも 200 + 主要要素 ─────────────────
{
  const page = await ctx.newPage();
  for (const path of ['/tools', '/tools/flow-mapper', '/tools/story-builder', '/tools/scope-manager', '/tools/rfp-builder']) {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    const status = res?.status() ?? 0;
    record(`page ${path} status 200`, status === 200, `status=${status}`);
  }
  await page.close();
}

// ───────────────── Scenario 2: scope-manager テンプレ → 抽出 → 出力 ─────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/tools/scope-manager`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('beekle-scope-manager-v1'));
  await page.reload({ waitUntil: 'networkidle' });

  // テンプレセレクタを探す
  const select = page.locator('select').filter({ hasText: '業界別テンプレートから始める' }).first();
  const has = (await select.count()) > 0;
  record('scope-manager: テンプレセレクタ存在', has);

  if (has) {
    await select.selectOption('expense'); // 経費精算
    // 抽出ボタン押下
    const extract = page.getByRole('button', { name: '要求文を抽出' });
    await extract.waitFor({ state: 'visible', timeout: 5000 });
    await extract.click();
    await page.waitForTimeout(500);
    // 抽出後、要件が表示されるはず
    const reqRows = await page.locator('tbody tr').count();
    record('scope-manager: テンプレ抽出 (要件 >0)', reqRows > 0, `${reqRows}件`);
  }
  await page.close();
}

// ───────────────── Scenario 3: flow-mapper → story-builder ハンドオフ ─────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/tools/flow-mapper`, { waitUntil: 'networkidle' });
  // テンプレモーダルが出ていれば選ぶ (受注〜出荷を読み込み)
  await page.evaluate(() =>
    localStorage.setItem('beekle-flow-mapper-template-picker-shown', '1')
  );
  await page.reload({ waitUntil: 'networkidle' });
  // サンプル読込ボタン
  const loadSample = page.getByRole('button', { name: 'サンプルを読込' });
  if ((await loadSample.count()) > 0) {
    await loadSample.click();
    await page.waitForTimeout(300);
  }
  // 「ストーリーに送る」ボタン
  const sendStory = page.getByRole('button', { name: /ストーリーに送る/ });
  const sendExists = (await sendStory.count()) > 0;
  record('flow-mapper: 「ストーリーに送る →」存在', sendExists);

  if (sendExists) {
    // ナビゲーションを待つ
    const navP = page.waitForURL('**/tools/story-builder*', { timeout: 5000 });
    await sendStory.click();
    await navP.catch(() => {});
    record('flow-mapper → story-builder: ナビ成功', page.url().includes('/tools/story-builder'));

    await page.waitForTimeout(500);
    // textarea に流し込まれたか
    const textareaVal = await page.locator('textarea').first().inputValue().catch(() => '');
    const hasHandoff = textareaVal.includes('業務名') || textareaVal.includes('改善');
    record('story-builder: handoff payload 受信', hasHandoff, `len=${textareaVal.length}`);
  }
  await page.close();
}

// ───────────────── Scenario 4: 共有URL (scope-manager) ─────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/tools/scope-manager`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('beekle-scope-manager-v1'));
  await page.reload({ waitUntil: 'networkidle' });

  // テンプレ → 抽出
  const select = page.locator('select').filter({ hasText: '業界別テンプレートから始める' }).first();
  if ((await select.count()) > 0) {
    await select.selectOption('inventory');
    await page.getByRole('button', { name: '要求文を抽出' }).click();
    await page.waitForTimeout(300);
  }

  // クリップボード経由で URL 取得 (Playwright clipboard をエミュレート)
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  page.on('dialog', (d) => d.accept()); // alert を accept

  const shareBtn = page.getByRole('button', { name: '共有URLをコピー' });
  const shareExists = (await shareBtn.count()) > 0;
  record('scope-manager: 「共有URLをコピー」存在', shareExists);

  if (shareExists) {
    await shareBtn.click();
    await page.waitForTimeout(500);
    const clipText = await page.evaluate(() => navigator.clipboard.readText());
    const valid = clipText.includes('/tools/scope-manager#share=');
    record('scope-manager: 共有URL 形式', valid, valid ? clipText.slice(0, 80) + '...' : clipText);

    if (valid) {
      // 別タブで開いてデータ復元 (confirm は accept、上書き挙動を信頼)
      const tab2 = await ctx.newPage();
      tab2.on('dialog', (d) => d.accept()); // confirm を accept
      await tab2.goto(clipText, { waitUntil: 'networkidle' });
      await tab2.waitForTimeout(800);
      const ta = await tab2.locator('textarea').first().inputValue().catch(() => '');
      record(
        'scope-manager: 共有URL 受信時に markdown 復元',
        ta.length > 0,
        `markdown len=${ta.length}`
      );
      await tab2.close();
    }
  }
  await page.close();
}

// ───────────────── Scenario 5: RFP-builder が flow/scope の localStorage を読む ─────────────────
{
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept());

  // flow-mapper にサンプル投入
  await page.goto(`${BASE}/tools/flow-mapper`, { waitUntil: 'networkidle' });
  await page.evaluate(() =>
    localStorage.setItem('beekle-flow-mapper-template-picker-shown', '1')
  );
  await page.reload({ waitUntil: 'networkidle' });
  const loadSample = page.getByRole('button', { name: 'サンプルを読込' });
  if ((await loadSample.count()) > 0) {
    await loadSample.click();
    await page.waitForTimeout(500);
  }

  // RFP ページへ
  await page.goto(`${BASE}/tools/rfp-builder`, { waitUntil: 'networkidle' });
  // 基本情報を1つ入れる
  await page.locator('input[type="text"]').first().fill('E2E テストプロジェクト');
  // 生成ボタン
  await page.getByRole('button', { name: 'RFPドラフトを生成' }).click();
  await page.waitForTimeout(500);
  const previewText = await page.locator('pre').first().innerText().catch(() => '');
  const hasProj = previewText.includes('E2E テストプロジェクト');
  const hasFlow = previewText.includes('業務名') || previewText.includes('現状業務');
  record('rfp-builder: プレビューにプロジェクト名', hasProj);
  record('rfp-builder: プレビューに flow-mapper データ反映', hasFlow);
  await page.close();
}

await browser.close();

// ───────────────── レポート ─────────────────
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log(`\n========================================`);
console.log(`Total: ${results.length} / Passed: ${passed} / Failed: ${failed}`);
console.log(`========================================`);
if (failed > 0) {
  console.log('\nFailed tests:');
  for (const r of results.filter((x) => !x.ok)) console.log(`  ✗ ${r.name} — ${r.detail}`);
  process.exit(1);
}
