import { Request, Response } from 'express';
import type { CreateTaskDto, UpdateTaskDto } from '../models/task';
import { TaskService } from '../services/taskService';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  getAll = (_req: Request, res: Response): void => {
    res.json({ success: true, data: this.taskService.findAll() });
  };

  getById = (req: Request, res: Response): void => {
    const task = this.taskService.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Tarea no encontrada' });
      return;
    }
    res.json({ success: true, data: task });
  };

  create = (req: Request, res: Response): void => {
    const dto = req.body as CreateTaskDto;
    if (!dto.title?.trim()) {
      res.status(400).json({ success: false, message: 'El título es obligatorio' });
      return;
    }
    const task = this.taskService.create(dto);
    res.status(201).json({ success: true, data: task });
  };

  update = (req: Request, res: Response): void => {
    const task = this.taskService.update(req.params.id, req.body as UpdateTaskDto);
    if (!task) {
      res.status(404).json({ success: false, message: 'Tarea no encontrada' });
      return;
    }
    res.json({ success: true, data: task });
  };

  remove = (req: Request, res: Response): void => {
    const deleted = this.taskService.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Tarea no encontrada' });
      return;
    }
    res.status(204).send();
  };
}
