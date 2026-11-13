const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function captureScreenshots() {
  console.log("--- Starting Production Preview Server for Screenshots ---");

  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8080,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8080;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server listening at ${baseUrl}`);

  const screenshotsDir = path.resolve(__dirname, "../screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log("--- Launching Headless Chromium (1440x900) ---");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const targets = [
    { name: "Accounts View", url: `${baseUrl}/`, file: "accounts-view-1440x900.png" },
    { name: "Safe Management", url: `${baseUrl}/?section=safes`, file: "safes-view-1440x900.png" },
    { name: "CPM Operations", url: `${baseUrl}/?section=cpm`, file: "cpm-view-1440x900.png" },
    { name: "PSM Operations", url: `${baseUrl}/?section=psm`, file: "psm-view-1440x900.png" },
  ];

  for (const t of targets) {
    console.log(`Navigating to ${t.name}: ${t.url}...`);
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 15000 });
    // Settle for client hydration
    await page.waitForTimeout(1000);

    const outPath = path.join(screenshotsDir, t.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  -> Captured: ${outPath} (${fs.statSync(outPath).size} bytes)`);
  }

  await browser.close();
  await previewServer.close();

  console.log("\n--- ALL REQUIRED SCREENSHOTS CAPTURED AT 1440x900 ---");
  for (const t of targets) {
    const p = path.join(screenshotsDir, t.file);
    console.log(`✓ ${t.name}: ${p}`);
  }
}

captureScreenshots().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
