import express from 'express';
import { fetchQueue } from '../config/redis';
const router = express.Router();

router.post('/trigger/:id', async (req, res) => {
  const watchId = req.params.id;
  await fetchQueue.add('fetchPrice', { watchId });
  res.json({ triggered: watchId });
});

export default router;
