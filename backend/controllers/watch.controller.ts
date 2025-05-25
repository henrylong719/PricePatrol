import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Adapter, PriceLog, Watch } from '../models';
import { fetchQueue } from '../config/redis';
import { DEFAULT_INTERVAL_MINUTES, MS_PER_MINUTE } from '../config';
import adapterLoader from '../utils/adapterLoader';

/* ------------------------------------------------------------------ *
 *  POST /api/watches
 * ------------------------------------------------------------------ */
export const createWatch = asyncHandler(async (req: any, res: Response) => {
  try {
    const {
      name,
      url,
      adapter: adapterId,
      targetPrice,
      continuousDrop = false,
      intervalMinutes = DEFAULT_INTERVAL_MINUTES,
      isPublic = false,
    } = req.body;

    const adapterDoc = await Adapter.findById(adapterId);
    if (!adapterDoc) {
      return res.status(404).json({ message: 'Adapter not found' });
    }

    // 1. create a bare watch (latestPrice/image filled in later)
    const watch = await Watch.create({
      user: req.user._id,
      name,
      url,
      adapter: adapterId,
      targetPrice,
      continuousDrop,
      intervalMinutes,
      isPublic,
    });

    // 2. run first scrape immediately
    const scraper = await adapterLoader(adapterId);
    const { price, imageUrl } = await scraper.extractData(url);

    watch.latestPrice = price;
    watch.latestFetchedAt = new Date();
    watch.imageUrl = imageUrl;
    await watch.save();

    // 3. schedule next run
    const delay = intervalMinutes * MS_PER_MINUTE;
    await fetchQueue.add(
      'fetchPrice',
      { watchId: watch._id },
      { delay, jobId: String(watch._id) }
    );

    res.status(201).json(watch);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Watch already exists' });
    }
    throw err; // re-throw others
  }
});

/* ------------------------------------------------------------------ *
 *  GET /api/watches
 * ------------------------------------------------------------------ */
export const getWatches = asyncHandler(async (req: any, res: Response) => {
  const watches = await Watch.find({
    user: req.user._id,
    archived: false,
  })
    .populate({ path: 'adapter', select: 'name' })
    .select('-__v');

  res.json(watches);
});

/* ------------------------------------------------------------------ *
 *  GET /api/watches/:id               ← uses Mongo _id
 * ------------------------------------------------------------------ */
export const getWatchById = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate({ path: 'user', select: 'name profileImage' })
    .populate({ path: 'adapter', select: 'name' })
    .lean();

  if (!watch) {
    return res.status(404).json({ message: 'Watch not found' });
  }

  const priceHistory = await PriceLog.find({ watch: watch._id })
    .sort({ fetchedAt: -1 })
    .select('price fetchedAt -_id')
    .lean();

  res.json({ ...watch, priceHistory });
});

/* ------------------------------------------------------------------ *
 *  PUT /api/watches/:id               ← uses Mongo _id
 * ------------------------------------------------------------------ */
export const updateWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!watch) {
    return res.status(404).json({ message: 'Watch not found' });
  }

  const fields: (keyof typeof req.body)[] = [
    'name',
    'url',
    'adapter',
    'targetPrice',
    'continuousDrop',
    'intervalMinutes',
    'active',
    'archived',
    'isPublic',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      (watch as any)[f] = req.body[f];
      if (f === 'intervalMinutes') {
        watch.nextRunAt = new Date(
          Date.now() + watch.intervalMinutes * MS_PER_MINUTE
        );
      }
    }
  });

  await watch.save();

  // reschedule BullMQ job
  const jobId = String(watch._id);
  await fetchQueue.removeJobScheduler(jobId);
  await fetchQueue.add(
    'fetchPrice',
    { watchId: watch._id },
    { delay: watch.intervalMinutes * MS_PER_MINUTE, jobId }
  );

  res.json(watch);
});

/* ------------------------------------------------------------------ *
 *  DELETE /api/watches/:id            ← uses Mongo _id
 * ------------------------------------------------------------------ */
export const deleteWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!watch) {
    return res.status(404).json({ message: 'Watch not found' });
  }

  watch.archived = true;
  await watch.save();
  await fetchQueue.removeJobScheduler(String(watch._id));

  res.status(204).end();
});

/* ------------------------------------------------------------------ *
 *  GET /api/public-watches
 * ------------------------------------------------------------------ */
export const getPublicWatches = asyncHandler(async (_req, res: Response) => {
  const watches = await Watch.find({
    isPublic: true,
    active: true,
    archived: false,
  })
    .populate({ path: 'user', select: 'name profileImage' })
    .populate({ path: 'adapter', select: 'name' })
    .sort({ latestFetchedAt: -1 })
    .limit(50)
    .select(
      'name imageUrl url targetPrice latestPrice latestFetchedAt createdAt'
    );

  res.json(watches);
});

/* ------------------------------------------------------------------ *
 *  GET /api/public-watches/:id        ← uses Mongo _id
 * ------------------------------------------------------------------ */
export const getPublicWatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const watch = await Watch.findOne({
      _id: req.params.id,
      isPublic: true,
      active: true,
      archived: false,
    })
      .populate({ path: 'user', select: 'name profileImage' })
      .populate({ path: 'adapter', select: 'name' })
      .lean();

    if (!watch) {
      return res.status(404).json({ message: 'Watch not found or not public' });
    }

    const priceHistory = await PriceLog.find({ watch: watch._id })
      .sort({ fetchedAt: -1 })
      .select('price fetchedAt -_id')
      .lean();

    res.json({ ...watch, priceHistory });
  }
);
