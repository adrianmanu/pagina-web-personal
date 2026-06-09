import { spawn } from 'child_process';
import { request } from 'http';
import { resolve } from 'path';

const backendDir = resolve('projects/automatizacion-datos/backend');
const healthUrl = 'http://127.0.0.1:8000/health';

function waitForHealth(maxAttempts = 40) {
  return new Promise((resolveHealth, reject) => {
    let attempts = 0;
    const tick = () => {
      attempts += 1;
      const req = request(healthUrl, (res) => {
        if (res.statusCode === 200) resolveHealth();
        else if (attempts >= maxAttempts) reject(new Error('Backend no respondió'));
        else setTimeout(tick, 500);
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) reject(new Error('Backend no respondió'));
        else setTimeout(tick, 500);
      });
      req.end();
    };
    tick();
  });
}

export async function startBackend() {
  const py = process.platform === 'win32' ? 'python' : 'python3';
  const child = spawn(py, ['run.py'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('error', (err) => {
    console.error('No se pudo iniciar el backend:', err.message);
    process.exit(1);
  });

  console.log('⏳ Iniciando API FastAPI en http://localhost:8000 ...');
  await waitForHealth();
  console.log('✅ Backend listo\n');
  return child;
}

if (process.argv[1]?.endsWith('start-backend.mjs')) {
  const child = await startBackend();
  process.on('SIGINT', () => {
    child.kill();
    process.exit(0);
  });
}
