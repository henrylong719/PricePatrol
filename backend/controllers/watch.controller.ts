import { Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Watch } from '../models';
import { fetchQueue } from '../config/redis';
import { DEFAULT_INTERVAL_MINUTES, MS_PER_MINUTE } from '../config';

/**
 * Create a new price watch for a given user.
 *
 * @param req - Express request with body: { url, adapter, targetPrice?, continuousDrop?, intervalMinutes? }
 * @param res - Express response, returns the created Watch document
 */
const createWatch = asyncHandler(async (req: any, res: Response) => {
  const {
    url,
    adapter,
    targetPrice,
    continuousDrop = false,
    intervalMinutes = DEFAULT_INTERVAL_MINUTES, // default to 1 day
  } = req.body;

  const nextRunAt = new Date(Date.now() + intervalMinutes * MS_PER_MINUTE);
  const watch = await Watch.create({
    user: req.user._id,
    url,
    adapter,
    targetPrice,
    continuousDrop,
    intervalMinutes,
    nextRunAt,
    active: true,
    archived: false,
  });

  const jobId = String(watch._id);

  await fetchQueue.add(
    'fetchPrice',
    { watchId: watch._id },
    {
      delay: watch.intervalMinutes * MS_PER_MINUTE,
      jobId,
    }
  );

  res.status(201).json(watch);
});

/**
 * Get all watches for current user
 */
const getWatches = asyncHandler(async (req: any, res: Response) => {
  const watches = await Watch.find({ user: req.user._id, archived: false });
  res.json(watches);
});

/**
 * Get a single watch by ID
 */
const getWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }
  res.json(watch);
});

/**
 * Update a watch and reschedule its fetch job
 */
const updateWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }

  const updatableFields: (keyof typeof req.body)[] = [
    'url',
    'adapter',
    'targetPrice',
    'continuousDrop',
    'intervalMinutes',
    'active',
    'archived',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      (watch as any)[field] = req.body[field];
      if (field === 'intervalMinutes') {
        watch.nextRunAt = new Date(
          Date.now() + watch.intervalMinutes * MS_PER_MINUTE
        );
      }
    }
  });

  await watch.save();

  // remove existing repeatable job using BullMQ v5 API
  const jobId = String(watch._id);
  await fetchQueue.removeJobScheduler(jobId);

  // enqueue updated repeatable job
  await fetchQueue.add(
    'fetchPrice',
    { watchId: watch._id },
    {
      delay: watch.intervalMinutes * MS_PER_MINUTE,
      jobId,
    }
  );

  res.json(watch);
});

/**
 * Archive (soft-delete) a watch and remove its scheduled job
 */
const deleteWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }

  watch.archived = true;
  await watch.save();

  // remove scheduled repeatable job
  const jobId = String(watch._id);
  await fetchQueue.removeJobScheduler(jobId);

  res.status(204).end();
});

export { createWatch, getWatches, getWatch, updateWatch, deleteWatch };
