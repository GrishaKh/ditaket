import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const hasRateLimit = Boolean(url && token);

let _byIp: Ratelimit | null = null;
let _byFp: Ratelimit | null = null;

function init() {
  if (_byIp && _byFp) return;
  if (!hasRateLimit) return;
  const redis = new Redis({ url: url!, token: token! });
  _byIp = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'ditaket:rl:ip',
    analytics: false,
  });
  _byFp = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '24 h'),
    prefix: 'ditaket:rl:fp',
    analytics: false,
  });
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reason?: 'ip' | 'fingerprint' | 'no-redis-in-prod';
};

export async function checkRateLimit(
  ip: string,
  fingerprint: string,
): Promise<RateLimitResult> {
  if (!hasRateLimit) {
    if (process.env.NODE_ENV !== 'production') {
      // Dev mode: allow everything (no Redis), but log
      return { success: true, limit: 999, remaining: 999 };
    }
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reason: 'no-redis-in-prod',
    };
  }
  init();
  const [ipR, fpR] = await Promise.all([_byIp!.limit(ip), _byFp!.limit(fingerprint)]);
  if (!ipR.success) {
    return { success: false, limit: ipR.limit, remaining: ipR.remaining, reason: 'ip' };
  }
  if (!fpR.success) {
    return { success: false, limit: fpR.limit, remaining: fpR.remaining, reason: 'fingerprint' };
  }
  return {
    success: true,
    limit: Math.min(ipR.limit, fpR.limit),
    remaining: Math.min(ipR.remaining, fpR.remaining),
  };
}
