/**
 * Servidor estático local con fallback SPA por aplicación.
 * Todas las demos funcionan en el navegador (sin backend).
 */
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.apk': 'application/vnd.android.package-archive',
};

const SPA_ROOTS = [
  '/apps/automatizacion-datos',
  '/apps/inventory-api',
  '/apps/task-manager',
  '/metrics-dashboard',
];

export function startStaticWithProxy({ staticRoot, port = 4173 }) {
  async function serveStatic(req, res) {
    let urlPath = decodeURIComponent(new URL(req.url ?? '/', `http://localhost:${port}`).pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    const filePath = join(staticRoot, urlPath);

    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) {
        const ext = extname(filePath);
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
        res.end(data);
        return;
      }
    } catch {
      // SPA fallback
    }

    const appRoot = SPA_ROOTS.find((root) => urlPath.startsWith(root));
    const spaFallback = appRoot ? `${appRoot}/index.html` : '/index.html';

    try {
      const data = await readFile(join(staticRoot, spaFallback));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
      return;
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }

  const server = createServer(serveStatic);

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? 'dist';
  const port = Number(process.argv[3] ?? 4173);
  await startStaticWithProxy({ staticRoot: root, port });
  console.log(`Servidor estático en http://localhost:${port}`);
}
