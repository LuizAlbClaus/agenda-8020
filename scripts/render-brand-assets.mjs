import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="brandTeal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#055B56" />
      <stop offset="100%" stop-color="#024B47" />
    </linearGradient>
    <filter id="subtleShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Squircle Base (Deep Pine Teal with transparent external background) -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#brandTeal)" />

  <!-- Top Binder Tabs -->
  <rect x="180" y="70" width="20" height="54" rx="6" fill="#FFFFFF" />
  <rect x="290" y="70" width="20" height="54" rx="6" fill="#FFFFFF" />

  <!-- Calendar Outer Contour -->
  <path
    d="M 132 156 L 132 120 C 132 102 144 94 164 94 L 336 94 C 356 94 368 102 368 120 L 368 156"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="14"
    stroke-linecap="round"
  />
  <!-- Top Horizontal Header Bar -->
  <line x1="132" y1="156" x2="368" y2="156" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />
  <!-- Left Vertical Border -->
  <line x1="132" y1="156" x2="132" y2="336" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />

  <!-- Calendar Matrix Grid (2 Columns x 3 Rows) -->
  <!-- Row 1: White, White -->
  <rect x="150" y="178" width="28" height="28" rx="6" fill="#FFFFFF" />
  <rect x="190" y="178" width="28" height="28" rx="6" fill="#FFFFFF" />

  <!-- Row 2: White, Emerald -->
  <rect x="150" y="218" width="28" height="28" rx="6" fill="#FFFFFF" />
  <rect x="190" y="218" width="28" height="28" rx="6" fill="#02C189" />

  <!-- Row 3: Emerald, Emerald -->
  <rect x="150" y="258" width="28" height="28" rx="6" fill="#02C189" />
  <rect x="190" y="258" width="28" height="28" rx="6" fill="#02C189" />

  <!-- Number 80 (White, Bold, Premium Typography) -->
  <text
    x="292"
    y="262"
    fill="#FFFFFF"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="94"
    font-weight="900"
    letter-spacing="-0.03em"
    text-anchor="middle"
  >80</text>

  <!-- Diagonal Divider Slash (White) -->
  <line x1="248" y1="396" x2="376" y2="268" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" />

  <!-- Number 20 (Vibrant Mint-Emerald #02C189) -->
  <text
    x="372"
    y="378"
    fill="#02C189"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    font-size="94"
    font-weight="900"
    letter-spacing="-0.03em"
    text-anchor="middle"
  >20</text>

  <!-- Dynamic Emerald Checkmark -->
  <path
    d="M 120 348 L 180 418 C 184 423 192 423 196 418 L 314 300"
    fill="none"
    stroke="#02C189"
    stroke-width="26"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`.trim();

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Save the pure SVG file
  const svgPath = path.resolve("public/Brand/agenda8020-icon.svg");
  fs.writeFileSync(svgPath, svgContent);
  console.log("Saved SVG:", svgPath);

  // Copy to app/icon.svg
  const appSvgPath = path.resolve("app/icon.svg");
  fs.writeFileSync(appSvgPath, svgContent);
  console.log("Saved app/icon.svg:", appSvgPath);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  await page.setContent(html);

  const targets = [
    { width: 1024, height: 1024, out: "public/Brand/agenda8020-icon-transparent.png" },
    { width: 512, height: 512, out: "public/Brand/agenda8020-icon-512.png" },
    { width: 192, height: 192, out: "public/Brand/agenda8020-icon-192.png" },
    { width: 512, height: 512, out: "app/icon.png" },
    { width: 180, height: 180, out: "app/apple-icon.png" },
  ];

  for (const t of targets) {
    await page.setViewportSize({ width: t.width, height: t.height });
    const fullOut = path.resolve(t.out);
    fs.mkdirSync(path.dirname(fullOut), { recursive: true });
    await page.screenshot({ path: fullOut, omitBackground: true });
    console.log(`Rendered ${t.width}x${t.height} -> ${t.out}`);
  }

  await browser.close();
  console.log("All brand assets generated successfully!");
}

run().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
