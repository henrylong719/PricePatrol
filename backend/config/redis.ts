import 'dotenv/config';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import {
  REMOVE_ON_COMPLETE_AGE,
  REMOVE_ON_COMPLETE_COUNT,
  REMOVE_ON_FAIL_AGE,
  REMOVE_ON_FAIL_COUNT,
} from './constants';

export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const fetchQueue = new Queue('fetchPrice', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: {
      age: REMOVE_ON_COMPLETE_AGE,
      count: REMOVE_ON_COMPLETE_COUNT,
    },
    removeOnFail: {
      age: REMOVE_ON_FAIL_AGE,
      count: REMOVE_ON_FAIL_COUNT,
    },
  },
});
