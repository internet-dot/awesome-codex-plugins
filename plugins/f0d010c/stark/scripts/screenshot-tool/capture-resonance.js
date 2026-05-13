// Capture screenshots of Resonance Electron app via its Vite dev URL.
// Renders identical UI to the Electron BrowserWindow.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', '..', 'screenshots', 'resonance');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:1420';

const pages = [
  { name: '01-now-playing', click: 'Now Playing' },
  { name: '02-library',     click: 'Library' },
  { name: '03-browse',      click: 'Browse' },
  { name: '04-radio',       click: 'Radio' },
  { name: '05-settings',    click: 'Settings' },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  // Match Electron BrowserWindow.backgroundColor (#0a0907) since real window
  // uses Win11 Mica which the browser can't render. Without this, Chromium's
  // default white shows through bg-stone-950/40 → looks gray.
  await page.addStyleTag({
    content: `
      html, body { background: #0a0907 !important; }
      ::-webkit-scrollbar { display: none !important; }
      *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }
    `,
  });

  for (const p of pages) {
    console.log('->', p.name);
    await page.getByRole('button', { name: p.click, exact: true }).first().click();
    await page.waitForTimeout(800);
    const file = path.join(OUT, p.name + '.png');
    await page.screenshot({ path: file, fullPage: false, type: 'png' });
    console.log('   saved', file);
  }

  await ctx.close();
  await browser.close();
  console.log('done');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
