// Watch – what the user is monitoring

import type { IUser } from './user.interface';

export interface IWatch extends Document {
  user: IUser;
  url: string;
  name: string;
  slug: string;
  imageUrl?: string;
  adapter: string; // ref to an Adapter
  targetPrice?: number; // user-set target
  continuousDrop: boolean; // true = alert on any drop
  intervalMinutes: number; // how often to poll
  lastNotifiedAt?: Date; // when we last sent an alert
  active: boolean; // allow pause/resume
  isPublic?: boolean;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}
