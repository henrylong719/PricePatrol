import axios from 'axios';
import * as cheerio from 'cheerio';
import { PriceData } from './basePlaywrightAdapter';

export abstract class BaseCheerioAdapter {
  /** CSS selector(s) to try, in priority order */
  protected abstract priceSelectors: string[];

  /**
   * Fetch HTML, load into Cheerio, and return the first non-empty match
   */
  protected async scrapePriceText(url: string): Promise<string> {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    for (const sel of this.priceSelectors) {
      const text = $(sel).first().text().trim();
      if (text) {
        return text;
      }
    }

    throw new Error(
      `${this.constructor.name}: none of selectors [${this.priceSelectors.join(
        ', '
      )}] returned a price`
    );
  }

  /**
   * Strip out currency symbols / commas and parse to float.
   */
  protected parsePrice(raw: string): number {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const value = parseFloat(cleaned);
    if (isNaN(value)) {
      throw new Error(
        `${this.constructor.name}: unable to parse price from '${raw}'`
      );
    }
    return value;
  }

  /** Public API */
  async extractPrice(url: string): Promise<number> {
    const raw = await this.scrapePriceText(url);
    return this.parsePrice(raw);
  }

  async extractData(url: string): Promise<PriceData> {
    const price = await this.extractPrice(url);
    return { price, imageUrl: '' }; // no image extraction here
  }
}
