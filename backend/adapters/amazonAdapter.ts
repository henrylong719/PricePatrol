// backend/adapters/AmazonAdapter.ts
import { BasePlaywrightAdapter } from './basePlaywrightAdapter';
import { chromium, BrowserContext } from 'playwright';

export class AmazonAdapter extends BasePlaywrightAdapter {
  // Fallback selectors list (unused since extractPrice is overridden)
  protected priceSelectors: string[] = [];
  protected userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/91.0.4472.124 Safari/537.36';

  /**
   * Extract price by combining the whole and fraction parts.
   */
  async extractPrice(url: string): Promise<number> {
    // Launch context with custom UA
    await this.initBrowser();
    const context: BrowserContext = await this.browser.newContext({
      userAgent: this.userAgent,
    });
    const page = await context.newPage();

    page.setDefaultNavigationTimeout(60_000);
    page.setDefaultTimeout(60_000);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Selectors for whole-dollar and fraction parts
    const whole = await page.$eval(
      '.a-price-whole',
      (el) => el.textContent?.trim() || '0'
    );
    const fraction = await page.$eval(
      '.a-price-fraction',
      (el) => el.textContent?.trim() || '00'
    );

    await page.close();
    await context.close();

    const raw = `${whole}.${fraction}`;
    // parse e.g. "37.47"
    const value = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(value)) {
      throw new Error(`AmazonAdapter: unable to parse price from '${raw}'`);
    }
    return value;
  }
}
