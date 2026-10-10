import dotenv from 'dotenv';
import fs from 'fs';
import net from 'net';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();
if (!process.env.DATABASE_URL && fs.existsSync('env.txt')) {
  dotenv.config({ path: 'env.txt' });
}

import http from 'http';
import { createApp } from './src/server/app';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function findAvailablePort(defaultPort: number): Promise<number> {
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }
  for (let port = defaultPort; port < defaultPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return defaultPort;
}

async function startServer() {
  const app = await createApp();
  const defaultPort = 3000;
  const PORT = await findAvailablePort(defaultPort);

  if (PORT !== defaultPort && !process.env.PORT) {
    console.warn(`[Server] Port ${defaultPort} is currently in use or reserved by another process (e.g. Docker/WSL).`);
    console.warn(`[Server] Automatically switching to port ${PORT} to prevent connection hang.`);
  }

  const httpServer = http.createServer(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 Trek Consultancy Forum server is running:`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://127.0.0.1:${PORT}/`);
    console.log(`  ➜  API:     http://localhost:${PORT}/api/health\n`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error during startup:', err);
  process.exit(1);
});
