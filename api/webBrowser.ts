/**
 * Agentic Web Browsing & Live URL Extraction Engine
 * Provides safe, timeout-bounded live web retrieval and HTML parsing
 * for LLM grounding and automated research without external browser dependencies.
 */

export interface BrowsedPageResult {
  url: string;
  title: string;
  content: string;
  success: boolean;
  error?: string;
  fetchedAt: string;
}

/**
 * Extracts HTTP/HTTPS URLs from any text string.
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  // Clean trailing punctuation like period, comma, parentheses
  const cleaned = matches.map(u => u.replace(/[.,;:!?)\]]+$/, '')).filter(Boolean);
  return Array.from(new Set(cleaned));
}

/**
 * Strips HTML boilerplate and extracts clean readable text/markdown.
 */
export function cleanHtmlToText(html: string, maxChars = 4000): { title: string; text: string } {
  if (!html) return { title: '', text: '' };

  // 1. Extract title
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // 2. Remove non-content elements
  let processed = html
    .replace(/<!--[\s\S]*?-->/g, '') // comments
    .replace(/<script[\s\S]*?<\/script>/gi, '') // scripts
    .replace(/<style[\s\S]*?<\/style>/gi, '') // styles
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '') // noscript
    .replace(/<svg[\s\S]*?<\/svg>/gi, '') // svgs
    .replace(/<nav[\s\S]*?<\/nav>/gi, '') // navbars
    .replace(/<footer[\s\S]*?<\/footer>/gi, '') // footers
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ''); // iframes

  // 3. Format key structural tags to markdown-like spacing
  processed = processed
    .replace(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/gi, '\n\n## $1\n\n')
    .replace(/<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>/gi, '\n\n### $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n');

  // 4. Remove all remaining tags
  processed = processed.replace(/<[^>]+>/g, ' ');

  // 5. Decode common HTML entities
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

  // 6. Normalize whitespace and blank lines
  processed = processed
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  // Truncate to maximum characters safely
  if (processed.length > maxChars) {
    processed = processed.slice(0, maxChars) + '\n\n...[Content truncated for length]';
  }

  return { title, text: processed };
}

/**
 * Fetches and extracts content from a given URL with timeout and safety bounds.
 */
export async function fetchAndExtractPageContent(
  targetUrl: string,
  timeoutMs = 6000
): Promise<BrowsedPageResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const parsed = new URL(targetUrl);
    // Block private IP ranges (SSRF protection)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return {
        url: targetUrl,
        title: 'Forbidden',
        content: '',
        success: false,
        error: 'Security: Access to local/private network addresses is blocked.',
        fetchedAt
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (TrekConsultancyBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8,bn;q=0.7'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timer);

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
      title: title || parsed.hostname,
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
