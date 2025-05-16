// src/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const DEFAULT_INTERVAL_MINUTES = parseInt(
  process.env.DEFAULT_INTERVAL_MINUTES ?? '1440',
  10
);
export const MS_PER_MINUTE = parseInt(process.env.MS_PER_MINUTE ?? '60000', 10);

export const REMOVE_ON_COMPLETE_AGE =
  Number(process.env.REMOVE_ON_COMPLETE_AGE) || 3600;
export const REMOVE_ON_COMPLETE_COUNT =
  Number(process.env.REMOVE_ON_COMPLETE_COUNT) || 1000;

export const REMOVE_ON_FAIL_AGE =
  Number(process.env.REMOVE_ON_FAIL_AGE) || 86400;
export const REMOVE_ON_FAIL_COUNT =
  Number(process.env.REMOVE_ON_FAIL_COUNT) || 500;
