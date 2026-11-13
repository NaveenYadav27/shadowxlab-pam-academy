const { createServer } = require('vite');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting Vite server...');
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    server: { port: 8085, host: '127.0.0.1' }
  });
  await server.listen();
  const address = server.httpServer.address();
  console.log('Server running on http://127.0.0.1:' + address.port);

  console.log('Launching Chrome...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const outDir = path.resolve(__dirname, '../screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const viewports = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1280x800', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    console.log(`Capturing for viewport ${vp.name}...`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });

    // 1. Accounts View
    await page.goto(`http://127.0.0.1:${address.port}/?section=accounts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `01_accounts_view_${vp.name}.png`) });

    // 2. Account Details (select first account row)
    const firstAccountRow = page.locator('.pvwa-grid tbody tr').first();
    if (await firstAccountRow.count() > 0) {
      await firstAccountRow.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `02_account_details_${vp.name}.png`) });
    }

    // 3. Safes View
    await page.goto(`http://127.0.0.1:${address.port}/?section=safes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `03_safes_view_${vp.name}.png`) });

    // 4. Safe Permissions Tab
    const permBtn = page.locator('button:has-text("Permission Matrix"), .pvwa-tab-btn:has-text("Permission")').first();
    if (await permBtn.count() > 0) {
      await permBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `04_safe_permissions_${vp.name}.png`) });
    }

    // 5. CPM Operations
    await page.goto(`http://127.0.0.1:${address.port}/?section=cpm`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `05_cpm_operations_${vp.name}.png`) });

    // 6. PSM Operations
    await page.goto(`http://127.0.0.1:${address.port}/?section=psm`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `06_psm_operations_${vp.name}.png`) });

    // 7. Learning Academy
    await page.goto(`http://127.0.0.1:${address.port}/?section=academy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, `07_learning_academy_${vp.name}.png`) });

    await page.close();
  }

  await browser.close();
  await server.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
