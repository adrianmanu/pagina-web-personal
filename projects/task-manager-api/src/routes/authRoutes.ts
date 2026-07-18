import { Router } from 'express';
import type { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/register', asyncHandler(controller.register));
  router.post('/login', asyncHandler(controller.login));
  router.get('/me', requireAuth, asyncHandler(controller.me));
  return router;
}
