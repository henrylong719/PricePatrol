// PriceLog – each point in the price-history time series

import type { IWatch } from './watch.interface';

export interface IPriceLog extends Document {
  watch: IWatch;
  price: number;
  fetchedAt: Date;
}
