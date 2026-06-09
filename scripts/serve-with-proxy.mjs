/**
 * Servidor estático con proxy /api → backend FastAPI.
 * Necesario porque `serve` no reenvía peticiones API y devuelve 404.
 */
import { createServer, request as httpRequest } from 'http';
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

export function startStaticWithProxy({
  staticRoot,
  port = 4173,
  apiTarget = 'http://127.0.0.1:8000',
}) {
  const apiUrl = new URL(apiTarget);

  function proxy(req, res) {
    const headers = { ...req.headers, host: apiUrl.host };
    const proxyReq = httpRequest(
      {
        hostname: apiUrl.hostname,
        port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
        path: req.url,
        method: req.method,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        detail: 'Backend no disponible. Ejecuta: cd projects/automatizacion-datos/backend && python run.py',
      }));
    });
    req.pipe(proxyReq);
  }

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

    const spaFallback = urlPath.startsWith('/apps/automatizacion-datos')
      ? '/apps/automatizacion-datos/index.html'
      : urlPath.startsWith('/apps/inventory-api')
        ? '/apps/inventory-api/index.html'
        : urlPath.startsWith('/metrics-dashboard')
          ? '/metrics-dashboard/index.html'
          : '/index.html';

    for (const fallback of [spaFallback]) {
      try {
        const data = await readFile(join(staticRoot, fallback));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
        return;
      } catch {
        // try next
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }

  const server = createServer((req, res) => {
    const path = req.url?.split('?')[0] ?? '/';
    if (path.startsWith('/api') || path === '/health') {
      proxy(req, res);
      return;
    }
    serveStatic(req, res);
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? 'dist';
  const port = Number(process.argv[3] ?? 4173);
  await startStaticWithProxy({ staticRoot: root, port });
  console.log(`Servidor con proxy API en http://localhost:${port}`);
}
