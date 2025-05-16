import { Request, Response } from 'express';
import slugify from 'slugify';
import { asyncHandler } from '../middlewares';
import { Adapter, PriceLog, Watch } from '../models';
import { fetchQueue } from '../config/redis';
import { DEFAULT_INTERVAL_MINUTES, MS_PER_MINUTE } from '../config';
import adapterLoader from '../utils/adapterLoader';

/**
 * POST /api/watches
 */
export const createWatch = asyncHandler(async (req: any, res: Response) => {
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

  // generate slug up front if you like, or rely on pre('validate') hook
  const slug = slugify(name || url, { lower: true, strict: true });

  let watch = await Watch.create({
    user: req.user._id,
    name,
    slug,
    url,
    adapter: adapterId,
    targetPrice,
    continuousDrop,
    intervalMinutes,
    isPublic,
  });

  const scraper = await adapterLoader(adapterId);
  const { imageUrl } = await scraper.extractData(url);
  watch.imageUrl = imageUrl;
  await watch.save();

  const jobId = String(watch._id);
  const delay = intervalMinutes * MS_PER_MINUTE;
  await fetchQueue.add('fetchPrice', { watchId: watch._id }, { delay, jobId });

  res.status(201).json(watch);
});

/**
 * GET /api/watches
 */
export const getWatches = asyncHandler(async (req: any, res: Response) => {
  const watches = await Watch.find({
    user: req.user._id,
    archived: false,
  }).select('-__v');
  res.json(watches);
});

/**
 * GET /api/watches/:slug
 */
export const getWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    slug: req.params.slug,
    user: req.user._id,
  }).lean();
  if (!watch) {
    return res.status(404).json({ message: 'Watch not found' });
  }

  // fetch latest price
  const latestLog = await PriceLog.findOne({ watch: watch._id })
    .sort({ fetchedAt: -1 })
    .select('price fetchedAt')
    .lean();

  res.json({
    ...watch,
    latestPrice: latestLog?.price ?? null,
    fetchedAt: latestLog?.fetchedAt ?? null,
  });
});

/**
 * PUT /api/watches/:slug
 */
export const updateWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    slug: req.params.slug,
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
      if (f === 'name') {
        watch.slug = slugify(req.body.name, { lower: true, strict: true });
      }
      if (f === 'intervalMinutes') {
        watch.nextRunAt = new Date(
          Date.now() + watch.intervalMinutes * MS_PER_MINUTE
        );
      }
    }
  });
  await watch.save();

  // reschedule job
  const jobId = String(watch._id);
  await fetchQueue.removeJobScheduler(jobId);
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
 * DELETE /api/watches/:slug
 */
export const deleteWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({
    slug: req.params.slug,
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

/**
 * GET /api/public-watches
 */
export const getPublicWatches = asyncHandler(async (_req, res: Response) => {
  const watches = await Watch.aggregate([
    { $match: { isPublic: true, active: true, archived: false } },
    {
      $lookup: {
        from: 'pricelogs',
        let: { watchId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$watch', '$$watchId'] } } },
          { $sort: { fetchedAt: -1 } },
          { $limit: 1 },
        ],
        as: 'latestLog',
      },
    },
    { $unwind: { path: '$latestLog', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        slug: 1,
        imageUrl: 1,
        url: 1,
        targetPrice: 1,
        latestPrice: '$latestLog.price',
        fetchedAt: '$latestLog.fetchedAt',
      },
    },
    { $sort: { fetchedAt: -1 } },
    { $limit: 50 },
  ]);

  res.json(watches);
});
