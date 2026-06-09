import { spawn } from 'child_process';
import { resolve } from 'path';
import { startBackend } from './start-backend.mjs';

const root = resolve('.');
const frontend = resolve(root, 'projects/automatizacion-datos/frontend');

await startBackend();

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const vite = spawn(npm, ['run', 'dev'], {
  cwd: frontend,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

console.log('\n🚀 Frontend: http://localhost:5175');
console.log('   API proxy: /api → http://localhost:8000\n');

vite.on('exit', (code) => process.exit(code ?? 0));
