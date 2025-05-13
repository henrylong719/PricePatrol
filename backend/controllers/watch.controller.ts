import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Watch } from '../models';

/**
 * Create a new price watch for a given user.
 *
 * @param {Request} req - Express request object, with body parameters:
 *   - url {string}: the product URL to monitor
 *   - adapter {string}: the ID of the adapter to use for extracting the price from the target site
 *   - targetPrice {number} (optional): notify once when the price falls below this threshold
 *   - continuousDrop {boolean} (optional): if true, send notifications on every subsequent price drop
 *   - intervalMinutes {number} (optional): polling interval in minutes (default: 1440 for daily checks)
 *
 * @param {Response} res - Express response object, returns the created Watch document
 */

// @desc    Create a new price watch
// @route   POST /api/watches
// @access  Private
const createWatch = asyncHandler(async (req: any, res: Response) => {
  const {
    url,
    adapter,
    targetPrice,
    continuousDrop = false,
    intervalMinutes = 1440, // default to 1 day (1440 minutes)
  } = req.body;

  // schedule next run intervalMinutes later
  const nextRunAt = new Date(Date.now() + intervalMinutes * 60000);

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

  res.status(201).json(watch);
});

// @desc    Get all watches for current user
// @route   GET /api/watches
// @access  Private
const getWatches = asyncHandler(async (req: any, res: Response) => {
  const watches = await Watch.find({ user: req.user._id, archived: false });
  res.json(watches);
});

// @desc    Get single watch
// @route   GET /api/watches/:id
// @access  Private
const getWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }
  res.json(watch);
});

// @desc    Update a watch
// @route   PUT /api/watches/:id
// @access  Private
const updateWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }

  const {
    url,
    adapter,
    targetPrice,
    continuousDrop,
    intervalMinutes,
    active,
    archived,
  } = req.body;

  if (url !== undefined) watch.url = url;
  if (adapter !== undefined) watch.adapter = adapter;
  if (targetPrice !== undefined) watch.targetPrice = targetPrice;
  if (continuousDrop !== undefined) watch.continuousDrop = continuousDrop;
  if (intervalMinutes !== undefined) {
    watch.intervalMinutes = intervalMinutes;
    watch.nextRunAt = new Date(Date.now() + intervalMinutes * 60000);
  }
  if (active !== undefined) watch.active = active;
  if (archived !== undefined) watch.archived = archived;

  await watch.save();
  res.json(watch);
});

// @desc    Delete (archive) a watch
// @route   DELETE /api/watches/:id
// @access  Private
const deleteWatch = asyncHandler(async (req: any, res: Response) => {
  const watch = await Watch.findOne({ _id: req.params.id, user: req.user._id });
  if (!watch) {
    res.status(404);
    throw new Error('Watch not found');
  }

  watch.archived = true;
  await watch.save();
  res.status(204).end();
});

export { createWatch, getWatches, getWatch, updateWatch, deleteWatch };
