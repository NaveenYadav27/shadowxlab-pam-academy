const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  console.log("--- Starting Preview Server for Operational Modules ---");
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8097,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 8097;
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

  const viewports = [
    { label: "1440x900", width: 1440, height: 900 },
    { label: "1920x1080", width: 1920, height: 1080 },
    { label: "1366x768", width: 1366, height: 768 },
  ];

  const views = [
    { name: "dashboard", section: "overview" },
    { name: "psm-operations", section: "psm" },
    { name: "policies", section: "policies" },
    { name: "administration", section: "access" },
    { name: "reports-audit", section: "audit" },
    { name: "discovery", section: "discovery" },
    { name: "troubleshooting", section: "troubleshooting" },
    { name: "learning-academy", section: "academy" },
  ];

  for (const vp of viewports) {
    console.log(`\n=== Capturing Viewport ${vp.label} ===`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    for (const v of views) {
      const url = `${baseUrl}/?section=${v.section}`;
      console.log(`Navigating to ${v.name}: ${url}...`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      await page.waitForTimeout(800);

      const filename = `${v.name}-${vp.label}.png`;
      const outPath = path.join(screenshotsDir, filename);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`✓ Saved ${filename}`);
    }

    await page.close();
  }

  await browser.close();
  await previewServer.close();
  console.log("\nAll operational module views successfully captured across 3 viewports!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
