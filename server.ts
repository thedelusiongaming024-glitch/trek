import dotenv from 'dotenv';
import fs from 'fs';
import net from 'net';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Node 22+ undici / WebSocket ErrorEvent setter patch:
try {
  if (typeof WebSocket !== 'undefined') {
    const probe = new WebSocket('ws://127.0.0.1:1');
    probe.onerror = (e: any) => {
      const proto = Object.getPrototypeOf(e);
      if (proto && proto.constructor?.name === 'ErrorEvent') {
        const desc = Object.getOwnPropertyDescriptor(proto, 'message');
        if (desc && !desc.set) {
          const originalGet = desc.get;
          Object.defineProperty(proto, 'message', {
            get() {
              return this._custom_msg_override !== undefined ? this._custom_msg_override : originalGet?.call(this);
            },
            set(val) {
              this._custom_msg_override = val;
            },
            configurable: true,
            enumerable: true
          });
        }
      }
      try { probe.close(); } catch {}
    };
  }
} catch {}

dotenv.config();
if (!process.env.DATABASE_URL && fs.existsSync('env.txt')) {
  dotenv.config({ path: 'env.txt' });
}

// Trap unexpected unhandled library exceptions (e.g. Neon WebSocket ErrorEvent setter bug)
process.on('uncaughtException', (err: any) => {
  console.warn('[Server] Uncaught exception trapped:', err?.message || err);
});
process.on('unhandledRejection', (reason: any) => {
  console.warn('[Server] Unhandled rejection trapped:', reason?.message || reason);
});

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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer }
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
