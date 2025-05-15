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

  protected imageSelectors = [
    'a.image_enlarger', // full-size image on the <a> href
    '.pi_slide a.image_enlarger', // fallback
    'img.product-thumbnail', // last ditch
  ];
}
