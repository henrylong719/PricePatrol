// // backend/adapters/ColesAdapter.ts
// import axios from 'axios';
// import { BasePlaywrightAdapter } from './basePlaywrightAdapter';
// import type { BrowserContext, Page } from 'playwright';

// export class ColesAdapter extends BasePlaywrightAdapter {
//   // satisfy abstract
//   protected priceSelectors: string[] = [];

//   async extractPrice(url: string): Promise<number> {
//     // —―― JSON API attempt ―――—
//     const m = url.match(/product\/(?:.*-)?(\d+)(?:[?\/]|$)/);
//     if (m) {
//       const productId = m[1];
//       const apiUrl = `https://www.coles.com.au/apis/ui/ProductView?locationId=7000&productId=${productId}`;
//       try {
//         const { data } = await axios.get(apiUrl);
//         const raw = data?.ProductView?.price;
//         if (raw != null) {
//           const p = parseFloat(String(raw));
//           if (!isNaN(p)) return p;
//         }
//       } catch (err: any) {
//         if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
//           // some other error—let’s fall back to scraping
//         }
//       }
//     }

//     // ――― Playwright fallback ―――
//     await this.initBrowser();
//     const context: BrowserContext = await this.browser.newContext();
//     const page: Page = await context.newPage();

//     await page.goto(url, {
//       waitUntil: 'networkidle',
//       timeout: 60_000,
//     });

//     // 1) Wait for the outer section that always appears
//     await page.waitForSelector('section[data-testid="product_price"]', {
//       timeout: 30_000,
//     });

//     // 2) Now pull the span inside it
//     const raw = await page.$eval(
//       'section[data-testid="product_price"] span.price__value, section[data-testid="product_price"] span[aria-label^="Price"]',
//       (el) => (el.textContent || '').trim()
//     );

//     await page.close();
//     await context.close();

//     // 3) Parse via the base‐class helper
//     return this.parsePrice(raw);
//   }
// }
