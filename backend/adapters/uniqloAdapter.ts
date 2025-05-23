// backend/adapters/uniqloAdapter.ts
import { BasePlaywrightAdapter, PriceData } from './basePlaywrightAdapter';

export class UniqloAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = [
    // full-price
    '[data-test="price"] .price-original-ER span:last-child',
    // promo / discounted
    '[data-test="price"] .price-sales-ER span:last-child',
    '[data-test="price"] .price-ER span:last-child',
    // structured-data meta (has price in "content")
    'meta[itemprop="price"]',
  ];

  protected imageSelectors = [
    '.ec-renewal-image-wrapper img', // <img src="...">
    '.ec-renewal-image-wrapper', // style="background-image:url(...)"
  ];

  /** Uniqlo pages are React—wait for hydration, then scrape on the SAME page */
  async extractData(url: string): Promise<PriceData> {
    await this.initBrowser();

    const context = await this.browser.newContext();
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // wait until *any* of the price selectors is present (15 s max)
    await page.waitForSelector(
      this.priceSelectors.map((s) => `${s}`).join(','),
      { timeout: 15_000 }
    );

    /* ---------- PRICE ---------- */
    let rawPriceText = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (!el) continue;

      // meta[itemprop="price"] stores number in "content"
      if ((await el.getProperty('tagName')).toString() === 'META') {
        const content = await el.getAttribute('content');
        if (content) {
          rawPriceText = content;
          break;
        }
      } else {
        const txt = await el.textContent();
        if (txt && txt.trim()) {
          rawPriceText = txt.trim();
          break;
        }
      }
    }
    if (!rawPriceText) {
      throw new Error(
        `${
          this.constructor.name
        }: no price found with selectors [${this.priceSelectors.join(', ')}]`
      );
    }
    const match = rawPriceText.match(/[\d,.]+/);
    if (!match) {
      throw new Error(
        `${this.constructor.name}: can't parse price from "${rawPriceText}"`
      );
    }
    const price = parseFloat(match[0].replace(/,/g, ''));

    /* ---------- IMAGE ---------- */
    let imageUrl = '';
    for (const sel of this.imageSelectors) {
      const handle = await page.$(sel);
      if (!handle) continue;

      const candidate =
        (await handle.getAttribute('src')) ||
        (await handle.getAttribute('data-src')) ||
        // background-image: url("...") → extract URL
        (await handle.getAttribute('style'))?.match(
          /url\(["']?(.*?)["']?\)/
        )?.[1] ||
        '';

      if (candidate) {
        imageUrl = candidate.trim();
        break;
      }
    }
    if (!imageUrl) {
      throw new Error(
        `${
          this.constructor.name
        }: no image found with selectors [${this.imageSelectors.join(', ')}]`
      );
    }

    await page.close();
    await context.close();
    return { price, imageUrl };
  }
}

export default UniqloAdapter;
