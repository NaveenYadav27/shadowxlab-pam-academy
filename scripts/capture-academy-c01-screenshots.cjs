const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function capture() {
  console.log("--- Starting Production Preview Server ---");
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

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(`${baseUrl}/?section=academy`, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(1000);

  // Tab 1: Concepts
  console.log("Capturing Concepts tab...");
  await page.locator(".pvwa-academy-tab").nth(0).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-c01-concepts-1440x900.png") });
  console.log("✓ Captured academy-c01-concepts-1440x900.png");

  // Tab 2: Lab
  console.log("Capturing Lab tab...");
  await page.locator(".pvwa-academy-tab").nth(1).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-c01-lab-1440x900.png") });
  console.log("✓ Captured academy-c01-lab-1440x900.png");

  // Tab 3: Roles
  console.log("Capturing Roles tab...");
  await page.locator(".pvwa-academy-tab").nth(2).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-c01-roles-1440x900.png") });
  console.log("✓ Captured academy-c01-roles-1440x900.png");

  // Tab 4: Interview
  console.log("Capturing Interview tab...");
  await page.locator(".pvwa-academy-tab").nth(3).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-c01-interview-1440x900.png") });
  console.log("✓ Captured academy-c01-interview-1440x900.png");

  // Tab 5: Vision
  console.log("Capturing Vision tab...");
  await page.locator(".pvwa-academy-tab").nth(4).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "academy-c01-vision-1440x900.png") });
  console.log("✓ Captured academy-c01-vision-1440x900.png");

  await browser.close();
  await previewServer.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
