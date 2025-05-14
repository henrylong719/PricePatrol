import { chromium, Browser, BrowserContext, Page } from 'playwright';

/**
 * Abstract base class for Playwright-based price adapters.
 * Provides browser lifecycle, context creation, page navigation, and selector-based extraction.
 */
export abstract class BasePlaywrightAdapter {
  protected browser!: Browser;
  protected abstract priceSelectors: string[];
  protected userAgent?: string;

  /**
   * Ensure a headless browser is launched.
   */
  protected async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }

  /**
   * Navigate to the URL, extract price text using configured selectors.
   * @param url - Page to navigate to
   */
  protected async scrapePriceText(url: string): Promise<string> {
    await this.initBrowser();
    // create a new context for each request to set userAgent if provided
    const contextOpts: { userAgent?: string } = {};
    if (this.userAgent) {
      contextOpts.userAgent = this.userAgent;
    }
    const context: BrowserContext = await this.browser.newContext(contextOpts);
    const page: Page = await context.newPage();

    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    let rawText = '';
    for (const sel of this.priceSelectors) {
      const el = await page.$(sel);
      if (el) {
        rawText = await page.$eval(sel, (e) => e.textContent?.trim() || '');
        if (rawText) break;
      }
    }

    await page.close();
    await context.close();

    if (!rawText) {
      throw new Error(
        `${this.constructor.name}: none of selectors ${this.priceSelectors.join(
          ', '
        )} found`
      );
    }
    return rawText;
  }

  /**
   * Parse numeric value from extracted text.
   */
  protected parsePrice(rawText: string): number {
    const match = rawText.match(/[\d,]+\.\d{2}/);
    if (!match) {
      throw new Error(
        `${this.constructor.name}: price not found in '${rawText}'`
      );
    }
    return parseFloat(match[0].replace(/,/g, ''));
  }

  /**
   * Public API: extract price from URL.
   */
  async extractPrice(url: string): Promise<number> {
    const raw = await this.scrapePriceText(url);
    return this.parsePrice(raw);
  }

  /**
   * Shutdown browser if open.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
