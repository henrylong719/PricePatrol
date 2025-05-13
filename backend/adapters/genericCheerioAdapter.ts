import axios from 'axios';
import cheerio from 'cheerio';

export class GenericCheerioAdapter {
  constructor(private selector: string) {}
  async extractPrice(url: string): Promise<number> {
    const html = (await axios.get(url)).data;
    const $ = cheerio.load(html);
    const text = $(this.selector).first().text();
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }
}
