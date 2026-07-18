import { createApp } from './app';
import { env } from './config/env';
import { createRepositories } from './repositories';

async function main() {
  const repositories = await createRepositories();
  const app = createApp(repositories);

  app.listen(env.port, () => {
    console.log(`🚀 Task Manager API en http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exit(1);
});
