import { Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Adapter, Watch } from '../models';
import { fetchQueue } from '../config/redis';
import { DEFAULT_INTERVAL_MINUTES, MS_PER_MINUTE } from '../config';
import adapterLoader from '../utils/adapterLoader';

/**
 * Create a new price watch for a given user.
 *
 * @param req - Express request with body: { url, adapter, targetPrice?, continuousDrop?, intervalMinutes? }
 * @param res - Express response, returns the created Watch document
 */
const createWatch = asyncHandler(async (req: any, res: Response) => {
  const {
    url,
    adapter: adapterId,
    targetPrice,
    continuousDrop = false,
    intervalMinutes = DEFAULT_INTERVAL_MINUTES,
  } = req.body;

  const adapterDoc = await Adapter.findById(adapterId);
  if (!adapterDoc) {
    return res.status(404).json({ message: 'Adapter not found' });
  }

  let watch = await Watch.create({
    user: req.user._id,
    url,
    adapter: adapterId,
    targetPrice,
    continuousDrop,
    intervalMinutes,
  });

  const scraper = await adapterLoader(adapterId);

  const { imageUrl } = await scraper.extractData(url);

  watch.imageUrl = imageUrl;
  await watch.save();

  const jobId = String(watch._id);
  const delay = intervalMinutes * MS_PER_MINUTE;

  await fetchQueue.add(
    'fetchPrice', // name of the queue processor
    { watchId: watch._id },
    { delay, jobId }
  );

  res.status(201).json(watch);
});

/**
 * Get all watches for current user
 */
const getWatches = asyncHandler(async (req: any, res: Response) => {
  try {
    const watches = await Watch.find({ user: req.user._id, archived: false });
    res.json(watches);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * Get a single watch by ID
 */
const getWatch = asyncHandler(async (req: any, res: Response) => {
  try {
    const watch = await Watch.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!watch) {
      res.status(404);
      throw new Error('Watch not found');
    }
    res.json(watch);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * Update a watch and reschedule its fetch job
 */
const updateWatch = asyncHandler(async (req: any, res: Response) => {
  try {
    const watch = await Watch.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Archive (soft-delete) a watch and remove its scheduled job
 */
const deleteWatch = asyncHandler(async (req: any, res: Response) => {
  try {
    const watch = await Watch.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export { createWatch, getWatches, getWatch, updateWatch, deleteWatch };
