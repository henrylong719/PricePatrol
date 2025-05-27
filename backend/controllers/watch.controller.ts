import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Adapter, PriceLog, Watch } from '../models';
import { fetchQueue } from '../config/redis';
import { DEFAULT_INTERVAL_MINUTES, MS_PER_MINUTE } from '../config';
import adapterLoader from '../utils/adapterLoader';
import { subMonths } from 'date-fns/subMonths';

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

  res.json({ ...watch });
});

/**
 * GET /.../:id/history?range=3m|6m|1y|all
 * - Public route: only returns if watch.isPublic===true
 * - Private route: returns if watch.user===req.user._id
 */
export const getPriceHistory = asyncHandler(async (req: any, res: Response) => {
  const { range = '3m' } = req.query as { range?: string };
  const rangeMap: Record<string, number | null> = {
    '3m': 3,
    '6m': 6,
    '1y': 12,
    '2y': 24,
    all: null,
  };
  if (!Object.prototype.hasOwnProperty.call(rangeMap, range)) {
    return res.status(400).json({ message: 'Invalid range param' });
  }

  // 1) make sure the watch exists & you’re allowed to see it
  const watch = await Watch.findById(req.params.id).select(
    'user isPublic archived'
  );
  if (!watch || watch.archived) {
    return res.status(404).json({ message: 'Watch not found' });
  }
  // If it’s not public, require ownership
  if (!watch.isPublic) {
    // protect middleware ensures req.user exists here; in public route req.user is undefined
    if (!req.user || !watch.user.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this history' });
    }
  }

  // 2) build the price‐log query
  const months = rangeMap[range]!;
  const match: any = { watch: watch._id };
  if (months) {
    match.fetchedAt = { $gte: subMonths(new Date(), months) };
  }

  const logs = await PriceLog.find(match)
    .sort({ fetchedAt: 1 })
    .select('price fetchedAt -_id')
    .lean();

  // 3) shape for the chart
  const history = logs.map((l) => ({
    date: l.fetchedAt.toISOString(),
    price: l.price,
  }));

  res.json(history);
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

    res.json({ ...watch });
  }
);
