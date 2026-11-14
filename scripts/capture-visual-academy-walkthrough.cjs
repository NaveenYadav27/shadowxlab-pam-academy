const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  console.log("--- Starting Preview Server for Visual Academy Walkthrough ---");
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8094,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8094;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server listening at ${baseUrl}`);

  const screenshotsDir = path.resolve(__dirname, "../screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  console.log("Navigating to Learning Academy...");
  await page.goto(`${baseUrl}/?section=academy`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1500);

  const selectElem = page.locator(".academy-class-selector");

  // 1. Class 01 Architecture
  console.log("Capturing Class 01 visual architecture...");
  await selectElem.selectOption("class-01");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "class-01-visual-architecture-1440x900.png") });
  console.log("✓ Captured class-01-visual-architecture-1440x900.png");

  // 2. Class 02 Safe Authorization
  console.log("Capturing Class 02 Safe Authorization...");
  await selectElem.selectOption("class-02");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "class-02-safe-authorization-1440x900.png") });
  console.log("✓ Captured class-02-safe-authorization-1440x900.png");

  // 3. Class 03 Account Onboarding
  console.log("Capturing Class 03 Account Onboarding...");
  await selectElem.selectOption("class-03");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "class-03-account-onboarding-1440x900.png") });
  console.log("✓ Captured class-03-account-onboarding-1440x900.png");

  // 4. Class 05 CPM Rotation
  console.log("Capturing Class 05 CPM Rotation...");
  await selectElem.selectOption("class-05");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "class-05-cpm-rotation-1440x900.png") });
  console.log("✓ Captured class-05-cpm-rotation-1440x900.png");

  // 5. Class 06 PSM Session
  console.log("Capturing Class 06 PSM Session...");
  await selectElem.selectOption("class-06");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "class-06-psm-session-1440x900.png") });
  console.log("✓ Captured class-06-psm-session-1440x900.png");

  // 6. Interactive Component Inspector (Clicking Vault & CPM filter)
  console.log("Interacting with Architecture Explorer (CPM filter)...");
  const cpmFilterBtn = page.locator("button:has-text('CPM Engine')").first();
  if (await cpmFilterBtn.count() > 0) {
    await cpmFilterBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(screenshotsDir, "interactive-component-inspector-1440x900.png") });
  console.log("✓ Captured interactive-component-inspector-1440x900.png");

  await browser.close();
  await previewServer.close();
  console.log("\n--- ALL VISUAL SCREENSHOTS CAPTURED AT 1440x900 ---");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
