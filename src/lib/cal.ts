// ============================================================
// Calendar Scheduling Tool Utilities (Any Calendar / Booking Link)
// ============================================================

/**
 * Validates whether a provided calendar string is a valid scheduling link
 */
export function isValidCalendarLink(link: string): boolean {
  if (!link || typeof link !== 'string') return false;
  const trimmed = link.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.length > 3
  );
}

/**
 * Formats a calendar link into an embeddable iframe URL or clean external link
 */
export function formatCalendarEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Handle Cal.com links
  if (url.includes('cal.com')) {
    if (!url.includes('embed=true')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}embed=true&theme=light`;
    }
  }

  // Handle Calendly links
  if (url.includes('calendly.com')) {
    if (!url.includes('embed_type=')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}embed_type=Inline`;
    }
  }

  return url;
}
