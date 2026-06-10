import type { Request, Response } from 'express';
import type { TaskFilters, TaskPriority, TaskStatus } from '../models/task';
import type { TaskService } from '../services/taskService';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const filters: TaskFilters = {
      status: req.query.status as TaskStatus | undefined,
      priority: req.query.priority as TaskPriority | undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
    };
    res.json(await this.taskService.list(req.userId!, filters));
  };

  stats = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.taskService.getStats(req.userId!));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const task = await this.taskService.create(req.userId!, req.body ?? {});
    res.status(201).json(task);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const task = await this.taskService.update(req.userId!, String(req.params.id), req.body ?? {});
    res.json(task);
  };

  changeStatus = async (req: Request, res: Response): Promise<void> => {
    const task = await this.taskService.changeStatus(req.userId!, String(req.params.id), req.body?.status);
    res.json(task);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.taskService.remove(req.userId!, String(req.params.id));
    res.status(204).send();
  };
}
