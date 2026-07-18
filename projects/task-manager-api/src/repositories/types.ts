import type { Task } from '../models/task';
import type { User } from '../models/user';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

export interface TaskRepository {
  findAllByUser(userId: string): Promise<Task[]>;
  findById(id: string, userId: string): Promise<Task | null>;
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string, userId: string): Promise<boolean>;
}

export interface Repositories {
  users: UserRepository;
  tasks: TaskRepository;
}
