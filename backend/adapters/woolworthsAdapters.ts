// import axios from 'axios';
// import cheerio from 'cheerio';
// import { LaunchOptions, BrowserContext, Page } from 'playwright';
// import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

// // ───────────────────────────────────────────────────────────
// // Env‑configurable defaults
// // ───────────────────────────────────────────────────────────
// const STORE_ID = process.env.WOOLIES_STORE_ID ?? '7000';
// const HTTP_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS) ?? 10_000;
// const PW_TIMEOUT_MS = Number(process.env.PLAYWRIGHT_TIMEOUT_MS) ?? 60_000;
// const DISABLE_H2 = /^true$/i.test(process.env.PLAYWRIGHT_DISABLE_HTTP2 ?? '');

// // ───────────────────────────────────────────────────────────
// // Adapter
// // ───────────────────────────────────────────────────────────
// export class WoolworthsAdapter extends BasePlaywrightAdapter {
//   /** JSON & meta routes mean we rarely need CSS selectors */
//   protected priceSelectors: string[] = [];

//   /** Canonical UA – set once in ctor to satisfy the base class property */
//   private static readonly DEFAULT_UA =
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//     'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//     'Chrome/122.0.0.0 Safari/537.36';

//   constructor() {
//     super();
//     this.userAgent = WoolworthsAdapter.DEFAULT_UA;
//   }

//   /* ---------- helpers ---------- */

//   /** STEP 1 – lightweight JSON API */
//   private async tryJson(
//     productId: string,
//     referer: string
//   ): Promise<number | null> {
//     const url =
//       `https://www.woolworths.com.au/apis/ui/ProductSummaryView` +
//       `?productId=${productId}&storeId=${STORE_ID}`;

//     const { data } = await axios.get(url, {
//       timeout: HTTP_TIMEOUT_MS,
//       headers: {
//         accept: 'application/json, text/plain',
//         referer,
//         'user-agent': this.userAgent!,
//       },
//       validateStatus: (s) => s < 500,
//     });

//     const raw =
//       data?.ProductSummaryView?.Price ??
//       data?.ProductSummaryView?.DisplayPrice ??
//       data?.ProductSummaryView?.Prices?.Default ??
//       null;

//     const price = parseFloat(String(raw));
//     return isNaN(price) ? null : price;
//   }

//   /** STEP 2 – plain GET + meta tag scrape (no JS) */
//   private async tryStaticHtml(url: string): Promise<number | null> {
//     const { data: html } = await axios.get(url, {
//       timeout: HTTP_TIMEOUT_MS,
//       headers: { 'user-agent': this.userAgent! },
//     });

//     const $ = cheerio.load(html);
//     const metaContent = $('meta[property="product:price:amount"]').attr(
//       'content'
//     );
//     const price = metaContent ? parseFloat(metaContent) : NaN;
//     return isNaN(price) ? null : price;
//   }

//   /** STEP 3 – Playwright fallback (HTTP/2 optionally disabled) */
//   private async tryPlaywright(url: string): Promise<number> {
//     const launchArgs: LaunchOptions = {
//       headless: true,
//       args: DISABLE_H2 ? ['--disable-http2'] : [],
//     };
//     await this.initBrowser(launchArgs);

//     const context: BrowserContext = await this.browser!.newContext({
//       ignoreHTTPSErrors: true,
//       userAgent: this.userAgent!,
//     });

//     // block heavy assets
//     await context.route(
//       '**/*.{png,jpg,jpeg,webp,avif,gif,svg,woff,woff2}',
//       (r) => r.abort()
//     );

//     const page: Page = await context.newPage();
//     await page.goto(url, {
//       waitUntil: 'domcontentloaded',
//       timeout: PW_TIMEOUT_MS,
//     });
//     await page.waitForSelector('[data-testid="product-price"]', {
//       timeout: PW_TIMEOUT_MS,
//     });

//     const rawText = await page.$eval(
//       '[data-testid="product-price"]',
//       (el) => el.textContent?.trim() ?? ''
//     );

//     await context.close();
//     return this.parsePrice(rawText);
//   }

//   /* ---------- public API ---------- */

//   async extractPrice(url: string): Promise<number> {
//     const m = url.match(/\/productdetails\/(\d+)/);
//     const productId = m?.[1];

//     if (productId) {
//       try {
//         const fromJson = await this.tryJson(productId, url);
//         if (fromJson != null) return fromJson;
//       } catch {
//         /* swallow and try the next strategy */
//       }
//     }

//     try {
//       const fromHtml = await this.tryStaticHtml(url);
//       if (fromHtml != null) return fromHtml;
//     } catch {
//       /* swallow */
//     }

//     // last‑ditch effort: run headless Chromium
//     return this.tryPlaywright(url);
//   }
// }
