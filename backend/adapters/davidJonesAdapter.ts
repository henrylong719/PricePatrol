import { BrowserContext, Page } from 'playwright';
import { BasePlaywrightAdapter, PriceData } from './basePlaywrightAdapter';

export class DavidJonesAdapter extends BasePlaywrightAdapter {
  /** selectors that most often expose the price */
  protected priceSelectors = [
    'meta[itemprop="price"]',
    '.price-display[itemprop="price"]',
    '[data-yotpo-price]',
  ];

  /** selectors that point at any main/medium product image */
  protected imageSelectors = [
    'a.medium-image', // new PDP
    'ul.newGrid li a', // legacy PDP
  ];

  async extractData(url: string): Promise<PriceData> {
    await this.initBrowser();
    const context: BrowserContext = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/124.0.0.0 Safari/537.36',
      locale: 'en-AU',
      viewport: { width: 1366, height: 768 },
    });

    const page: Page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'networkidle' });

    const overlay = 'button:has-text("Continue"), a:has-text("Continue")';
    try {
      if (await page.isVisible(overlay)) {
        await Promise.all([
          page.waitForLoadState('networkidle'),
          page.click(overlay, { timeout: 5_000 }),
        ]);
      }
    } catch {
      /* ignore – overlay vanished or isn’t clickable */
    }

    let price: number | null = null;

    for (const sel of this.priceSelectors) {
      const handle = await page.$(sel);
      if (!handle) continue;

      const raw = await page.$eval(
        sel,
        (el: any) =>
          el.getAttribute?.('content')?.trim() ||
          el.getAttribute?.('data-yotpo-price')?.trim() ||
          el.textContent?.trim() ||
          ''
      );
      const m = raw.match(/[\d.]+/);
      if (m) {
        price = parseFloat(m[0]);
        break;
      }
    }

    // script[type="application/ld+json"]
    if (price === null) {
      const blocks = await page.$$eval(
        'script[type="application/ld+json"]',
        (nodes) => nodes.map((n) => n.textContent || '')
      );
      for (const txt of blocks) {
        try {
          const data = JSON.parse(txt);
          const p =
            data?.offers?.price ??
            data?.price ??
            (Array.isArray(data?.offers) ? data.offers[0]?.price : null);
          if (p) {
            price = parseFloat(String(p));
            break;
          }
        } catch {
          /* malformed JSON – skip */
        }
      }
    }

    // brute-force regex on raw HTML
    if (price === null) {
      const html = await page.content();
      const m = html.match(/itemprop="price"[^>]*content="([\d.]+)"/);
      if (m) price = parseFloat(m[1]);
    }

    if (price === null) {
      await page.close();
      await context.close();
      throw new Error(`${this.constructor.name}: price not found`);
    }

    let imageUrl = '';
    for (const sel of this.imageSelectors) {
      const anchor = await page.$(sel);
      if (!anchor) continue;

      imageUrl = await page.$eval(
        sel,
        (el: any) =>
          el.getAttribute('data-medium-image')?.trim() ||
          el.getAttribute('href')?.trim() ||
          el.querySelector('img')?.getAttribute('src')?.trim() ||
          ''
      );
      if (imageUrl) break;
    }

    // fallback: <img itemprop="image">
    if (!imageUrl) {
      imageUrl = await page
        .$eval('img[itemprop="image"]', (img: any) => img?.src || '')
        .catch(() => '');
    }

    if (!imageUrl) {
      await page.close();
      await context.close();
      throw new Error(`${this.constructor.name}: image not found`);
    }

    if (imageUrl.startsWith('/')) {
      imageUrl = `https://www.davidjones.com${imageUrl}`;
    }

    await page.close();
    await context.close();
    return { price, imageUrl };
  }
}
