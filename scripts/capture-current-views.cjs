const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  console.log("--- Starting Preview Server ---");
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8099,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8099;
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

  const views = [
    { name: "dashboard", url: `${baseUrl}/?section=overview`, file: "current-dashboard.png" },
    { name: "academy", url: `${baseUrl}/?section=academy`, file: "current-academy.png" },
    { name: "accounts", url: `${baseUrl}/?section=accounts`, file: "current-accounts.png" },
    { name: "safes", url: `${baseUrl}/?section=safes`, file: "current-safes.png" },
  ];

  for (const v of views) {
    console.log(`Navigating to ${v.name}: ${v.url}...`);
    await page.goto(v.url, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);
    const outPath = path.join(screenshotsDir, v.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ Saved ${v.file}`);
  }

  await browser.close();
  await previewServer.close();
  console.log("All views captured.");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
