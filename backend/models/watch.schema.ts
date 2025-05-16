import mongoose, { Model } from 'mongoose';
import slugify from 'slugify';
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
    slug: { type: String, required: true, unique: true, index: true }, // ← new
    imageUrl: { type: String, default: '' },
    targetPrice: { type: Number },
    continuousDrop: { type: Boolean, default: false },
    intervalMinutes: { type: Number, default: 60 },
    lastNotifiedAt: { type: Date },
    nextRunAt: { type: Date, index: true },
    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// auto‐generate or update slug when name changes
watchSchema.pre('validate', function (next) {
  if (this.name && this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

watchSchema.index({ isPublic: 1, active: 1, nextRunAt: 1 });

const Watch: Model<IWatch> = mongoose.model('Watch', watchSchema);
export default Watch;
