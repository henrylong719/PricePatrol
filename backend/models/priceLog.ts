import mongoose, { Model } from 'mongoose';
import { IPriceLog } from '../interfaces';

const priceLogSchema = new mongoose.Schema<IPriceLog>({
  watch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watch',
    required: true,
    index: true,
  },
  price: { type: Number, required: true },
  fetchedAt: { type: Date, default: () => new Date(), index: true },
});
// Keep only X days of logs (e.g., 90 days)
priceLogSchema.index(
  { fetchedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 }
);
// For quick history lookups
priceLogSchema.index({ watch: 1, fetchedAt: -1 });

const PriceLog: Model<IPriceLog> = mongoose.model('PriceLog', priceLogSchema);
export default PriceLog;
