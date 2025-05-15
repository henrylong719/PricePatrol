import { BasePlaywrightAdapter } from './basePlaywrightAdapter';

export class AmazonAdapter extends BasePlaywrightAdapter {
  protected priceSelectors = ['.a-price .a-offscreen'];

  protected imageSelectors = [
    '#landingImage', // primary dynamic image
    '#imgTagWrapperId img', // image inside the wrapper div
    'span.a-declarative img.fullscreen', // fallback older selector
  ];
}
