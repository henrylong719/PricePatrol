import mongoose, { Model } from 'mongoose';
import { IWatch } from '../interfaces';

const watchSchema = new mongoose.Schema<IWatch>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    adapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Adapter',
      required: true,
    },
    targetPrice: { type: Number },
    continuousDrop: { type: Boolean, default: false },
    intervalMinutes: { type: Number, default: 60 },
    lastNotifiedAt: { type: Date },
    nextRunAt: { type: Date, index: true }, // schedule pointer for BullMQ
    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false }, // soft-delete flag
  },
  { timestamps: true }
);
// Query watches ready to run
watchSchema.index({ active: 1, nextRunAt: 1 });

const Watch: Model<IWatch> = mongoose.model('Watch', watchSchema);
export default Watch;
