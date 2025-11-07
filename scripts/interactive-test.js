#!/usr/bin/env node
// Lightweight Playwright script to open the local fde.html and click a few buttons
// Usage: node scripts/interactive-test.js

const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();

  const fileUrl = "file://" + path.resolve(__dirname, "..", "fde.html");
  console.log("Navigating to", fileUrl);
  await page.goto(fileUrl, { waitUntil: "domcontentloaded" });

  // Wait a moment for initial render
  await page.waitForTimeout(250);

  // Click Step
  console.log("Clicking Step");
  await page.click("#btn-step");
  await page.waitForTimeout(300);

  // Click Run (starts auto-running for a short while)
  console.log("Clicking Run");
  await page.click("#btn-run");
  await page.waitForTimeout(2200);

  // Click Run again to pause
  console.log("Pausing Run");
  await page.click("#btn-run");
  await page.waitForTimeout(200);

  // Click Reset
  console.log("Clicking Reset");
  await page.click("#btn-reset");
  await page.waitForTimeout(300);

  // Save screenshot for visual inspection
  const out = path.join(process.cwd(), "screenshots", "interactive-test.png");
  await page.screenshot({ path: out, fullPage: true });
  console.log("Saved interactive screenshot to", out);

  await browser.close();
})();
