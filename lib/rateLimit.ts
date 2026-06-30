const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now > record.expiresAt) {
    rateLimitStore.set(userId, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
