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

    name: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    targetPrice: { type: Number },
    continuousDrop: { type: Boolean, default: false },
    intervalMinutes: { type: Number, default: 60 },

    lastNotifiedAt: { type: Date },
    nextRunAt: { type: Date, index: true },

    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false, index: true },

    latestPrice: { type: Number, default: null },
    latestFetchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

watchSchema.index({ user: 1, url: 1 }, { unique: true });

watchSchema.index({ isPublic: 1, active: 1, nextRunAt: 1 });

const Watch: Model<IWatch> = mongoose.model<IWatch>('Watch', watchSchema);
export default Watch;
