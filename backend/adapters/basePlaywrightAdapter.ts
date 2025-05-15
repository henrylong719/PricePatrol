// backend/adapters/basePlaywrightAdapter.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';

export interface PriceData {
  price: number;
  imageUrl: string;
}

/**
 * Abstract base class for Playwright-based adapters.
 * Now knows how to pull both price *and* imageUrl from any page.
 */
export abstract class BasePlaywrightAdapter {
  protected browser!: Browser;

  /** CSS selectors for price, in priority order */
  protected abstract priceSelectors: string[];
  /** CSS selectors for product image, in priority order */
  protected abstract imageSelectors: string[];

  protected userAgent?: string;

  /** ensure headless browser is up */
  protected async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  /** common page setup */
  private async setupPage(url: string): Promise<Page> {
    await this.initBrowser();
    const contextOpts: { userAgent?: string } = {};
    if (this.userAgent) contextOpts.userAgent = this.userAgent;

    const context: BrowserContext = await this.browser.newContext(contextOpts);
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    return page;
  }

  /**
   * Grab both price & image URL in one shot.
   */
  async extractData(url: string): Promise<PriceData> {
    const page = await this.setupPage(url);

    // — PRICE —
    let rawPriceText = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (!el) continue;
      rawPriceText = (
        await page.$eval(sel, (e) => e.textContent?.trim() || '')
      ).trim();
      if (rawPriceText) break;
    }
    if (!rawPriceText) {
      throw new Error(
        `${
          this.constructor.name
        }: no price found with selectors [${this.priceSelectors.join(', ')}]`
      );
    }
    const match = rawPriceText.match(/[\d,]+\.\d{2}/);
    if (!match) {
      throw new Error(
        `${this.constructor.name}: can't parse price from "${rawPriceText}"`
      );
    }
    const price = parseFloat(match[0].replace(/,/g, ''));

    // — IMAGE —
    let imageUrl = '';
    for (const sel of this.imageSelectors) {
      const handle = await page.$(sel);
      if (!handle) continue;

      // try both src (img) or href (anchor)
      // new: try data-old-hires, then src, then href
      const candidate = await page.$eval(
        sel,
        (el: any) =>
          el.getAttribute('data-old-hires')?.trim() ||
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
        }: no image found with selectors [${this.imageSelectors.join(', ')}]`
      );
    }

    // teardown
    await page.context().close();
    await page.close();

    return { price, imageUrl };
  }

  /** backwards-compatible price‐only call */
  async extractPrice(url: string): Promise<number> {
    return (await this.extractData(url)).price;
  }

  /** easy image‐only call, if needed */
  async extractImageUrl(url: string): Promise<string> {
    return (await this.extractData(url)).imageUrl;
  }

  /** clean up browser */
  async close() {
    if (this.browser) await this.browser.close();
  }
}
