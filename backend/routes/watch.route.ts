import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  createWatch,
  getWatches,
  getWatchById,
  updateWatch,
  deleteWatch,
  getPublicWatches,
  getPublicWatchById,
} from '../controllers';
import { getPriceHistory } from '../controllers/watch.controller';

const router = express.Router();
router.use(sanitizeInput);

// PUBLIC routes (no auth)
router.get('/public-watches', getPublicWatches);
router.get('/public-watches/:id', getPublicWatchById);
router.get('/public-watches/:id/history', getPriceHistory);

// everything below here requires a logged-in user
router.use(protect);

router.post('/', createWatch);
router.get('/', getWatches);
router.get('/:id', getWatchById);
router.put('/:id', updateWatch);
router.delete('/:id', deleteWatch);
router.get('/:id/history', getPriceHistory);

export default router;
