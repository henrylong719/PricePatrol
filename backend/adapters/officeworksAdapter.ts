import { BrowserContext, Page } from 'playwright';
import { BasePlaywrightAdapter, PriceData } from './basePlaywrightAdapter';

export class OfficeworksAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = [
    'div[data-testid="price"]',
    'div[data-testid*="price"]',
    'div[class*="StyledPrice"]',
    'span[class*="StyledPrice"]',
    'meta[itemprop="price"]',
  ];

  protected imageSelectors = [
    'div.sc-jXbUNg img',
    'img.sc-eDPEul',
    'img[src*="s3-ap-southeast-2.amazonaws.com"]',
  ];

  async extractData(url: string): Promise<PriceData> {
    /* --- bootstrap page --- */
    await this.initBrowser();
    const ctxOpts: { userAgent?: string } = {};
    if (this.userAgent) ctxOpts.userAgent = this.userAgent;

    const context: BrowserContext = await this.browser.newContext(ctxOpts);
    const page: Page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    /* --- wait for price element --- */
    // one comma-joined selector string => waits for ANY of them
    const priceSelectorUnion = this.priceSelectors.join(', ');
    await page.waitForSelector(priceSelectorUnion, { timeout: 15_000 });

    /* --- PRICE --- */
    let rawPrice = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (!el) continue;

      if (sel.startsWith('meta')) {
        // meta[itemprop="price"] has the numeric value in its "content" attr
        const content = await page.$eval(
          sel,
          (e) => (e as HTMLElement).getAttribute('content') || ''
        );
        rawPrice = content;
      } else {
        rawPrice = (
          await page.$eval(sel, (e) => e.textContent?.trim() || '')
        ).trim();
      }
      if (rawPrice) break;
    }
    if (!rawPrice) {
      throw new Error(
        `${this.constructor.name}: no price found after waiting for ${priceSelectorUnion}`
      );
    }

    const m = rawPrice.replace(/[^\d.,]/g, '').match(/[\d,]+(?:\.\d{2})?/);
    if (!m)
      throw new Error(
        `${this.constructor.name}: cannot parse price from “${rawPrice}”`
      );
    const price = parseFloat(m[0].replace(/,/g, ''));

    /* --- IMAGE --- */
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

    /* --- tidy up --- */
    await page.context().close();
    await page.close();

    return { price, imageUrl };
  }
}
