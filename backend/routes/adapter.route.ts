import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  getAdapters,
  createAdapter,
  updateAdapter,
  deleteAdapter,
} from '../controllers/adapter.controller';

const router = express.Router();
router.use(sanitizeInput);
router.use(protect);

router.route('/').get(getAdapters).post(createAdapter);

router.route('/:id').put(updateAdapter).delete(deleteAdapter);

export default router;
