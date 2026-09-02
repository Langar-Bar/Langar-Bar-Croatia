import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.STORE_SCREENSHOT_URL || 'http://127.0.0.1:4173/index.html';
const out = 'store-screenshots';
await mkdir(out, { recursive: true });

const targets = [
  { name: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3 },
  { name: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2 }
];

const shots = [
  { name: '01-home', view: 'home' },
  { name: '02-menu', view: 'menu' },
  { name: '03-order', view: 'order' },
  { name: '04-club', view: 'club' },
  { name: '05-more', view: 'more' }
];

const browser = await chromium.launch({ headless: true });
for (const target of targets) {
  const context = await browser.newContext({
    viewport: target.viewport,
    deviceScaleFactor: target.scale,
    isMobile: target.name.startsWith('iphone'),
    hasTouch: true,
    locale: 'hr-HR'
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  const closeWelcome = async () => {
    for (const selector of ['#popupLater', '#closePopup']) {
      const el = page.locator(selector);
      if (await el.count() && await el.isVisible().catch(() => false)) {
        await el.click({ force: true }).catch(() => {});
        await page.waitForTimeout(350);
        break;
      }
    }
  };
  await closeWelcome();

  for (const shot of shots) {
    await closeWelcome();
    await page.evaluate((view) => {
      const button = [...document.querySelectorAll(`[data-go="${view}"]`)].pop();
      if (button instanceof HTMLElement) button.click();
    }, shot.view);
    await page.waitForTimeout(1000);
    await closeWelcome();
    await page.screenshot({
      path: `${out}/${target.name}-${shot.name}.png`,
      fullPage: false
    });
  }
  await context.close();
}
await browser.close();
console.log(`Store screenshots written to ${out}`);
