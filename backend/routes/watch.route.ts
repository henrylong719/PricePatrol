import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  createWatch,
  getWatches,
  getWatchBySlug,
  updateWatch,
  deleteWatch,
  getPublicWatches,
  getPublicWatchBySlug,
} from '../controllers';

const router = express.Router();
router.use(sanitizeInput);

// PUBLIC routes (no auth)
router.get('/public-watches', getPublicWatches);
router.get('/public-watches/:slug', getPublicWatchBySlug); // ← new

// everything below here requires a logged-in user
router.use(protect);

// watch CRUD (slug‐based)
router.post('/', createWatch);
router.get('/', getWatches);
router.get('/:slug', getWatchBySlug);
router.put('/:slug', updateWatch);
router.delete('/:slug', deleteWatch);

export default router;
