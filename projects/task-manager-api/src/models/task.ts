export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';
export type TaskPriority = 'alta' | 'media' | 'baja';

export const TASK_STATUSES: TaskStatus[] = ['pendiente', 'en_progreso', 'completada'];
export const TASK_PRIORITIES: TaskPriority[] = ['alta', 'media', 'baja'];

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
  completionRate: number;
}
