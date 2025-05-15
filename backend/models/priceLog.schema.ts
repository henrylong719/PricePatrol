import mongoose, { Model } from 'mongoose';
import { IPriceLog } from '../interfaces';

const priceLogSchema = new mongoose.Schema<IPriceLog>(
  {
    watch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Watch',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false }
);

// 1) TTL index on fetchedAt – expire logs after 1 year
priceLogSchema.index(
  { fetchedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 }
);

// 2) Compound index for history queries sorted by time
priceLogSchema.index({ watch: 1, fetchedAt: -1 });

const PriceLog: Model<IPriceLog> = mongoose.model('PriceLog', priceLogSchema);
export default PriceLog;
