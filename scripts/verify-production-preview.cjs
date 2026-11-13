const { preview } = require("vite");
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function testProductionPreview() {
  console.log("--- Starting Production Preview Server ---");

  // Use Vite programmatically to run preview server with the exact build
  const previewServer = await preview({
    configFile: path.resolve(__dirname, "../vite.config.ts"),
    preview: {
      port: 8080,
      host: "127.0.0.1",
    },
  });

  const address = previewServer.httpServer.address();
  const actualPort = typeof address === "object" && address ? address.port : 8080;
  const url = `http://127.0.0.1:${actualPort}`;
  console.log(`Preview server running at ${url} (resolved port: ${actualPort})`);

  console.log("--- Launching Chrome via Playwright ---");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const routesToTest = [
    { name: "Root URL", path: "/" },
    { name: "Accounts View", path: "/?section=accounts" },
    { name: "Safes View", path: "/?section=safes" },
    { name: "CPM Operations View", path: "/?section=cpm" },
    { name: "PSM Operations View", path: "/?section=psm" },
    { name: "Learning Academy View", path: "/?section=academy" },
  ];

  const results = [];

  for (const route of routesToTest) {
    const fullUrl = url + route.path;
    console.log(`\nTesting route: ${route.name} (${fullUrl})...`);

    const response = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });
    const status = response ? response.status() : "no-response";

    // Allow brief settle for client hydration
    await page.waitForTimeout(1000);

    // Check that PVWA shell is present
    const headerTitle = await page
      .locator(".pvwa-brand-title")
      .textContent()
      .catch(() => null);
    const navBarExists = (await page.locator(".pvwa-nav-bar").count()) > 0;

    // Check view-specific elements
    let viewCheck = false;
    let detail = "";
    if (route.path === "/") {
      const bannerCount = await page
        .locator(".overview-banner, .pvwa-grid, .pvwa-page-header")
        .count();
      viewCheck = bannerCount > 0;
      detail = `Found ${bannerCount} landing elements`;
    } else if (route.path.includes("accounts")) {
      const accountsHeader =
        (await page.locator('.pvwa-page-header h1:has-text("Accounts")').count()) > 0;
      const gridCount = (await page.locator(".pvwa-grid").count()) > 0;
      viewCheck = accountsHeader || gridCount;
      detail = `AccountsHeader: ${accountsHeader}, Grid: ${gridCount}`;
    } else if (route.path.includes("safes")) {
      const safesHeader =
        (await page.locator('.pvwa-page-header h1:has-text("Safes")').count()) > 0;
      const gridCount = (await page.locator(".pvwa-grid").count()) > 0;
      viewCheck = safesHeader || gridCount;
      detail = `SafesHeader: ${safesHeader}, Grid: ${gridCount}`;
    } else if (route.path.includes("cpm")) {
      const cpmHeader =
        (await page.locator('.pvwa-page-header h1:has-text("CPM Operations")').count()) > 0;
      viewCheck = cpmHeader;
      detail = `CpmHeader: ${cpmHeader}`;
    } else if (route.path.includes("psm")) {
      const psmHeader =
        (await page.locator('.pvwa-page-header h1:has-text("PSM Operations")').count()) > 0;
      viewCheck = psmHeader;
      detail = `PsmHeader: ${psmHeader}`;
    } else if (route.path.includes("academy")) {
      const academyLayout = (await page.locator(".pvwa-academy-layout").count()) > 0;
      const academyHeader =
        (await page.locator('.pvwa-page-header h1:has-text("Learning Academy")').count()) > 0;
      viewCheck = academyLayout || academyHeader;
      detail = `AcademyLayout: ${academyLayout}, AcademyHeader: ${academyHeader}`;
    }

    const passed = status === 200 && navBarExists && viewCheck;
    console.log(
      `  -> Status: ${status}, Nav: ${navBarExists}, ViewCheck: ${viewCheck} (${detail}) => ${passed ? "PASS" : "FAIL"}`,
    );
    results.push({ name: route.name, path: route.path, status, passed, detail });
  }

  await browser.close();
  await previewServer.close();

  console.log("\n========================================");
  console.log("--- Production Preview Verification Results ---");
  console.log("========================================");
  for (const r of results) {
    console.log(
      `[${r.passed ? "SUCCESS" : "FAILED"}] ${r.name} (${r.path}) - HTTP ${r.status} (${r.detail})`,
    );
  }

  const allPassed = results.every((r) => r.passed);
  if (!allPassed) {
    throw new Error("Some routes failed in production preview.");
  }
  console.log("\nALL 6 ROUTES VERIFIED IN PRODUCTION PREVIEW SUCCESSFULLY!");
}

testProductionPreview().catch((err) => {
  console.error("Fatal preview test error:", err);
  process.exit(1);
});
