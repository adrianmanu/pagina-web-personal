import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { startStaticWithProxy } from './serve-with-proxy.mjs';

const root = resolve('.');
const deploy = resolve(root, 'dist');

function buildProject(label, dir, basePath, targetDir) {
  console.log(`📦 Compilando ${label}...`);
  const projectDir = resolve(root, dir);
  if (!existsSync(resolve(projectDir, 'node_modules'))) {
    execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
  }
  execSync('npm run build', {
    cwd: projectDir,
    stdio: 'inherit',
    env: { ...process.env, VITE_BASE_PATH: basePath },
  });
  const target = resolve(deploy, targetDir);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(resolve(projectDir, 'dist'), target, { recursive: true });
}

console.log('📦 Compilando portafolio...');
execSync('npm run build', { cwd: root, stdio: 'inherit', env: { ...process.env, VITE_BASE_PATH: '/' } });

buildProject('dashboard Metrix', 'projects/metrics-dashboard', '/metrics-dashboard/', 'metrics-dashboard');
buildProject('DataFlow (automatización)', 'projects/automatizacion-datos/frontend', '/apps/automatizacion-datos/', 'apps/automatizacion-datos');
buildProject('StockFlow (inventario)', 'projects/inventory-api/frontend', '/apps/inventory-api/', 'apps/inventory-api');
buildProject('TaskFlow (task manager)', 'projects/task-manager-api/frontend', '/apps/task-manager/', 'apps/task-manager');

console.log('\n✅ Build listo. Iniciando servidor local...\n');
console.log('   Portafolio:        http://localhost:4173/');
console.log('   DataFlow:          http://localhost:4173/apps/automatizacion-datos/');
console.log('   StockFlow:         http://localhost:4173/apps/inventory-api/');
console.log('   TaskFlow:          http://localhost:4173/apps/task-manager/');
console.log('   Metrix:            http://localhost:4173/metrics-dashboard/');
console.log('   Descargar APK:     http://localhost:4173/downloads/app-debug.apk\n');
console.log('   (Todas las demos funcionan sin backend: datos en el navegador)\n');

await startStaticWithProxy({ staticRoot: deploy, port: 4173 });
