import { randomUUID } from 'crypto';
import type { CreateTaskDto, Task, UpdateTaskDto } from '../models/task';

export class TaskService {
  private tasks: Task[] = [
    {
      id: randomUUID(),
      title: 'Configurar pipeline CI/CD',
      description: 'Integrar GitHub Actions para despliegue automático',
      status: 'in_progress',
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      title: 'Documentar API REST',
      description: 'Agregar ejemplos de endpoints en README',
      status: 'pending',
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  findAll(): Task[] {
    return [...this.tasks].sort((a, b) => a.priority - b.priority);
  }

  findById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(dto: CreateTaskDto): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      status: dto.status ?? 'pending',
      priority: dto.priority ?? 3,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task | null {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    const current = this.tasks[index];
    const updated: Task = {
      ...current,
      ...dto,
      title: dto.title?.trim() ?? current.title,
      updatedAt: new Date().toISOString(),
    };
    this.tasks[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return this.tasks.length < initialLength;
  }
}
