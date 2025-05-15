import 'dotenv/config';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';

export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const fetchQueue = new Queue('fetchPrice', {
  connection: redisConnection,
});
