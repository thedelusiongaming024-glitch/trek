import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: SessionUser | null;
    }
  }
}

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE_NAME = 'trek_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) return envSecret;
  // Deterministic fallback derived from DATABASE_URL + app salt so tokens survive restarts
  const seed = process.env.DATABASE_URL || 'trek-consultancy-default-session-seed-2026';
  return crypto.createHash('sha256').update(`trek-hmac-secret:${seed}`).digest('hex');
}

/**
 * Hashes a plaintext password using Node's built-in crypto.scryptSync with a 16-byte random salt.
 */
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

/**
 * Generates a cryptographically strong random password when no password is provided.
 */
export function generateRandomPassword(): string {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Constant-time string comparison helper.
 */
function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Compare against itself to keep timing constant before returning false
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a plaintext password against a stored scrypt hash (or legacy plaintext for seamless migration).
 */
export function verifyPassword(
  plain: string,
  storedHash?: string | null,
  legacyPlain?: string | null
): { valid: boolean; needsRehash: boolean } {
  if (!plain) return { valid: false, needsRehash: false };

  const candidate = storedHash || legacyPlain || '';
  if (!candidate) return { valid: false, needsRehash: false };

  if (candidate.startsWith('scrypt$')) {
    const parts = candidate.split('$');
    if (parts.length !== 3) return { valid: false, needsRehash: false };
    const [, salt, originalHashHex] = parts;
    try {
      const derivedBuf = crypto.scryptSync(plain, salt, SCRYPT_KEYLEN);
      const originalBuf = Buffer.from(originalHashHex, 'hex');
      if (derivedBuf.length !== originalBuf.length) return { valid: false, needsRehash: false };
      const valid = crypto.timingSafeEqual(derivedBuf, originalBuf);
      return { valid, needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // Legacy plaintext fallback: verify in constant time and flag for immediate upgrade to scrypt
  const valid = safeStringEqual(plain, candidate);
  return { valid, needsRehash: valid };
}

/**
 * Creates an HMAC-SHA256 signed session token.
 */
export function signSessionToken(user: { id: string; email: string; name: string; role: string }): string {
  const payload: SessionUser = {
    id: String(user.id || ''),
    email: String(user.email || '').toLowerCase().trim(),
    name: String(user.name || '').trim(),
    role: String(user.role || 'User').trim(),
    exp: Date.now() + SESSION_TTL_MS
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token and returns the decoded user payload.
 */
export function verifySessionToken(token?: string | null): SessionUser | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!safeStringEqual(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SessionUser;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Sets an HttpOnly session cookie on the response.
 */
export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`
  ];
  if (isProd) cookieParts.push('Secure');
  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

/**
 * Clears the HttpOnly session cookie.
 */
export function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

/**
 * Extracts a session token from Authorization header, x-auth-token header, or Cookie header.
 */
export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xToken = req.headers['x-auth-token'];
  if (typeof xToken === 'string' && xToken.trim()) {
    return xToken.trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const c of cookies) {
      const [k, ...vParts] = c.trim().split('=');
      if (k === SESSION_COOKIE_NAME && vParts.length > 0) {
        try {
          return decodeURIComponent(vParts.join('='));
        } catch {
          return vParts.join('=');
        }
      }
    }
  }
  return null;
}

export function isAdminRoleName(role?: string | null): boolean {
  if (!role) return false;
  const r = role.trim();
  return (
    r === 'Super Admin' ||
    r === 'Admin' ||
    r === 'Moderator' ||
    r === 'Support Staff' ||
    r === 'Trek Executive'
  );
}

/**
 * Middleware that attaches `req.authUser` if a valid signed session token is present.
 */
export function authenticateRequest(req: Request, _res: Response, next: NextFunction): void {
  const token = extractTokenFromRequest(req);
  req.authUser = token ? verifySessionToken(token) : null;
  next();
}

/**
 * Resolves the authenticated user for a request.
 * Checks the cryptographic session token first; if absent, verifies `x-user-id` + `x-user-email`
 * against the live PostgreSQL `users` table (never trusting client-supplied role strings).
 */
export async function resolveVerifiedUser(
  req: Request,
  pool: { query: (sql: string, params?: any[]) => Promise<{ rows: any[] }> }
): Promise<SessionUser | null> {
  if (req.authUser) return req.authUser;

  const headerEmail = String(req.headers['x-user-email'] || '').trim().toLowerCase();
  const headerId = String(req.headers['x-user-id'] || '').trim();

  if (headerEmail && headerId) {
    try {
      const uRes = await pool.query(
        'SELECT id, name, email, role, status FROM users WHERE id = $1 AND LOWER(email) = $2 LIMIT 1',
        [headerId, headerEmail]
      );
      if (uRes.rows.length > 0 && uRes.rows[0].status === 'active') {
        const u = uRes.rows[0];
        const verified: SessionUser = {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          exp: Date.now() + 60_000
        };
        req.authUser = verified;
        return verified;
      }
    } catch {}
  }

  return null;
}

/**
 * Middleware that restricts access to verified administrators only.
 */
export function createRequireAdminMiddleware(
  pool: { query: (sql: string, params?: any[]) => Promise<{ rows: any[] }> }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await resolveVerifiedUser(req, pool);
    if (!user || !isAdminRoleName(user.role)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Administrative authentication is required to access this endpoint.'
      });
    }
    next();
  };
}

/**
 * Helmet-equivalent HTTP Security Headers middleware.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

/**
 * Strict CORS middleware: allows same-origin requests and explicitly configured ALLOWED_ORIGINS.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (!origin) {
    return next();
  }

  const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
  const host = rawHost.split(',')[0].trim();
  const allowedList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  let isAllowed = false;
  try {
    const parsedOrigin = new URL(origin);
    if (
      parsedOrigin.host.toLowerCase() === host.toLowerCase() ||
      parsedOrigin.hostname.toLowerCase() === host.split(':')[0].toLowerCase()
    ) {
      isAllowed = true;
    } else if (
      (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1') &&
      (host.startsWith('localhost') || host.startsWith('127.0.0.1'))
    ) {
      isAllowed = true;
    } else if (allowedList.includes(origin.toLowerCase())) {
      isAllowed = true;
    }
  } catch {
    isAllowed = false;
  }

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Auth-Token, X-User-Id, X-User-Email'
    );
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.status(isAllowed ? 204 : 403).end();
    return;
  }

  if (!isAllowed && req.path.startsWith('/api')) {
    res.status(403).json({ error: 'CORS policy: Origin not allowed.' });
    return;
  }

  next();
}

/**
 * Sliding-window in-memory rate limiter factory.
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup of expired buckets
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets.entries()) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }, Math.max(options.windowMs, 60_000));
  // @ts-ignore
  cleanupTimer.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + options.windowMs };
      buckets.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, options.max - entry.count);
    res.setHeader('RateLimit-Limit', String(options.max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil((entry.resetAt - now) / 1000)));

    if (entry.count > options.max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || 'Rate limit exceeded. Please wait before trying again.'
      });
    }

    next();
  };
}
