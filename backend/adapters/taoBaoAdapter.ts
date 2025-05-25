import { BrowserContext, Page } from 'playwright';
import { BasePlaywrightAdapter, PriceData } from './basePlaywrightAdapter';

export class TaoBaoAdapter extends BasePlaywrightAdapter {
  /** Price text lives in a span whose class segment ends `--text--…` */
  protected priceSelectors = [
    'div[data-additional-module="true"] span[class*="--text--"]',
    'span[class*="--text--"]', // loose fallback
    'meta[property="og:price:amount"]', // sometimes embedded in <head>
    'meta[name="price"]',
  ];

  /** Main product image or first thumbnail */
  protected imageSelectors = [
    'img[class*="--mainPic--"]',
    'img[class*="--thumbnailPic--"]',
    'img[src*="alicdn.com"]',
  ];

  /**
   * Waits for one of the price selectors to appear (handles lazy render),
   * parses yuan values (e.g. “5.02” or “￥5”) and normalises image URLs.
   */
  async extractData(url: string): Promise<PriceData> {
    /* ––– bootstrap ––– */
    await this.initBrowser();
    const ctxOpts: { userAgent?: string } = {};
    if (this.userAgent) ctxOpts.userAgent = this.userAgent;

    const context: BrowserContext = await this.browser.newContext(ctxOpts);
    const page: Page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    /* ––– wait for price ––– */
    const priceUnion = this.priceSelectors.join(', ');
    await page.waitForSelector(priceUnion, { timeout: 15_000 });

    /* ––– PRICE ––– */
    let rawPrice = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (!el) continue;

      if (sel.startsWith('meta')) {
        rawPrice = await page.$eval(
          sel,
          (e) => (e as HTMLElement).getAttribute('content') || ''
        );
      } else {
        rawPrice = (
          await page.$eval(sel, (e) => e.textContent?.trim() || '')
        ).trim();
      }
      if (rawPrice) break;
    }
    if (!rawPrice) {
      throw new Error(
        `${this.constructor.name}: no price found after waiting for ${priceUnion}`
      );
    }

    // Strip “￥” or “¥”, commas, etc.   Accept “12” “12.5” “12.50”
    const m = rawPrice.replace(/[^\d.,]/g, '').match(/[\d,]+(?:\.\d{1,2})?/);
    if (!m)
      throw new Error(
        `${this.constructor.name}: cannot parse price from “${rawPrice}”`
      );
    const price = parseFloat(m[0].replace(/,/g, ''));

    /* ––– IMAGE ––– */
    let imageUrl = '';
    for (const sel of this.imageSelectors) {
      const handle = await page.$(sel);
      if (!handle) continue;

      const candidate = await page.$eval(
        sel,
        (el: any) =>
          el.getAttribute('data-old-hires')?.trim() ||
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
    if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

    /* ––– tidy up ––– */
    await page.context().close();
    await page.close();

    return { price, imageUrl };
  }
}
