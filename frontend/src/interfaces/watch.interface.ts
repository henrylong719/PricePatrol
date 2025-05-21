// Watch – what the user is monitoring

import type { IAdapter } from './adapter.interface';
import type { IUser } from './user.interface';

export interface IWatch {
  id?: string;
  user: IUser;
  url: string;
  name: string;
  slug: string;
  imageUrl?: string;
  adapter: Pick<IAdapter, 'name'>; // ref to an Adapter
  targetPrice?: number; // user-set target
  continuousDrop: boolean; // true = alert on any drop
  intervalMinutes: number; // how often to poll
  lastNotifiedAt?: Date; // when we last sent an alert
  active: boolean; // allow pause/resume
  isPublic?: boolean;
  nextRunAt?: Date;
  latestPrice?: number | null;
  latestFetchedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}
