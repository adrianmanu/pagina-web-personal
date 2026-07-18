import cors from 'cors';
import express, { type Express } from 'express';
import { AuthController } from './controllers/authController';
import { TaskController } from './controllers/taskController';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import type { Repositories } from './repositories';
import { createAuthRoutes } from './routes/authRoutes';
import { createTaskRoutes } from './routes/taskRoutes';
import { AuthService } from './services/authService';
import { TaskService } from './services/taskService';

export function createApp(repositories: Repositories): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const authController = new AuthController(new AuthService(repositories.users));
  const taskController = new TaskController(new TaskService(repositories.tasks));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'task-manager-api' });
  });

  app.use('/api/auth', createAuthRoutes(authController));
  app.use('/api/tasks', createTaskRoutes(taskController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
