import mongoose, { Model } from 'mongoose';
import slugify from 'slugify';
import { randomBytes } from 'crypto';
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
    slug: { type: String, required: true, unique: true, index: true },
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

async function generateUniqueSlug(
  this: mongoose.Document & IWatch,
  base: string
): Promise<string> {
  const WatchModel = this.constructor as Model<IWatch>;
  const baseSlug = slugify(base, { lower: true, strict: true });
  let slug = baseSlug;

  if (await WatchModel.exists({ slug, _id: { $ne: this._id } })) {
    do {
      const suffix = randomBytes(3).toString('hex'); // 6 hex chars
      slug = `${baseSlug}-${suffix}`;
    } while (await WatchModel.exists({ slug, _id: { $ne: this._id } }));
  }

  return slug;
}

watchSchema.pre('validate', async function (next) {
  if (this.isModified('name') || !this.slug) {
    const base = this.name?.trim() || this.url;
    this.slug = await generateUniqueSlug.call(this, base);
  }
  next();
});

watchSchema.index({ isPublic: 1, active: 1, nextRunAt: 1 });

const Watch: Model<IWatch> = mongoose.model<IWatch>('Watch', watchSchema);
export default Watch;
