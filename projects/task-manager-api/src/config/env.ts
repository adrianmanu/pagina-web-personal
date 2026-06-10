export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'task-manager-dev-secret-change-in-production',
  jwtExpiresInHours: 24,
  /** Si está definida, se usa PostgreSQL; si no, repositorios en memoria (desarrollo). */
  databaseUrl: process.env.DATABASE_URL,
};
