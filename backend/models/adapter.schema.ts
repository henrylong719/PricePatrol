import mongoose, { Model } from 'mongoose';
import { IAdapter } from '../interfaces';

const adapterSchema = new mongoose.Schema<IAdapter>(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    type: { type: String, enum: ['builtin', 'custom'], required: true },
    selector: { type: String },
    jsonEndpoint: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

adapterSchema.index({ domain: 1, createdBy: 1, type: 1 }, { unique: true });

const Adapter: Model<IAdapter> = mongoose.model('Adapter', adapterSchema);
export default Adapter;
