/**
 * Universal Image URL normalizer and cloud storage resolver.
 * Converts Google Drive, Dropbox, OneDrive, Imgur, and GitHub view links
 * into high-resolution, direct-embeddable image URLs that render seamlessly in <img> tags.
 */

// Regex patterns for various cloud drive and file sharing services
const GOOGLE_DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
  /drive\.google\.com\/uc\?(?:export=view&)?id=([a-zA-Z0-9_-]+)/i,
  /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/i,
  /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i
];

const DROPBOX_PATTERNS = [
  /www\.dropbox\.com\/s\/(.+)/i,
  /dropbox\.com\/s\/(.+)/i
];

const GITHUB_BLOB_PATTERN = /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+\.(?:png|jpe?g|webp|gif|svg|avif))/i;

/**
 * Extracts the Google Drive file ID from any format of Google Drive URL
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  for (const pattern of GOOGLE_DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Normalizes any image URL (especially Google Drive, Dropbox, etc.)
 * into a direct high-resolution image CDN link that works in <img> and background-image.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a data URL, blob URL, or relative asset path
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // 1. Google Drive: convert view/sharing link to direct high-res CDN URL
  const gdriveId = extractGoogleDriveId(trimmed);
  if (gdriveId) {
    // lh3.googleusercontent.com/d/ID is Google's direct image CDN, fast, CORS-friendly, and high-res
    return `https://lh3.googleusercontent.com/d/${gdriveId}`;
  }

  // 2. Dropbox: convert share link to direct download raw stream
  for (const pattern of DROPBOX_PATTERNS) {
    if (pattern.test(trimmed)) {
      if (trimmed.includes('?dl=0')) {
        return trimmed.replace('?dl=0', '?raw=1');
      }
      if (trimmed.includes('?dl=1')) {
        return trimmed.replace('?dl=1', '?raw=1');
      }
      return trimmed.includes('?') ? `${trimmed}&raw=1` : `${trimmed}?raw=1`;
    }
  }

  // 3. GitHub: convert github.com/.../blob/... to raw.githubusercontent.com
  const githubMatch = trimmed.match(GITHUB_BLOB_PATTERN);
  if (githubMatch) {
    const [, user, repo, branch, filePath] = githubMatch;
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
  }

  // 4. Imgur: ensure direct image link with extension
  if (/imgur\.com\/([a-zA-Z0-9]+)$/i.test(trimmed) && !trimmed.includes('/a/') && !trimmed.includes('/gallery/')) {
    return trimmed.replace('imgur.com/', 'i.imgur.com/') + '.jpg';
  }

  return trimmed;
}

/**
 * Returns alternative secondary fallback CDN URL for cloud links if primary fails to load.
 */
export function getAlternativeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const gdriveId = extractGoogleDriveId(url);
  if (gdriveId) {
    // If lh3 fails, fallback to Google Drive high-resolution thumbnail endpoint (1920px)
    return `https://drive.google.com/thumbnail?id=${gdriveId}&sz=w2560`;
  }
  return null;
}

/**
 * Default fallback image for hero section slides
 */
export const DEFAULT_HERO_FALLBACK = 'https://lh3.googleusercontent.com/d/1FEXdukvgPULuNc4uoTwcHF1EjuW3BG1f';

/**
 * Default fallback image for blog articles
 */
export const DEFAULT_BLOG_FALLBACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80';
