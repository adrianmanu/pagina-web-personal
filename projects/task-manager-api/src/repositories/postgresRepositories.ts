import { Pool } from 'pg';
import type { Task, TaskPriority, TaskStatus } from '../models/task';
import type { User } from '../models/user';
import type { Repositories, TaskRepository, UserRepository } from './types';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tm_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tm_tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES tm_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tm_tasks_user ON tm_tasks(user_id);
`;

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name),
    passwordHash: String(row.password_hash),
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    description: String(row.description ?? ''),
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date ? new Date(row.due_date as string).toISOString() : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query('SELECT * FROM tm_users WHERE email = $1', [email]);
    return rows[0] ? rowToUser(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query('SELECT * FROM tm_users WHERE id = $1', [id]);
    return rows[0] ? rowToUser(rows[0]) : null;
  }

  async create(user: User): Promise<User> {
    await this.pool.query(
      'INSERT INTO tm_users (id, email, full_name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
      [user.id, user.email, user.fullName, user.passwordHash, user.createdAt],
    );
    return user;
  }
}

class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly pool: Pool) {}

  async findAllByUser(userId: string): Promise<Task[]> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tm_tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return rows.map(rowToTask);
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM tm_tasks WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    return rows[0] ? rowToTask(rows[0]) : null;
  }

  async create(task: Task): Promise<Task> {
    await this.pool.query(
      `INSERT INTO tm_tasks (id, user_id, title, description, status, priority, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        task.id,
        task.userId,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.dueDate,
        task.createdAt,
        task.updatedAt,
      ],
    );
    return task;
  }

  async update(task: Task): Promise<Task> {
    await this.pool.query(
      `UPDATE tm_tasks
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = $6
       WHERE id = $7 AND user_id = $8`,
      [task.title, task.description, task.status, task.priority, task.dueDate, task.updatedAt, task.id, task.userId],
    );
    return task;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM tm_tasks WHERE id = $1 AND user_id = $2', [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export async function createPostgresRepositories(databaseUrl: string): Promise<Repositories> {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? undefined : { rejectUnauthorized: false },
  });
  await pool.query(SCHEMA);
  return {
    users: new PostgresUserRepository(pool),
    tasks: new PostgresTaskRepository(pool),
  };
}
