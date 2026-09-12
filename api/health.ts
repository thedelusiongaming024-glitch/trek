import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Ensure WebSocket constructor is configured for Node.js environments (Vercel serverless / Node < 22)
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'not_configured' | 'error' = 'not_configured';
  let dbMessage = 'DATABASE_URL is not configured';
  let responseTimeMs = 0;

  const rawConnectionString = process.env.DATABASE_URL?.trim();
  const connectionString = rawConnectionString ? rawConnectionString.replace(/^["']|["']$/g, '') : undefined;

  if (connectionString) {
    let pool: Pool | null = null;
    try {
      pool = new Pool({ connectionString });
      const dbStart = Date.now();
      // SELECT 1 only proves TCP/WebSocket connectivity — it says nothing
      // about whether the actual application schema exists or is queryable.
      // That gap is exactly what let this endpoint report "connected" while
      // /api/topics, /api/blogs, etc. were silently returning no data.
      // Check real tables the app depends on instead.
      const tableCheck = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM topics)::int AS topics,
          (SELECT COUNT(*) FROM users)::int AS users,
          (SELECT COUNT(*) FROM blogs)::int AS blogs,
          (SELECT COUNT(*) FROM settings)::int AS settings
      `);
      responseTimeMs = Date.now() - dbStart;
      dbStatus = 'connected';
      const counts = tableCheck.rows[0];
      dbMessage = `PostgreSQL connection operational (topics=${counts.topics}, users=${counts.users}, blogs=${counts.blogs}, settings=${counts.settings})`;
    } catch (err: any) {
      dbStatus = 'error';
      dbMessage = err?.message || 'Database connection error';
    } finally {
      if (pool) {
        try {
          await pool.end();
        } catch {
          // Ignore connection closing errors in serverless cleanup
        }
      }
    }
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
