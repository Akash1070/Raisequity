export interface ScrapedMetadata {
  name: string;
  tagline: string;
  description: string;
  logo_url?: string;
  og_image?: string;
}

/**
 * Clean and format tagline to ensure <= 70 chars with no trailing period
 */
export function formatTagline(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.endsWith('.')) {
    cleaned = cleaned.slice(0, -1);
  }
  if (cleaned.length > 70) {
    cleaned = cleaned.substring(0, 67) + '...';
  }
  return cleaned;
}

/**
 * Scrapes metadata from a given website URL using CORS proxy / client fetch
 */
export async function scrapeWebsiteMetadata(url: string): Promise<ScrapedMetadata> {
  if (!url) {
    throw new Error('URL is required for autofill');
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    // Attempt direct or CORS proxy fetch
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`;
    const res = await fetch(proxyUrl);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch site metadata (${res.status})`);
    }

    const data = await res.json();
    const htmlText = data.contents || '';

    // Parse HTML string using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Extract Title / Name
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const pageTitle = doc.querySelector('title')?.textContent || '';
    const rawName = ogTitle || pageTitle.split(/[-|–]/)[0] || 'My Project';

    // Extract Description / Tagline
    const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const rawDesc = ogDesc || metaDesc || 'Building the future of decentralized tech.';

    // Format Tagline & Description
    const tagline = formatTagline(rawDesc.split('.')[0] || rawDesc);
    const description = rawDesc.substring(0, 600).trim();

    // Extract OG Image / Favicon
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const favicon = doc.querySelector('link[rel*="icon"]')?.getAttribute('href') || '';

    let logo_url = ogImage;
    if (favicon) {
      if (favicon.startsWith('http')) {
        logo_url = favicon;
      } else if (favicon.startsWith('/')) {
        const parsedUrl = new URL(formattedUrl);
        logo_url = `${parsedUrl.origin}${favicon}`;
      }
    }

    return {
      name: rawName.trim(),
      tagline: tagline || 'Building cutting-edge Web3 technology',
      description: description || 'Discover our platform and ecosystem.',
      logo_url: logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80',
      og_image: ogImage,
    };
  } catch (err) {
    console.warn('[MetadataScraper] Scrape fallback activated:', err);
    // Graceful fallback for non-CORS reachable sites
    const urlHost = new URL(formattedUrl.startsWith('http') ? formattedUrl : `https://${formattedUrl}`).hostname;
    const fallbackName = urlHost.replace(/^www\./, '').split('.')[0];
    const capitalized = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

    return {
      name: capitalized,
      tagline: formatTagline(`The official platform for ${capitalized}`),
      description: `Welcome to ${capitalized}. Discover features, ecosystem integrations, and community resources.`,
      logo_url: `https://www.google.com/s2/favicons?domain=${urlHost}&sz=256`,
    };
  }
}

/**
 * Verifies whether a website's HTML source contains a backlink to raisequity.com or raisequity
 */
export async function verifyBacklink(url: string): Promise<{ verified: boolean; reason?: string }> {
  if (!url) {
    return { verified: false, reason: 'Website URL is missing.' };
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`;
    const res = await fetch(proxyUrl);
    
    if (!res.ok) {
      return { 
        verified: false, 
        reason: `Could not reach ${formattedUrl} via verification crawler (HTTP ${res.status}). Ensure the website is live and publicly accessible, or click 'Self-Verify' if protected.` 
      };
    }

    const data = await res.json();
    const htmlText = (data.contents || '').toLowerCase();

    if (!htmlText || htmlText.length < 50) {
      return {
        verified: false,
        reason: "Received empty page content from your website. Please ensure the page is published publicly, or click 'Self-Verify' to confirm manual placement."
      };
    }

    // Check if html strictly contains link to raisequity.com or the badge
    const hasLink = 
      htmlText.includes('raisequity.com') || 
      htmlText.includes('featured.svg') || 
      htmlText.includes('featured-dark.svg') ||
      htmlText.includes('raisequity.com/badges');

    if (hasLink) {
      return { 
        verified: true, 
        reason: 'Raisequity badge detected in website HTML source!' 
      };
    } else {
      return { 
        verified: false, 
        reason: "We scanned your website's HTML source, but could not find a link to raisequity.com or the badge snippet. Please paste the HTML snippet into your footer or homepage, publish your changes, and scan again." 
      };
    }
  } catch (err: any) {
    console.warn('[BacklinkVerifier] Proxy check error:', err);
    return { 
      verified: false, 
      reason: "Could not scan your website's HTML (your site may be behind Cloudflare or blocking automated crawlers). Please click 'Self-Verify' if the badge is placed, or Upgrade to Premium to skip." 
    };
  }
}

