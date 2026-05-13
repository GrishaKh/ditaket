import { clientIp } from './fingerprint';

const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Server-verify a Turnstile token. Returns true if valid (or in dev without
 * TURNSTILE_SECRET_KEY set, returns true with a warning so devs can iterate).
 */
export async function verifyTurnstile(
  token: string,
  req: Request,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[ditaket] TURNSTILE_SECRET_KEY not set — bypassing Turnstile in dev',
      );
      return true;
    }
    console.error('[ditaket] TURNSTILE_SECRET_KEY missing in production');
    return false;
  }
  if (!token) return false;

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  const ip = clientIp(req);
  if (ip && ip !== '0.0.0.0') form.set('remoteip', ip);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: form,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) {
      console.error('[ditaket] Turnstile verify HTTP', res.status);
      return false;
    }
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.warn('[ditaket] Turnstile rejected:', data['error-codes']);
    }
    return data.success === true;
  } catch (e) {
    console.error('[ditaket] Turnstile verify threw:', e);
    return false;
  }
}
