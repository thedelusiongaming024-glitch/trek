import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import fs from 'fs';
import { createApp } from '../src/server/app.ts';

dotenv.config();
if (!process.env.DATABASE_URL && fs.existsSync('env.txt')) {
  dotenv.config({ path: 'env.txt' });
}
if (!process.env.DATABASE_URL && fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

// Reuse the same Express app + DB pool across warm invocations of this
// serverless function instead of rebuilding it on every request.
let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;

    // Determine the requested route path in Vercel's serverless environment
    let targetUrl = req.url || '/api';

    // If Vercel rewrote /api/... to /api and stored the subpath in req.query.path
    if (req.query && req.query.path) {
      const subPath = Array.isArray(req.query.path)
        ? req.query.path.join('/')
        : String(req.query.path);

      try {
        const urlObj = new URL(targetUrl, 'http://localhost');
        urlObj.searchParams.delete('path');
        const search = urlObj.search;
        targetUrl = `/api/${subPath.replace(/^\/+/, '')}${search}`;
      } catch {
        targetUrl = `/api/${subPath.replace(/^\/+/, '')}`;
      }
    } else if (typeof req.headers['x-matched-path'] === 'string' && req.headers['x-matched-path'].startsWith('/api/')) {
      targetUrl = req.headers['x-matched-path'];
    }

    // Ensure /api prefix is present for Express route matching
    if (!targetUrl.startsWith('/api')) {
      targetUrl = '/api' + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
    }

    req.url = targetUrl;

    return await new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      res.on('error', (err) => reject(err));

      app(req, res);
    });
  } catch (err: any) {
    // Reset appPromise so subsequent invocations can recover if a transient error occurred
    appPromise = null;
    console.error('[Vercel Serverless Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err?.message || 'Failed to process request in serverless function'
      });
    }
  }
}
