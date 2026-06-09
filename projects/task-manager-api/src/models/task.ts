export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
}
