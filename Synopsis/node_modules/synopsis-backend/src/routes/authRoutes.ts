import { Router } from 'express';
import { login, logout, refresh, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { loginSchema } from '../utils/validation';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);

export default router;