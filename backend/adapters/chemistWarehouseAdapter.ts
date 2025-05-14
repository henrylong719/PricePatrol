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
