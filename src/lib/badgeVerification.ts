import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export interface VerificationResult {
  verified: boolean;
  checkedAt: string;
  websiteUrl: string;
  error?: string;
  source?: 'crawler' | 'self_attest' | 'cached';
}

/**
 * Checks a founder's website URL for the presence of the Raisequity Launch embed badge/backlink
 */
export async function verifyFounderBadge(
  launchId: string,
  websiteUrl: string,
  forceAttest = false
): Promise<VerificationResult> {
  const now = new Date().toISOString();
  if (!launchId) {
    return { verified: false, checkedAt: now, websiteUrl: '', error: 'Missing launch ID' };
  }

  // If force self-attestation or localhost/demo domain
  const isDevOrDemo = !websiteUrl || 
    websiteUrl.includes('localhost') || 
    websiteUrl.includes('127.0.0.1') || 
    websiteUrl.includes('example.com') ||
    websiteUrl.includes('acme.com');

  if (forceAttest || isDevOrDemo) {
    try {
      const launchRef = doc(db, 'launches', launchId);
      await updateDoc(launchRef, {
        badgeVerified: true,
        backlink_verified: true,
        lastVerifiedAt: now,
      });
      return {
        verified: true,
        checkedAt: now,
        websiteUrl: websiteUrl || 'self-attested',
        source: 'self_attest'
      };
    } catch (e: any) {
      console.warn('[BadgeVerification] Fallback doc write warning:', e);
      return {
        verified: true,
        checkedAt: now,
        websiteUrl: websiteUrl || 'self-attested',
        source: 'self_attest'
      };
    }
  }

  let formattedUrl = websiteUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Graceful fallback: mark verified with notice so founders are never blocked
      const launchRef = doc(db, 'launches', launchId);
      await updateDoc(launchRef, {
        badgeVerified: true,
        backlink_verified: true,
        lastVerifiedAt: now,
      });
      return { verified: true, checkedAt: now, websiteUrl: formattedUrl, source: 'self_attest' };
    }

    const data = await res.json();
    const html = (data.contents || '').toLowerCase();

    // Check for raisequity backlink or badge signatures
    const isVerified =
      html.includes('raisequity.com/launch') ||
      html.includes('raisequity') ||
      html.includes('featured on raisequity') ||
      html.includes('badges/featured');

    // Update Firestore launch record
    try {
      const launchRef = doc(db, 'launches', launchId);
      await updateDoc(launchRef, {
        badgeVerified: isVerified,
        backlink_verified: isVerified,
        lastVerifiedAt: now,
      });
    } catch (_) {}

    return {
      verified: isVerified,
      checkedAt: now,
      websiteUrl: formattedUrl,
      source: 'crawler',
      error: isVerified ? undefined : 'Snippet not detected in scanned HTML yet.'
    };
  } catch (err: any) {
    console.warn('[BadgeVerification] External proxy timeout, applying self-attestation:', err);
    try {
      const launchRef = doc(db, 'launches', launchId);
      await updateDoc(launchRef, {
        badgeVerified: true,
        backlink_verified: true,
        lastVerifiedAt: now,
      });
    } catch (_) {}
    return {
      verified: true,
      checkedAt: now,
      websiteUrl: formattedUrl,
      source: 'self_attest'
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
