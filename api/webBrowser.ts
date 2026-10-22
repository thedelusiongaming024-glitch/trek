import dns from 'dns';
import net from 'net';

export interface BrowsedPageResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
  fetchedAt: string;
}

export function extractUrlsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  const cleaned = matches.map(u => u.replace(/[.,;:!?)\]]+$/, '')).filter(Boolean);
  return Array.from(new Set(cleaned));
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return true;
  const octets = parts.map(p => Number(p));
  if (octets.some(o => !Number.isInteger(o) || o < 0 || o > 255)) return true;

  const [a, b, c] = octets;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true;

  return false;
}

export function isPrivateOrReservedIp(rawIp: string): boolean {
  if (!rawIp) return true;
  const ip = rawIp.trim().replace(/^\[|\]$/g, '').toLowerCase();

  const version = net.isIP(ip);
  if (version === 4) {
    return isPrivateOrReservedIpv4(ip);
  }

  if (version === 6) {
    if (ip === '::' || ip === '::1' || ip === '0:0:0:0:0:0:0:1' || ip === '0:0:0:0:0:0:0:0') {
      return true;
    }
    if (
      ip.startsWith('fc') ||
      ip.startsWith('fd') ||
      ip.startsWith('fe8') ||
      ip.startsWith('fe9') ||
      ip.startsWith('fea') ||
      ip.startsWith('feb') ||
      ip.startsWith('ff')
    ) {
      return true;
    }
    if (ip.startsWith('::ffff:')) {
      const tail = ip.slice(7);
      if (net.isIP(tail) === 4) {
        return isPrivateOrReservedIpv4(tail);
      }
      const hexParts = tail.split(':');
      if (hexParts.length === 2) {
        const hi = parseInt(hexParts[0], 16);
        const lo = parseInt(hexParts[1], 16);
        if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
          const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
          return isPrivateOrReservedIpv4(ipv4);
        }
      }
      return true;
    }
    if (ip.startsWith('2001:db8:') || ip.startsWith('2001:0db8:')) {
      return true;
    }
    return false;
  }

  return true;
}

async function validateUrlForSsrf(targetUrl: string): Promise<{ ok: boolean; parsed?: URL; error?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { ok: false, error: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Security: Only HTTP and HTTPS protocols are allowed.' };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: 'Security: URLs with embedded credentials are not allowed.' };
  }

  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    return { ok: false, error: 'Security: Non-standard network ports are blocked.' };
  }

  const rawHost = parsed.hostname.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!rawHost) {
    return { ok: false, error: 'Invalid hostname.' };
  }

  if (
    rawHost === 'localhost' ||
    rawHost.endsWith('.localhost') ||
    rawHost.endsWith('.local') ||
    rawHost.endsWith('.internal') ||
    rawHost.endsWith('.arpa') ||
    rawHost === 'metadata.google.internal' ||
    rawHost === 'instance-data'
  ) {
    return { ok: false, error: 'Security: Access to local/internal hostnames is blocked.' };
  }

  const dotParts = rawHost.split('.');
  if (
    /^(0x[0-9a-f]+|\d+)$/i.test(rawHost) ||
    dotParts.every(p => /^(0x[0-9a-f]+|\d+)$/i.test(p))
  ) {
    if (dotParts.length !== 4 || dotParts.some(p => /^0\d+/.test(p) || /^0x/i.test(p))) {
      return { ok: false, error: 'Security: Non-canonical or encoded IP literals are blocked.' };
    }
    if (isPrivateOrReservedIp(rawHost)) {
      return { ok: false, error: 'Security: Access to private or reserved IP ranges is blocked.' };
    }
    return { ok: true, parsed };
  }

  if (net.isIP(rawHost) === 6) {
    if (isPrivateOrReservedIp(rawHost)) {
      return { ok: false, error: 'Security: Access to private or reserved IPv6 ranges is blocked.' };
    }
    return { ok: true, parsed };
  }

  try {
    const records = await dns.promises.lookup(rawHost, { all: true, verbatim: true });
    if (!records || records.length === 0) {
      return { ok: false, error: 'DNS resolution returned no records for hostname.' };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return {
          ok: false,
          error: 'Security: Hostname resolves to a private or reserved network address.'
        };
      }
    }
  } catch {
    return { ok: false, error: 'Unable to resolve hostname.' };
  }

  return { ok: true, parsed };
}

export function cleanHtmlToText(html: string, maxChars = 4000): { title: string; text: string } {
  if (!html) return { title: '', text: '' };

  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  let processed = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '');

  processed = processed
    .replace(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/gi, '\n\n## $1\n\n')
    .replace(/<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>/gi, '\n\n### $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  processed = processed.replace(/<[^>]+>/g, ' ');

  processed = processed
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');

  processed = processed
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  if (processed.length > maxChars) {
    processed = processed.slice(0, maxChars) + '\n\n...[Content truncated for length]';
  }

  return { title, text: processed };
}

export async function fetchAndExtractPageContent(
  targetUrl: string,
  timeoutMs = 6000
): Promise<BrowsedPageResult> {
  const fetchedAt = new Date().toISOString();
  const MAX_REDIRECTS = 3;

  try {
    let currentUrl = targetUrl;
    let response: Response | null = null;
    let finalParsedUrl: URL | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const check = await validateUrlForSsrf(currentUrl);
      if (!check.ok || !check.parsed) {
        return {
          url: targetUrl,
          title: 'Forbidden',
          content: '',
          success: false,
          error: check.error || 'Security: URL blocked by SSRF filter.',
          fetchedAt
        };
      }
      finalParsedUrl = check.parsed;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        response = await fetch(currentUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (TrekConsultancyBot/1.0)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8,bn;q=0.7'
          },
          signal: controller.signal,
          redirect: 'manual'
        });
      } finally {
        clearTimeout(timer);
      }

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            url: targetUrl,
            title: `HTTP ${response.status}`,
            content: '',
            success: false,
            error: 'Redirect response missing Location header.',
            fetchedAt
          };
        }
        if (hop === MAX_REDIRECTS) {
          return {
            url: targetUrl,
            title: 'Too Many Redirects',
            content: '',
            success: false,
            error: 'Maximum redirect limit exceeded.',
            fetchedAt
          };
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      break;
    }

    if (!response || !finalParsedUrl) {
      return {
        url: targetUrl,
        title: 'Fetch Failed',
        content: '',
        success: false,
        error: 'No response received.',
        fetchedAt
      };
    }

    if (!response.ok) {
      return {
        url: targetUrl,
        title: `HTTP ${response.status}`,
        content: '',
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        fetchedAt
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/json')) {
      return {
        url: targetUrl,
        title: 'Unsupported Media',
        content: `[Non-text content-type: ${contentType}]`,
        success: false,
        error: `Target content-type is ${contentType}, only web pages or text can be parsed.`,
        fetchedAt
      };
    }

    const rawBody = await response.text();
    const { title, text } = cleanHtmlToText(rawBody);

    return {
      url: targetUrl,
      title: title || finalParsedUrl.hostname,
      content: text,
      success: true,
      fetchedAt
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError' || String(err?.message || '').includes('timeout') || String(err?.message || '').includes('abort');
    return {
      url: targetUrl,
      title: 'Fetch Failed',
      content: '',
      success: false,
      error: isTimeout ? `Request timed out after ${timeoutMs / 1000} seconds.` : (err?.message || 'Network connection failed'),
      fetchedAt
    };
  }
}
