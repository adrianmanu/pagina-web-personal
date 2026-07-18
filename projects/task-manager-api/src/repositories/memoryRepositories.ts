import type { Task } from '../models/task';
import type { User } from '../models/user';
import type { Repositories, TaskRepository, UserRepository } from './types';

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
}

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [];

  async findAllByUser(userId: string): Promise<Task[]> {
    return this.tasks
      .filter((task) => task.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    return this.tasks.find((task) => task.id === id && task.userId === userId) ?? null;
  }

  async create(task: Task): Promise<Task> {
    this.tasks.push(task);
    return task;
  }

  async update(task: Task): Promise<Task> {
    const index = this.tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) this.tasks[index] = task;
    return task;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((task) => !(task.id === id && task.userId === userId));
    return this.tasks.length < before;
  }
}

export function createMemoryRepositories(): Repositories {
  return {
    users: new InMemoryUserRepository(),
    tasks: new InMemoryTaskRepository(),
  };
}
