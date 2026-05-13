import { createHash } from 'node:crypto';

/**
 * Stable per-(request-shape) hash used for dedup + rate-limiting.
 * Combines IP + user-agent + accept-language, salted, then truncated.
 * NOT a privacy-defeating identifier — same as IP-based logging effectively,
 * with a salt so the hash isn't reversible back to PII off-server.
 */
export function fingerprintFromRequest(req: Request): string {
  const ip = clientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  const al = req.headers.get('accept-language') ?? '';
  const salt = process.env.FINGERPRINT_SALT ?? 'ditaket-dev-salt';
  return createHash('sha256')
    .update(`${salt}|${ip}|${ua}|${al}`)
    .digest('hex')
    .slice(0, 32);
}

export function clientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}
