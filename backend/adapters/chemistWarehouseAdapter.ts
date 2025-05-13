// backend/adapters/ChemistWarehouseAdapter.ts
import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

export class ChemistWarehouseAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = [
    '[id$="lblActualPrice"]',
    '.product__price',
    '[itemprop="price"]',
    '.product-pricing__price--final',
    '.product-pricing__price--standard',
    '.product-price span.price',
  ];
  protected userAgent?: string = undefined;
}

// import { chromium, Browser, Page } from 'playwright';

// /**
//  * ChemistWarehouseAdapter
//  * -----------------------
//  * A built-in PriceAdapter implementation for chemistwarehouse.com.au.
//  * Uses Playwright to load the page and extract the product price.
//  * Supports both "Buy" and "Topical" page layouts.
//  */
// export class ChemistWarehouseAdapter {
//   private browser!: Browser;

//   /**
//    * Launches a headless browser if not already launched.
//    */
//   private async initBrowser() {
//     if (!this.browser) {
//       this.browser = await chromium.launch({ headless: true });
//     }
//   }

//   /**
//    * Extracts the numeric price from a Chemist Warehouse product page.
//    * Tries multiple selectors to cover different page templates.
//    * @param url - Full product URL
//    * @returns Parsed price as a number
//    */
//   async extractPrice(url: string): Promise<number> {
//     await this.initBrowser();
//     const page: Page = await this.browser.newPage();

//     // Increase timeouts to handle large pages
//     page.setDefaultNavigationTimeout(60_000);
//     page.setDefaultTimeout(60_000);

//     // Wait for initial DOM load (faster than networkidle)
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

//     // List of selectors covering both "Buy" and "Topical" templates
//     const priceSelectors = [
//       // Topical & ASPX: generic ID ending in lblActualPrice
//       '[id$="lblActualPrice"]',
//       // Topical layout: div with itemprop price
//       '.Price[itemprop="price"]',
//       '[itemprop="price"]',
//       // "Buy" layout: final price class
//       '.product-pricing__price--final',
//       '.product-pricing__price--standard',
//       // fallback: generic span with product__price class
//       '.product__price',
//       // generic fallback
//       '.product-price span.price',
//     ];

//     let rawText = '';
//     for (const sel of priceSelectors) {
//       const el = await page.$(sel);
//       if (el) {
//         rawText = await page.$eval(
//           sel,
//           (e: Element) => e.textContent?.trim() || ''
//         );
//         break;
//       }
//     }
//     await page.close();

//     if (!rawText) {
//       throw new Error(
//         `ChemistWarehouseAdapter: none of selectors ${priceSelectors.join(
//           ', '
//         )} found`
//       );
//     }

//     // Extract numeric value, e.g. "11.99"
//     const match = rawText.match(/[\d,]+\.\d{2}/);
//     if (!match) {
//       throw new Error(
//         `ChemistWarehouseAdapter: price not found in '${rawText}'`
//       );
//     }

//     return parseFloat(match[0].replace(/,/g, ''));
//   }

//   /**
//    * Closes the Playwright browser when done.
//    */
//   async close() {
//     if (this.browser) {
//       await this.browser.close();
//     }
//   }
// }
