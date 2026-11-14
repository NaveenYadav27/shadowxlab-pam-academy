const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  console.log("--- Starting Preview Server for Academy V3 Walkthrough ---");
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8092,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8092;
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
  await page.waitForTimeout(1200);

  // 1. Class 01
  console.log("Capturing Class 01 workspace...");
  await page.screenshot({ path: path.join(screenshotsDir, "academy-workspace-c01-1440x900.png") });
  console.log("✓ Captured academy-workspace-c01-1440x900.png");

  // 2. Switch to Class 02
  console.log("Switching to Class 02...");
  const selectElem = page.locator(".academy-class-selector");
  await selectElem.selectOption("class-02");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-workspace-c02-1440x900.png") });
  console.log("✓ Captured academy-workspace-c02-1440x900.png");

  // 3. Switch to Class 03
  console.log("Switching to Class 03...");
  await selectElem.selectOption("class-03");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-workspace-c03-1440x900.png") });
  console.log("✓ Captured academy-workspace-c03-1440x900.png");

  // 4. Switch to Class 05 (CPM Operations)
  console.log("Switching to Class 05...");
  await selectElem.selectOption("class-05");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-workspace-c05-1440x900.png") });
  console.log("✓ Captured academy-workspace-c05-1440x900.png");

  // 5. Switch to Class 06 (PSM Operations)
  console.log("Switching to Class 06...");
  await selectElem.selectOption("class-06");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-workspace-c06-1440x900.png") });
  console.log("✓ Captured academy-workspace-c06-1440x900.png");

  // 6. Interactive Checkpoint
  console.log("Interacting with Checkpoint on Class 06...");
  const optionBtn = page.locator(".checkpoint-option").first();
  if ((await optionBtn.count()) > 0) {
    await optionBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({
    path: path.join(screenshotsDir, "academy-checkpoint-interactive-1440x900.png"),
  });
  console.log("✓ Captured academy-checkpoint-interactive-1440x900.png");

  // 7. Practical Exercise Simulator Card
  console.log("Capturing exercise simulator card...");
  await page.screenshot({
    path: path.join(screenshotsDir, "academy-exercise-simulator-1440x900.png"),
  });
  console.log("✓ Captured academy-exercise-simulator-1440x900.png");

  await browser.close();
  await previewServer.close();
  console.log("\n--- ACADEMY V3 SCREENSHOTS CAPTURE COMPLETE ---");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
