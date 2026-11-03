import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export interface VerificationResult {
  verified: boolean;
  checkedAt: string;
  websiteUrl: string;
  error?: string;
}

/**
 * Checks a founder's website URL for the presence of the Raisequity Launch embed badge/backlink
 */
export async function verifyFounderBadge(
  launchId: string,
  websiteUrl: string
): Promise<VerificationResult> {
  const now = new Date().toISOString();
  if (!launchId || !websiteUrl) {
    return { verified: false, checkedAt: now, websiteUrl: '', error: 'Missing launch ID or website URL' };
  }

  let formattedUrl = websiteUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`;
    const res = await fetch(proxyUrl);

    if (!res.ok) {
      return { verified: false, checkedAt: now, websiteUrl: formattedUrl, error: `Website unreachable (${res.status})` };
    }

    const data = await res.json();
    const html = (data.contents || '').toLowerCase();

    // Check for raisequity backlink or badge signatures
    const isVerified =
      html.includes('raisequity.com/launch') ||
      html.includes('raisequity') ||
      html.includes('featured on raisequity');

    // Update Firestore launch record
    const launchRef = doc(db, 'launches', launchId);
    await updateDoc(launchRef, {
      badgeVerified: isVerified,
      lastVerifiedAt: now,
    });

    return {
      verified: isVerified,
      checkedAt: now,
      websiteUrl: formattedUrl,
    };
  } catch (err: any) {
    console.error('[BadgeVerification] Verification check failed:', err);
    return {
      verified: false,
      checkedAt: now,
      websiteUrl: formattedUrl,
      error: err.message || 'Network check failed',
    };
  }
}

/**
 * Manually toggle or set badge verification status (for dev / testing)
 */
export async function forceSetBadgeVerified(launchId: string, status: boolean): Promise<boolean> {
  try {
    const launchRef = doc(db, 'launches', launchId);
    await updateDoc(launchRef, {
      badgeVerified: status,
      lastVerifiedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[BadgeVerification] Error setting verification:', err);
    return false;
  }
}
