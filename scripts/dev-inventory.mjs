import { spawn } from 'child_process';
import { resolve } from 'path';

const root = resolve('.');
const frontend = resolve(root, 'projects/inventory-api/frontend');

console.log('⏳ Inicia el backend en otra terminal:');
console.log('   cd projects/inventory-api && mvn spring-boot:run\n');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const vite = spawn(npm, ['run', 'dev'], {
  cwd: frontend,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

console.log('🚀 Frontend: http://localhost:5176');
console.log('   API proxy: /api → http://localhost:8080\n');

vite.on('exit', (code) => process.exit(code ?? 0));
