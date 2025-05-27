// PriceLog – each point in the price-history time series

import type { IWatch } from './watch.interface';

export interface IPriceLog extends Document {
  watch: IWatch;
  price: number;
  fetchedAt: Date;
}

export type PricePoint = { date: string; price: number };

export type PriceRange = '3m' | '6m' | '1y' | 'all';
