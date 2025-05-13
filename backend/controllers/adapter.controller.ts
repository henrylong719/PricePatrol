import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import { Adapter } from '../models';
import { IAdapter } from '../interfaces';

// @desc    Get all adapters (builtin + custom) for the user
// @route   GET /api/adapters
// @access  Private
const getAdapters = asyncHandler(async (req: any, res: Response) => {
  const adapters = await Adapter.find({
    $or: [{ type: 'builtin' }, { createdBy: req.user._id }],
  }).sort({ domain: 1 });
  res.json(adapters);
});

// @desc    Create a new custom adapter
// @route   POST /api/adapters
// @access  Private
const createAdapter = asyncHandler(async (req: any, res: Response) => {
  const { name, domain, selector, jsonEndpoint } = req.body;

  // prevent duplicates
  const exists = await Adapter.findOne({
    domain,
    selector,
    createdBy: req.user._id,
  });
  if (exists) {
    res.status(400);
    throw new Error('Adapter already exists for this domain and selector');
  }

  const adapter = await Adapter.create({
    name,
    domain,
    type: 'custom',
    selector,
    jsonEndpoint,
    createdBy: req.user._id,
  });

  res.status(201).json(adapter);
});

// @desc    Update custom adapter
// @route   PUT /api/adapters/:id
// @access  Private
const updateAdapter = asyncHandler(async (req: any, res: Response) => {
  const adapter = await Adapter.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!adapter) {
    res.status(404);
    throw new Error('Adapter not found');
  }

  ADAPTER_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      (adapter as any)[field] = req.body[field];
    }
  });

  await adapter.save();
  res.json(adapter);
});

// @desc    Delete (archive) custom adapter
// @route   DELETE /api/adapters/:id
// @access  Private
const deleteAdapter = asyncHandler(async (req: any, res: Response) => {
  const adapter = await Adapter.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!adapter) {
    res.status(404);
    throw new Error('Adapter not found');
  }

  // soft-delete or remove
  await adapter.deleteOne();
  res.status(204).end();
});

const ADAPTER_FIELDS: (keyof IAdapter)[] = ['name', 'selector', 'jsonEndpoint'];

export { getAdapters, createAdapter, updateAdapter, deleteAdapter };
