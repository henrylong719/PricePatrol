import { BaseCheerioAdapter } from './baseCheerioAdapter';

export class GenericCheerioAdapter extends BaseCheerioAdapter {
  constructor(public selector: string) {
    super();
  }
  protected priceSelectors = [this.selector];
}
