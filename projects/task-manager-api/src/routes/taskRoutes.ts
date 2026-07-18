import { Router } from 'express';
import type { TaskController } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export function createTaskRoutes(controller: TaskController): Router {
  const router = Router();
  router.use(requireAuth);
  router.get('/', asyncHandler(controller.list));
  router.get('/stats', asyncHandler(controller.stats));
  router.post('/', asyncHandler(controller.create));
  router.put('/:id', asyncHandler(controller.update));
  router.patch('/:id/status', asyncHandler(controller.changeStatus));
  router.delete('/:id', asyncHandler(controller.remove));
  return router;
}
