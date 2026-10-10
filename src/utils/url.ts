/**
 * Utility functions for link handling and URL normalization.
 */

export const normalizeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  // If protocol already exists, return trimmed
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // Otherwise default to https://
  return `https://${trimmed}`;
};

export const hasValidUrl = (url?: string): boolean => {
  if (!url) return false;
  const normalized = normalizeUrl(url);
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
