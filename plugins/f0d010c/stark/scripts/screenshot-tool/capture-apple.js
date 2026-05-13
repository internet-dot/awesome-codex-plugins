// Capture iOS 26 SwiftUI Settings preview (HTML mockup) screenshots.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const url = require('url');

const OUT = path.resolve(__dirname, '..', '..', 'screenshots', 'apple-settings');
const previewPath = path.resolve(
  __dirname,
  '..',
  '..',
  'examples',
  'apple-music-settings',
  'preview',
  'index.html'
);
const FILE_URL = url.pathToFileURL(previewPath).href;

const shots = [
  { name: '01-iphone-15pro',   vp: { width: 393, height: 852 },  full: false }, // iPhone 15/16 Pro
  { name: '02-iphone-15pro-fp', vp: { width: 393, height: 852 }, full: true  },
  { name: '03-iphone-se',      vp: { width: 375, height: 667 },  full: true  },
  { name: '04-iphone-pro-max', vp: { width: 430, height: 932 },  full: true  }, // iPhone 16 Pro Max
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: s.vp,
      deviceScaleFactor: 3, // iPhone Retina
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      colorScheme: 'light',
    });
    const page = await ctx.newPage();
    console.log('->', s.name, FILE_URL);
    await page.goto(FILE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.addStyleTag({
      content: `
        ::-webkit-scrollbar { display: none !important; }
        *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }
      `,
    });
    const file = path.join(OUT, s.name + '.png');
    await page.screenshot({ path: file, fullPage: s.full, type: 'png' });
    console.log('   saved', file);
    await ctx.close();
  }

  await browser.close();
  console.log('done');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
