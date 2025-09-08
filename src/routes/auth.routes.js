import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';

const router = Router();

router.use((req, res, next) => {
  const limiter = req.app.get('authLimiter');
  if (limiter) return limiter(req, res, next);
  next();
});

router.post('/login', loginController);

export default router;
