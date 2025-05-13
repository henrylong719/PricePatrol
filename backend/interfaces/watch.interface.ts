// Watch – what the user is monitoring

import mongoose, { Model, Document } from 'mongoose';
import { IUser } from './user.interface';

export interface IWatch extends Document {
  user: mongoose.Types.ObjectId | IUser;
  url: string;
  name: string;
  adapter: mongoose.Types.ObjectId; // ref to an Adapter
  targetPrice?: number; // user-set target
  continuousDrop: boolean; // true = alert on any drop
  intervalMinutes: number; // how often to poll
  lastNotifiedAt?: Date; // when we last sent an alert
  active: boolean; // allow pause/resume
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}
