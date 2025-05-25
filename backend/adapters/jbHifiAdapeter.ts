import { BrowserContext, Page } from 'playwright';
import { BasePlaywrightAdapter, PriceData } from './basePlaywrightAdapter';

export class JBHifiAdapter extends BasePlaywrightAdapter {
  /** “$1099” lives in this span – hashed suffix changes daily */
  protected priceSelectors = [
    'span[class*="PriceTag_actual"]',
    'div[class*="PriceTag_actualWrapper"] span[class*="PriceFont"]',
    'div[data-testid="product-price"] span',
  ];

  /** Main catalogue image */
  protected imageSelectors = [
    'img[class*="_1n3ie3p8"]',
    'div.Grid_itemStyles__jihlcv2l img',
    'img[src*="//www.jbhifi.com.au/cdn/shop/files"]',
  ];

  /**
   * Override to tolerate integer-only price strings (“1099”)
   */
  async extractData(url: string): Promise<PriceData> {
    /* ---- bootstrap page ---- */
    await this.initBrowser();
    const ctxOpts: { userAgent?: string } = {};
    if (this.userAgent) ctxOpts.userAgent = this.userAgent;

    const context: BrowserContext = await this.browser.newContext(ctxOpts);
    const page: Page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    /* ---- PRICE ---- */
    let rawPrice = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (!el) continue;
      rawPrice = (
        await page.$eval(sel, (e) => e.textContent?.trim() || '')
      ).trim();
      if (rawPrice) break;
    }
    if (!rawPrice) {
      throw new Error(
        `${
          this.constructor.name
        }: no price element found via [${this.priceSelectors.join(', ')}]`
      );
    }

    // Strip currency & allow optional “.xx”
    const m = rawPrice.replace(/[^\d.,]/g, '').match(/[\d,]+(?:\.\d{2})?/);
    if (!m)
      throw new Error(
        `${this.constructor.name}: cannot parse price from “${rawPrice}”`
      );
    const price = parseFloat(m[0].replace(/,/g, ''));

    /* ---- IMAGE ---- */
    let imageUrl = '';
    for (const sel of this.imageSelectors) {
      const handle = await page.$(sel);
      if (!handle) continue;

      const candidate = await page.$eval(
        sel,
        (el: any) =>
          el.getAttribute('data-old-hires')?.trim() || // Amazon-style attr (rare)
          // first URL from srcset • avoids the 2×/3× sizes
          el.getAttribute('srcset')?.split(' ')[0]?.trim() ||
          el.getAttribute('src')?.trim() ||
          el.getAttribute('href')?.trim() ||
          ''
      );
      if (candidate) {
        imageUrl = candidate;
        break;
      }
    }
    if (!imageUrl) {
      throw new Error(
        `${
          this.constructor.name
        }: no image found via [${this.imageSelectors.join(', ')}]`
      );
    }

    /* ---- tidy up ---- */
    await page.context().close();
    await page.close();

    return { price, imageUrl };
  }
}
