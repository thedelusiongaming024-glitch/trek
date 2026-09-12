import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../src/server/db';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
if (!process.env.DATABASE_URL && fs.existsSync('env.txt')) {
  dotenv.config({ path: 'env.txt' });
}
if (!process.env.DATABASE_URL && fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'error' = 'error';
  let dbMessage = 'Database service unavailable';
  let responseTimeMs = 0;

  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    responseTimeMs = Date.now() - dbStart;
    dbStatus = 'connected';
    dbMessage = 'PostgreSQL connection operational';
  } catch (err: any) {
    dbMessage = err?.message || 'Database connection error';
  }

  const isHealthy = dbStatus === 'connected';
  const totalDurationMs = Date.now() - startTime;
  const isAiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'Ama Community API',
    runtime: 'Vercel Serverless Function',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: totalDurationMs,
    checks: {
      database: {
        status: dbStatus,
        responseTimeMs,
        message: dbMessage
      },
      aiApi: {
        status: isAiConfigured ? 'configured' : 'not_configured',
        provider: 'Google Gemini',
        model: 'gemini-3.8-flash'
      },
      cache: {
        status: 'ready',
        ragCacheActive: false
      }
    }
  });
}
