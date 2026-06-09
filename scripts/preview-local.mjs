import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { startBackend } from './start-backend.mjs';
import { startStaticWithProxy } from './serve-with-proxy.mjs';

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

console.log('📦 Compilando automatización de datos...');
const autoData = resolve(root, 'projects/automatizacion-datos/frontend');
if (!existsSync(resolve(autoData, 'node_modules'))) {
  execSync('npm install', { cwd: autoData, stdio: 'inherit' });
}
execSync('npm run build', {
  cwd: autoData,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: '/apps/automatizacion-datos/' },
});
const autoTarget = resolve(deploy, 'apps/automatizacion-datos');
rmSync(autoTarget, { recursive: true, force: true });
mkdirSync(autoTarget, { recursive: true });
cpSync(resolve(autoData, 'dist'), autoTarget, { recursive: true });

const backend = await startBackend();

console.log('\n✅ Build listo. Iniciando servidor con proxy API...\n');
console.log('   Portafolio:        http://localhost:4173/');
console.log('   Automatización:    http://localhost:4173/apps/automatizacion-datos/');
console.log('   Dashboard:         http://localhost:4173/metrics-dashboard/');
console.log('   API (proxy):       http://localhost:4173/api/');
console.log('   Descargar APK:     http://localhost:4173/downloads/app-debug.apk\n');

await startStaticWithProxy({ staticRoot: deploy, port: 4173 });

process.on('SIGINT', () => {
  backend.kill();
  process.exit(0);
});
