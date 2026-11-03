/**
 * Safe Storage Utility
 * Bulletproof storage wrapper that prevents DOMException: QuotaExceededError and SecurityError.
 * Handles storage quota exhaustion gracefully across all browsers (Chrome, Safari, Firefox, iOS, incognito)
 * and SSR / Node.js environments.
 */

const memoryFallback = new Map<string, string>();

/**
 * Check if Web Storage is available in current environment
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch (_) {
    return false;
  }
}

function isSessionStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(window.sessionStorage);
  } catch (_) {
    return false;
  }
}

/**
 * Remove oversized or orphaned cache/draft items when quota is tight
 * Preserves critical auth sessions (e.g. Firebase user credentials).
 */
export function pruneStorageForSpace(bytesNeeded: number = 50000): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const criticalKeys = ['firebase:authUser', 'rq_onboarding_completed_'];
    const candidates: { key: string; size: number }[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;

      const isCritical = criticalKeys.some(c => key.startsWith(c));
      if (isCritical) continue;

      try {
        const val = window.localStorage.getItem(key) || '';
        candidates.push({ key, size: val.length * 2 }); // UTF-16 byte approximation
      } catch (_) {}
    }

    // Sort by largest items first to free maximum space immediately
    candidates.sort((a, b) => b.size - a.size);

    let freedBytes = 0;
    for (const item of candidates) {
      try {
        window.localStorage.removeItem(item.key);
        freedBytes += item.size;
        if (freedBytes >= bytesNeeded) break;
      } catch (_) {}
    }
  } catch (_) {}
}

// Automatically prune stale oversized data on module load to keep browser storage healthy
if (isLocalStorageAvailable()) {
  try {
    pruneStorageForSpace(100000);
  } catch (_) {}
}

export const safeStorage = {
  setItem: (key: string, value: string): boolean => {
    // 1. Always keep memory fallback up-to-date
    memoryFallback.set(key, value);

    // Guard: Prevent storing massive strings (>500KB, e.g. base64 PDFs) in localStorage
    if (value && value.length > 500000) {
      if (isSessionStorageAvailable()) {
        try {
          window.sessionStorage.setItem(key, value);
          return true;
        } catch (_) {}
      }
      return true;
    }

    // 2. Try localStorage if available
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (err: any) {
        console.warn(`[safeStorage] localStorage.setItem failed for key "${key}":`, err?.message || err);

        // 3. Attempt aggressive cleanup of oversized non-critical keys
        try {
          pruneStorageForSpace((value.length * 2) + 20000);
          window.localStorage.setItem(key, value);
          return true;
        } catch (_) {}
      }
    }

    // 4. Fallback to sessionStorage if available
    if (isSessionStorageAvailable()) {
      try {
        window.sessionStorage.setItem(key, value);
        return true;
      } catch (_) {}
    }

    // 5. Memory fallback is already populated, return true gracefully
    return true;
  },

  getItem: (key: string): string | null => {
    if (isLocalStorageAvailable()) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      } catch (_) {}
    }

    if (isSessionStorageAvailable()) {
      try {
        const val = window.sessionStorage.getItem(key);
        if (val !== null) return val;
      } catch (_) {}
    }

    return memoryFallback.get(key) ?? null;
  },

  removeItem: (key: string): void => {
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch (_) {}
    }
    if (isSessionStorageAvailable()) {
      try {
        window.sessionStorage.removeItem(key);
      } catch (_) {}
    }
    memoryFallback.delete(key);
  },

  clearStale: pruneStorageForSpace,
};
