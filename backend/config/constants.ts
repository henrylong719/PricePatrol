// src/config.ts
import dotenv from 'dotenv';
dotenv.config();

export const DEFAULT_INTERVAL_MINUTES = parseInt(
  process.env.DEFAULT_INTERVAL_MINUTES ?? '1440',
  10
);
export const MS_PER_MINUTE = parseInt(process.env.MS_PER_MINUTE ?? '60000', 10);
