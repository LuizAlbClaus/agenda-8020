import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function run() {
  const outDir = path.resolve(process.cwd(), "output/upsell-refactor");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();

  // 1. Mobile 390px (iPhone 14) - First Viewport & Full Page
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/upsell/soft-gel", { waitUntil: "networkidle" });
    
    await page.screenshot({
      path: path.join(outDir, "after-mobile-first-viewport.png"),
      fullPage: false,
    });
    console.log("Captured: after-mobile-first-viewport.png");

    await page.screenshot({
      path: path.join(outDir, "after-mobile-full.png"),
      fullPage: true,
    });
    console.log("Captured: after-mobile-full.png");
    await context.close();
  }

  // 2. Mobile 375px (iPhone SE) - First Viewport
  {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/upsell/soft-gel", { waitUntil: "networkidle" });
    
    await page.screenshot({
      path: path.join(outDir, "after-mobile-375-first-viewport.png"),
      fullPage: false,
    });
    console.log("Captured: after-mobile-375-first-viewport.png");
    await context.close();
  }

  // 3. Mobile 430px (iPhone 14 Pro Max) - First Viewport
  {
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/upsell/soft-gel", { waitUntil: "networkidle" });
    
    await page.screenshot({
      path: path.join(outDir, "after-mobile-430-first-viewport.png"),
      fullPage: false,
    });
    console.log("Captured: after-mobile-430-first-viewport.png");
    await context.close();
  }

  // 4. Desktop 1440px - First Viewport & Full Page
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000/upsell/soft-gel", { waitUntil: "networkidle" });
    
    await page.screenshot({
      path: path.join(outDir, "after-desktop-first-viewport.png"),
      fullPage: false,
    });
    console.log("Captured: after-desktop-first-viewport.png");

    await page.screenshot({
      path: path.join(outDir, "after-desktop-full.png"),
      fullPage: true,
    });
    console.log("Captured: after-desktop-full.png");
    await context.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
