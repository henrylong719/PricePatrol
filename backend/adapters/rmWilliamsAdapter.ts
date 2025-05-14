import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

export class RMWilliamsAdapter extends BasePlaywrightAdapter {
  // try these in order until one matches
  protected priceSelectors = [
    '.product-price', // primary selector
    '.price-sales', // fallback (on sale)
    '.pdp-price-amount', // another possible pattern
  ];
}
