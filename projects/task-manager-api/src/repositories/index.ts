import { env } from '../config/env';
import { createMemoryRepositories } from './memoryRepositories';
import { createPostgresRepositories } from './postgresRepositories';
import type { Repositories } from './types';

export async function createRepositories(): Promise<Repositories> {
  if (env.databaseUrl) {
    console.log('💾 Usando PostgreSQL como almacenamiento');
    return createPostgresRepositories(env.databaseUrl);
  }
  console.log('⚠️  DATABASE_URL no definida: usando almacenamiento en memoria (solo desarrollo)');
  return createMemoryRepositories();
}

export type { Repositories } from './types';
