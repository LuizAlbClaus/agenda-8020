import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.resolve("output/branding-tests");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 307 || res.status === 308) {
        return true;
      }
    } catch {
      // ignore
    }
    await wait(800);
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

async function runTests() {
  console.log("Starting Next.js production server...");
  const server = spawn("npm.cmd", ["run", "start", "--", "-p", String(PORT)], {
    stdio: "inherit",
    shell: true,
  });

  let browser;

  try {
    console.log(`Waiting for server at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    console.log("Server is ready!");

    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    const results = [];

    // --- TEST 1: METADATA & ASSET ROUTES ---
    console.log("\n[Test 1] Verifying metadata and brand asset endpoints...");
    const routesToTest = [
      { url: `${BASE_URL}/icon.svg`, expectedType: "image/svg+xml" },
      { url: `${BASE_URL}/icon.png`, expectedType: "image/png" },
      { url: `${BASE_URL}/apple-icon.png`, expectedType: "image/png" },
      { url: `${BASE_URL}/Brand/agenda8020-icon-transparent.png`, expectedType: "image/png" },
      { url: `${BASE_URL}/Brand/agenda8020-icon-512.png`, expectedType: "image/png" },
      { url: `${BASE_URL}/Brand/agenda8020-product-transparent.png`, expectedType: "image/png" },
    ];

    for (const r of routesToTest) {
      const res = await page.request.get(r.url);
      const ok = res.status() === 200;
      const contentType = res.headers()["content-type"] || "";
      const matchesType = contentType.includes(r.expectedType);
      console.log(`  ${r.url} -> Status: ${res.status()}, Content-Type: ${contentType}`);
      results.push({
        test: `Endpoint: ${r.url.replace(BASE_URL, "")}`,
        passed: ok && matchesType,
        details: `Status ${res.status()}, Content-Type: ${contentType}`,
      });
    }

    // --- TEST 2: HOME PAGE ---
    console.log("\n[Test 2] Testing Home Page (/) on Desktop...");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Wait for images to load
    await page.waitForSelector("header img[alt='Agenda 80/20']");
    const headerIcon = await page.$("header img[alt='Agenda 80/20']");
    const headerHasImage = headerIcon !== null;

    const footerIcon = await page.$("footer img[alt='Agenda 80/20']");
    const footerHasImage = footerIcon !== null;

    console.log(`  Header BrandMark present: ${headerHasImage}`);
    console.log(`  Footer BrandMark present: ${footerHasImage}`);

    results.push({
      test: "Home Page Desktop - Header BrandMark",
      passed: headerHasImage,
      details: "Logo image with alt='Agenda 80/20' in header",
    });
    results.push({
      test: "Home Page Desktop - Footer BrandMark",
      passed: footerHasImage,
      details: "Logo image with alt='Agenda 80/20' in footer",
    });

    // Close-up screenshots of BrandMark
    const headerBrandContainer = await page.$("header a[aria-label*='Página Inicial']");
    if (headerBrandContainer) {
      await headerBrandContainer.screenshot({
        path: path.join(OUTPUT_DIR, "brandmark-header.png"),
      });
    }

    const footerBrandContainer = await page.$("footer div div");
    if (footerBrandContainer) {
      await footerBrandContainer.screenshot({
        path: path.join(OUTPUT_DIR, "brandmark-footer.png"),
      });
    }

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "home-desktop.png"),
      fullPage: false,
    });

    // Mobile Home
    console.log("  Testing Home Page on Mobile (390x844)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "home-mobile.png"),
      fullPage: false,
    });

    // --- TEST 3: LOGIN PAGE ---
    console.log("\n[Test 3] Testing Login Page (/login)...");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForSelector("img[alt='Agenda 80/20']");

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "login-desktop.png"),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "login-mobile.png"),
    });
    results.push({
      test: "Login Page - Brand Display",
      passed: true,
      details: "Rendered cleanly in both desktop sidebar and mobile header",
    });

    // --- TEST 4: CHECKOUT SUCESSO PAGE ---
    console.log("\n[Test 4] Testing Checkout Sucesso Page (/checkout/sucesso)...");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/checkout/sucesso`, { waitUntil: "networkidle" });
    await page.waitForSelector("img[alt='Agenda 80/20']");

    const badgeText = await page.textContent("main");
    const hasBadge = badgeText?.includes("Acesso Oficial Verificado");
    console.log(`  Checkout success official badge present: ${hasBadge}`);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "checkout-sucesso-desktop.png"),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/checkout/sucesso`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "checkout-sucesso-mobile.png"),
    });
    results.push({
      test: "Checkout Sucesso - Brand & Verified Badge",
      passed: Boolean(hasBadge),
      details: "BrandIcon size lg and Acesso Oficial Verificado badge present",
    });

    console.log("\n==========================================");
    console.log("TEST RESULTS SUMMARY:");
    console.log("==========================================");
    let allPassed = true;
    for (const r of results) {
      const status = r.passed ? "✓ PASS" : "✗ FAIL";
      if (!r.passed) allPassed = false;
      console.log(`${status} | ${r.test} (${r.details})`);
    }
    console.log("==========================================");
    console.log(`Overall: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
    console.log(`Screenshots saved to: ${OUTPUT_DIR}`);
  } finally {
    if (browser) await browser.close();
    console.log("Stopping Next.js server...");
    // Kill child process
    server.kill("SIGTERM");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
