import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const root = resolve('.');

console.log('📦 Compilando portafolio...');
execSync('npm run build', { cwd: root, stdio: 'inherit', env: { ...process.env, VITE_BASE_PATH: '/' } });

console.log('📦 Compilando dashboard...');
const dashboard = resolve(root, 'projects/metrics-dashboard');
if (!existsSync(resolve(dashboard, 'node_modules'))) {
  execSync('npm install', { cwd: dashboard, stdio: 'inherit' });
}
execSync('npm run build', {
  cwd: dashboard,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: '/metrics-dashboard/' },
});

const deploy = resolve(root, 'dist');
const dashboardDist = resolve(dashboard, 'dist');
const target = resolve(deploy, 'metrics-dashboard');

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(dashboardDist, target, { recursive: true });

console.log('\n✅ Build listo. Iniciando servidor...\n');
console.log('   Portafolio:        http://localhost:4173/');
console.log('   Dashboard:         http://localhost:4173/metrics-dashboard/');
console.log('   Demo GUSVIVAN:     http://localhost:4173/demos/gusvivan-mobile/');
console.log('   Descargar APK:     http://localhost:4173/downloads/app-debug.apk\n');

execSync('npx --yes serve dist -l 4173', { cwd: root, stdio: 'inherit' });
