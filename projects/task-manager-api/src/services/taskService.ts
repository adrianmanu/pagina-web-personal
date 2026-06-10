import { randomUUID } from 'crypto';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskDto,
  type Task,
  type TaskFilters,
  type TaskStats,
  type TaskStatus,
  type UpdateTaskDto,
} from '../models/task';
import type { TaskRepository } from '../repositories/types';
import { ApiError } from '../middleware/errorHandler';

function parseDueDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Fecha límite inválida');
  return date.toISOString();
}

export class TaskService {
  constructor(private readonly tasks: TaskRepository) {}

  async list(userId: string, filters: TaskFilters): Promise<Task[]> {
    let result = await this.tasks.findAllByUser(userId);

    if (filters.status) result = result.filter((task) => task.status === filters.status);
    if (filters.priority) result = result.filter((task) => task.priority === filters.priority);
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
      );
    }
    return result;
  }

  async getStats(userId: string): Promise<TaskStats> {
    const all = await this.tasks.findAllByUser(userId);
    const now = Date.now();

    const byStatus = Object.fromEntries(
      TASK_STATUSES.map((status) => [status, all.filter((task) => task.status === status).length]),
    ) as Record<TaskStatus, number>;

    const overdue = all.filter(
      (task) => task.status !== 'completada' && task.dueDate && new Date(task.dueDate).getTime() < now,
    ).length;

    const completionRate = all.length
      ? Math.round((byStatus.completada / all.length) * 100)
      : 0;

    return { total: all.length, byStatus, overdue, completionRate };
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const title = dto.title?.trim() ?? '';
    if (title.length < 3) throw new ApiError(400, 'El título debe tener al menos 3 caracteres');
    this.validateEnums(dto.status, dto.priority);

    const now = new Date().toISOString();
    return this.tasks.create({
      id: randomUUID(),
      userId,
      title,
      description: dto.description?.trim() ?? '',
      status: dto.status ?? 'pendiente',
      priority: dto.priority ?? 'media',
      dueDate: parseDueDate(dto.dueDate),
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const current = await this.findOrFail(id, userId);
    this.validateEnums(dto.status, dto.priority);

    const title = dto.title !== undefined ? dto.title.trim() : current.title;
    if (title.length < 3) throw new ApiError(400, 'El título debe tener al menos 3 caracteres');

    return this.tasks.update({
      ...current,
      title,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      status: dto.status ?? current.status,
      priority: dto.priority ?? current.priority,
      dueDate: dto.dueDate !== undefined ? parseDueDate(dto.dueDate) : current.dueDate,
      updatedAt: new Date().toISOString(),
    });
  }

  async changeStatus(userId: string, id: string, status: TaskStatus): Promise<Task> {
    if (!TASK_STATUSES.includes(status)) throw new ApiError(400, 'Estado inválido');
    const current = await this.findOrFail(id, userId);
    return this.tasks.update({ ...current, status, updatedAt: new Date().toISOString() });
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.tasks.delete(id, userId);
    if (!deleted) throw new ApiError(404, 'Tarea no encontrada');
  }

  private async findOrFail(id: string, userId: string): Promise<Task> {
    const task = await this.tasks.findById(id, userId);
    if (!task) throw new ApiError(404, 'Tarea no encontrada');
    return task;
  }

  private validateEnums(status?: TaskStatus, priority?: TaskStatus | string): void {
    if (status && !TASK_STATUSES.includes(status)) throw new ApiError(400, 'Estado inválido');
    if (priority && !TASK_PRIORITIES.includes(priority as never)) {
      throw new ApiError(400, 'Prioridad inválida');
    }
  }
}
