import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/server/app';

// Reuse the same Express app + DB pool across warm invocations of this
// serverless function instead of rebuilding it on every request.
let appPromise: ReturnType<typeof createApp> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!appPromise) {
      appPromise = createApp();
    }
    const app = await appPromise;

    // Normalize req.url: if Vercel strips the /api prefix, ensure /api is prepended
    // so Express matches the defined /api/* routes reliably
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    // Wrap Express in a Promise that waits until the response has finished streaming
    // to prevent Vercel from prematurely terminating the serverless lambda before the response is sent.
    return await new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      res.on('error', (err) => reject(err));

      (app as any)(req, res, (err?: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
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
