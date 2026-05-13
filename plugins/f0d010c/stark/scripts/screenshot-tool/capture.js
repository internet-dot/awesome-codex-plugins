// Capture polished screenshots of StarkTest docs site.
// Saves directly to ../../screenshots/. No images enter agent context.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, '..', '..', 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const shots = [
  { name: '01-home-desktop',        url: '/',                      vp: { width: 1440, height: 900 },  full: false },
  { name: '02-home-fullpage',       url: '/',                      vp: { width: 1440, height: 900 },  full: true  },
  { name: '03-home-mobile',         url: '/',                      vp: { width: 390,  height: 844 },  full: false, mobile: true },
  { name: '04-home-mobile-full',    url: '/',                      vp: { width: 390,  height: 844 },  full: true,  mobile: true },
  { name: '05-docs-desktop',        url: '/docs',                  vp: { width: 1440, height: 900 },  full: true  },
  { name: '06-docs-quickstart',     url: '/docs/getting-started/quickstart',       vp: { width: 1440, height: 900 }, full: true },
  { name: '07-docs-sql-functions',  url: '/docs/sql/functions',                    vp: { width: 1440, height: 900 }, full: true },
  { name: '08-docs-sql-ddl',        url: '/docs/sql/ddl',                          vp: { width: 1440, height: 900 }, full: true },
  { name: '09-docs-release-notes',  url: '/docs/release-notes',                    vp: { width: 1440, height: 900 }, full: true },
  { name: '10-docs-mobile',         url: '/docs',                  vp: { width: 390,  height: 844 },  full: true,  mobile: true },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: s.vp,
      deviceScaleFactor: 2,
      isMobile: !!s.mobile,
      hasTouch: !!s.mobile,
      userAgent: s.mobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
      colorScheme: 'dark',
    });
    const page = await ctx.newPage();
    const url = BASE + s.url;
    console.log('->', s.name, url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      console.log('  retry domcontentloaded:', e.message);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await page.waitForTimeout(1200);
    // Hide scrollbars and freeze animations for clean shots
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
