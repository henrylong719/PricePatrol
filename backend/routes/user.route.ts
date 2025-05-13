import express from 'express';
import { protect, sanitizeInput } from '../middlewares';
import {
  authUser,
  getUserProfile,
  logoutUser,
  registerUser,
} from '../controllers';

const router = express.Router();

router.use(sanitizeInput);

router.route('/').post(registerUser);
router.post('/auth', authUser);

router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);

export default router;
