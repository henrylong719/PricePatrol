import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  createWatch,
  getWatches,
  getWatch,
  updateWatch,
  deleteWatch,
  getPublicWatches,
} from '../controllers/watch.controller';

const router = express.Router();
router.use(sanitizeInput);
router.use(protect);

// public listing
router.get('/public-watches', getPublicWatches);

// watch CRUD (slug‐based)
router.post('/watches', protect, createWatch);
router.get('/watches', protect, getWatches);
router.get('/watches/:slug', protect, getWatch);
router.put('/watches/:slug', protect, updateWatch);
router.delete('/watches/:slug', protect, deleteWatch);

export default router;
