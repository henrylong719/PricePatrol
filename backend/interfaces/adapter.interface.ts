// Adapter – how to scrape or fetch a price for a given domain

import mongoose, { Model, Document } from 'mongoose';
import { IUser } from './user.interface';

export interface IAdapter extends Document {
  name: string; // e.g. “ChemistWarehouse”
  domain: string; // e.g. “chemistwarehouse.com”
  type: 'builtin' | 'custom'; // builtin = in-code adapter; custom = user-provided selector
  selector?: string; // CSS or XPath, if custom
  jsonEndpoint?: string; // optional reverse-engineered JSON URL
  createdBy?: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}
