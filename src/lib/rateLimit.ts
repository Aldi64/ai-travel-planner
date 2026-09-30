const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const existing = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);

  if (existing.length >= MAX_PER_WINDOW) {
    hits.set(userId, existing);
    return { allowed: false, remaining: 0 };
  }

  existing.push(now);
  hits.set(userId, existing);
  return { allowed: true, remaining: MAX_PER_WINDOW - existing.length };
}
