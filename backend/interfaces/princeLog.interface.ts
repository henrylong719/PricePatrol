// PriceLog – each point in the price-history time series

import mongoose, { Model, Document } from 'mongoose';
import { IWatch } from './watch.interface';

export interface IPriceLog extends Document {
  watch: mongoose.Types.ObjectId | IWatch;
  price: number;
  fetchedAt: Date;
}
