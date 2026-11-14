const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8096,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8096;
  const baseUrl = `http://127.0.0.1:${port}`;

  const screenshotsDir = path.resolve(__dirname, "../screenshots");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(`${baseUrl}/?section=academy`, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(1000);

  // Select Class 05
  const selectElem = page.locator(".academy-class-selector");
  await selectElem.selectOption("class-05");
  await page.waitForTimeout(800);

  // Scroll to workflow visualizer
  const workflowElem = page.locator(".workflow-visualizer-container");
  if (await workflowElem.count() > 0) {
    await workflowElem.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: path.join(screenshotsDir, "workflow-visualizer-stepwise-1440x900.png") });
  console.log("✓ Captured workflow-visualizer-stepwise-1440x900.png");

  // Advance step
  const nextBtn = page.locator("button:has-text('Next Step')").first();
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
    await page.waitForTimeout(400);
    await nextBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(screenshotsDir, "workflow-visualizer-advanced-step-1440x900.png") });
  console.log("✓ Captured workflow-visualizer-advanced-step-1440x900.png");

  await browser.close();
  await previewServer.close();
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
