import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function run() {
  const outDir = path.resolve(process.cwd(), "output/upsell-refactor");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  // 1. Mobile 390px - First Viewport (Hero only)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/upsell/soft-gel", { waitUntil: "networkidle" });
  
  // Capture first viewport (exactly what the user sees upon loading without scrolling)
  await mobilePage.screenshot({
    path: path.join(outDir, "before-mobile-first-viewport.png"),
    fullPage: false,
  });
  console.log("Captured: before-mobile-first-viewport.png");

  // Also capture full page before
  await mobilePage.screenshot({
    path: path.join(outDir, "before-mobile-full.png"),
    fullPage: true,
  });
  console.log("Captured: before-mobile-full.png");

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
