// backend/adapters/RMWilliamsAdapter.ts
import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

export class RMWilliamsAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = [
    '.product-price',
    '.price-sales',
    '.pdp-price-amount',
  ];

  protected imageSelectors = [
    'div[data-test="img-zoom-wrap"] img',
    'div[data-test="image-wrap"] img',
  ];
}
