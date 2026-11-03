// Browser → /api/ai proxy call. Returns null when AI is not configured or
// unreachable, so callers fall back to the deterministic matching engine.
export async function callAI<T>(task: string, payload: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, ...payload }),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
