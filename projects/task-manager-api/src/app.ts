import cors from 'cors';
import express from 'express';
import taskRoutes from './routes/taskRoutes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'task-manager-api' });
  });

  app.use('/api/tasks', taskRoutes);

  return app;
}
