import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve('.');

function run(command, cwd = root) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function buildDemo(label, projectDir, basePath, targetDir, extraEnv = {}) {
  console.log(`\n📦 Compilando ${label}...`);
  const absoluteProjectDir = resolve(root, projectDir);

  if (existsSync(resolve(absoluteProjectDir, 'package-lock.json'))) {
    run('npm ci', absoluteProjectDir);
  } else {
    run('npm install', absoluteProjectDir);
  }

  execSync('npm run build', {
    cwd: absoluteProjectDir,
    stdio: 'inherit',
    env: { ...process.env, VITE_BASE_PATH: basePath, ...extraEnv },
  });

  const target = resolve(root, 'dist', targetDir);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(resolve(absoluteProjectDir, 'dist'), target, { recursive: true });
}

console.log('📦 Compilando portafolio (freelance)...');
run('npx tsc -b && npx vite build --mode freelance');

buildDemo('Metrix', 'projects/metrics-dashboard', '/metrics-dashboard/', 'metrics-dashboard');
buildDemo(
  'DataFlow',
  'projects/automatizacion-datos/frontend',
  '/apps/automatizacion-datos/',
  'apps/automatizacion-datos',
);
buildDemo(
  'StockFlow',
  'projects/inventory-api/frontend',
  '/apps/inventory-api/',
  'apps/inventory-api',
);
buildDemo(
  'StockFlow Live',
  'projects/inventory-api/frontend',
  '/apps/stockflow-live/',
  'apps/stockflow-live',
  {
    VITE_USE_LIVE_API: 'true',
    VITE_API_BASE_URL:
      process.env.STOCKFLOW_API_URL?.replace(/\/$/, '') ||
      'https://stockflow-apix.onrender.com',
  },
);
buildDemo(
  'TaskFlow',
  'projects/task-manager-api/frontend',
  '/apps/task-manager/',
  'apps/task-manager',
);
buildDemo(
  'TiendaNova',
  'projects/ecommerce-store',
  '/apps/ecommerce-store/',
  'apps/ecommerce-store',
);
buildDemo(
  'TiendaNova Básica',
  'projects/ecommerce-store-basic',
  '/apps/ecommerce-store-basic/',
  'apps/ecommerce-store-basic',
);
buildDemo(
  'Mi Restaurante Esencial',
  'projects/restaurant-web-basic',
  '/apps/restaurant-web-basic/',
  'apps/restaurant-web-basic',
);
buildDemo(
  'X Lo Alto Restaurante',
  'projects/restaurant-web',
  '/apps/restaurant-web/',
  'apps/restaurant-web',
);

console.log('\n📦 Preparando artefactos para Cloudflare...');
run('node scripts/prepare-freelance-dist.mjs');

console.log('\n✅ Build Cloudflare listo.\n');
