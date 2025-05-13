import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  createWatch,
  getWatches,
  getWatch,
  updateWatch,
  deleteWatch,
} from '../controllers/watch.controller';

const router = express.Router();
router.use(sanitizeInput);
router.use(protect);

router.route('/').post(createWatch).get(getWatches);

router.route('/:id').get(getWatch).put(updateWatch).delete(deleteWatch);

export default router;
