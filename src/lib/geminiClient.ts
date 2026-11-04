// Browser → /api/ai proxy call. Returns null when AI is not configured or
// unreachable, so callers fall back to the deterministic matching engine.
// The server requires an authenticated Firebase session, so we attach the
// user's ID token on every call.
import { getAuth } from 'firebase/auth';

export async function callAI<T>(task: string, payload: Record<string, unknown>): Promise<T | null> {
  try {
    const auth = getAuth();
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ task, ...payload }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
