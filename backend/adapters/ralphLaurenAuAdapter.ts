// backend/adapters/RalphLaurenAuAdapter.ts
import * as cheerio from 'cheerio';
import { BrowserContext, Page } from 'playwright';
import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

/* ──────────────────────────────────────────────────────────────── */
/*  Helpers & constants                                            */
/* ──────────────────────────────────────────────────────────────── */

const GUID_RE =
  /(?:shopAPIClientId|dwShopClientId|client_id)"?\s*:\s*"([a-f0-9-]{32,36})"/i;
const API_VERSIONS = ['v23_2', 'v23_1', 'v22_6', 'v22_5', 'v21_3'];
let cachedClientId: string | null = null;

async function discoverClientId(
  pdpUrl: string,
  ua: string
): Promise<string | null> {
  if (cachedClientId) return cachedClientId;
  try {
    const res = await fetch(pdpUrl, {
      headers: { 'User-Agent': ua, Accept: 'text/html' },
    });
    const html = await res.text();
    const m = html.match(GUID_RE);
    if (m) cachedClientId = m[1];
    return cachedClientId;
  } catch {
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────── */
/*  Adapter                                                        */
/* ──────────────────────────────────────────────────────────────── */

export class RalphLaurenAuAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = [
    '.product-price input[data-price-value]',
    '.product-price input[value]',
    '.product-price .price-sales',
    'meta[itemprop="price"]',
    'meta[property="product:price:amount"]',
  ];

  protected userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

  /* ------------------------------------------------------------ */
  /*  Public API                                                  */
  /* ------------------------------------------------------------ */

  async extractPrice(url: string): Promise<number> {
    const pid = this.extractPid(url);
    if (pid) {
      const apiPrice = await this.fetchViaShopApi(pid, url);
      if (apiPrice !== null) return apiPrice;
    }

    // Last‑chance: Playwright (captcha‑aware) + snapshot parsing
    return this.extractViaPlaywright(url);
  }

  /* ------------------------------------------------------------ */
  /*  Fast path – Salesforce CC Shop‑API                          */
  /* ------------------------------------------------------------ */

  private async fetchViaShopApi(
    pid: string,
    pdpUrl: string
  ): Promise<number | null> {
    const cid = await discoverClientId(pdpUrl, this.userAgent);
    if (!cid) return null;

    for (const v of API_VERSIONS) {
      const api =
        `https://www.ralphlauren.com.au/on/demandware.store/` +
        `Sites-RalphLauren_AU-Site/en_AU/dw/shop/${v}/products/${pid}` +
        `?expand=prices&client_id=${cid}`;

      try {
        const res = await fetch(api, {
          headers: {
            'User-Agent': this.userAgent,
            Accept: 'application/json',
            'x-dw-resource-format': 'application/json',
            'x-dw-client-id': cid,
          },
        });

        /* If we get HTML instead of JSON, try parsing the price anyway */
        const ctype = res.headers.get('content-type') ?? '';
        if (!ctype.includes('json')) {
          const html = await res.text();
          const priceFromHtml = this.grabPriceFromHtml(html);
          if (priceFromHtml !== null) return priceFromHtml;
          continue; // try next version
        }

        const j: any = await res.json().catch(() => null);
        const p =
          j?.price?.sales?.value ??
          j?.price?.standard?.value ??
          j?.price?.list?.value ??
          null;

        if (typeof p === 'number') return p;
      } catch {
        /* network / JSON error – continue */
      }
    }
    return null;
  }

  /* ------------------------------------------------------------ */
  /*  Playwright fallback                                         */
  /* ------------------------------------------------------------ */

  private async extractViaPlaywright(url: string): Promise<number> {
    await this.initBrowser();
    const ctx: BrowserContext = await this.browser.newContext({
      userAgent: this.userAgent,
      locale: 'en-AU',
      ignoreHTTPSErrors: true,
    });

    await ctx.route('**/*', (r) =>
      ['image', 'stylesheet', 'font', 'other'].includes(
        r.request().resourceType()
      )
        ? r.abort()
        : r.continue()
    );

    const page: Page = await ctx.newPage();
    page.setDefaultTimeout(60_000);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Perimeter‑X captcha wall?
    const blocked = await page
      .evaluate(() =>
        /px-captcha|Access to this page has been denied/i.test(
          document.documentElement.innerHTML
        )
      )
      .catch(() => false);
    if (blocked) {
      await page.close();
      await ctx.close();
      throw new Error('RalphLaurenAuAdapter: blocked by Perimeter‑X captcha');
    }

    await page.evaluate(() => {
      document.querySelector('#onetrust-banner-sdk')?.remove();
    });

    await page
      .waitForFunction(
        () =>
          !!document.querySelector('.product-price')?.textContent?.match(/\d/),
        { timeout: 30_000 }
      )
      .catch(() => {});

    const live = await page
      .evaluate(() => {
        const digits = (s: string | null) =>
          s?.match(/(\d+(?:\.\d+)?)/)?.[1] ?? null;

        const cents = document
          .querySelector<HTMLInputElement>('input[data-price-value]')
          ?.getAttribute('data-price-value');
        if (cents && /^\d+$/.test(cents)) return parseInt(cents, 10) / 100;

        const val = document
          .querySelector<HTMLInputElement>('input[value]')
          ?.getAttribute('value');
        if (val && !isNaN(Number(val))) return parseFloat(val);

        return digits(
          document.querySelector('.product-price')?.textContent || ''
        );
      })
      .catch(() => null);

    const html = await page.content();
    await page.close();
    await ctx.close();

    if (live !== null && !isNaN(Number(live))) return Number(live);

    const snap = this.grabPriceFromHtml(html);
    if (snap !== null) return snap;

    throw new Error('RalphLaurenAuAdapter: unable to parse price (all paths)');
  }

  /* ------------------------------------------------------------ */
  /*  Utility parsers                                             */
  /* ------------------------------------------------------------ */

  private extractPid(url: string): string | null {
    return url.match(/-(\d{13})\.html?/)?.[1] ?? null;
  }

  /** Parse price from any RL HTML chunk (Cheerio) */
  private grabPriceFromHtml(html: string): number | null {
    const $ = cheerio.load(html);

    // hidden inputs
    for (const el of $('.product-price input').toArray()) {
      const cents = $(el).attr('data-price-value')?.trim();
      if (cents && /^\d+$/.test(cents)) return parseInt(cents, 10) / 100;
      const val = $(el).attr('value')?.trim();
      if (val && !isNaN(Number(val))) return parseFloat(val);
    }

    // visible span
    const span = $('.product-price').first().text().trim();
    const m = span.match(/(\d+(?:\.\d+)?)/);
    if (m) return parseFloat(m[1]);

    // meta tags
    const meta =
      $('meta[itemprop="price"]').attr('content') ||
      $('meta[property="product:price:amount"]').attr('content');
    if (meta && !isNaN(Number(meta))) return parseFloat(meta);

    // JSON‑LD
    const jsonLd = $('script[type="application/ld+json"]')
      .map((_, el) => $(el).html())
      .get()
      .join('\n');
    const j = jsonLd.match(/"price"\s*:\s*"?(\d+(?:\.\d+)?)/);
    if (j) return parseFloat(j[1]);

    return null;
  }
}
