'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

type Category = {
  id: string;
  label: string;
  description: string;
  ecArticle: string;
  severity: number;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        opts: Record<string, unknown>,
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

export function ReportForm({
  stationId,
  locale,
  categories,
}: {
  stationId: string;
  locale: 'am' | 'en' | 'ru';
  categories: Category[];
}) {
  const t = useTranslations('Report');
  const tCommon = useTranslations('Common');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const captchaConfigured = Boolean(siteKey);

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [token, setToken] = useState(captchaConfigured ? '' : 'dev-bypass');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tsRef = useRef<HTMLDivElement>(null);

  // Render Turnstile widget once the script is loaded
  useEffect(() => {
    if (!captchaConfigured) return;
    let widgetId: string | null = null;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (window.turnstile && tsRef.current && !widgetId) {
        widgetId = window.turnstile.render(tsRef.current, {
          sitekey: siteKey,
          callback: (tok: string) => setToken(tok),
          'error-callback': () => setToken(''),
          'expired-callback': () => setToken(''),
          theme: 'light',
        });
        clearInterval(interval);
      } else if (attempts > 100) {
        clearInterval(interval);
      }
    }, 100);
    return () => {
      clearInterval(interval);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, captchaConfigured]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!categoryId) {
      setError(t('errors.category_required'));
      return;
    }
    if (!token) {
      setError(t('errors.captcha_required'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stationId,
          categoryId,
          description,
          locale,
          turnstileToken: token,
          website,
        }),
      });
      if (!res.ok) {
        if (res.status === 429) setError(t('errors.rate_limited'));
        else if (res.status === 403) setError(t('errors.captcha_failed'));
        else if (res.status === 400) setError(t('errors.validation'));
        else setError(t('errors.generic'));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t('errors.network'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-orange/40 bg-orange/5 p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {t('successTitle')}
        </h2>
        <p className="mt-3 text-navy-700">{t('successBody')}</p>
        <Button
          as="a"
          href={`/${locale}/s/${stationId}`}
          variant="secondary"
          className="mt-6"
        >
          ← {tCommon('back')}
        </Button>
      </div>
    );
  }

  const selected = categories.find((c) => c.id === categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot — visually hidden, but reachable to bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 opacity-0"
      />

      <div>
        <label
          htmlFor="report-category"
          className="block text-xs font-semibold uppercase tracking-[0.18em] text-navy-700"
        >
          {t('category')}
        </label>
        <select
          id="report-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="focus-ring mt-2 w-full rounded-lg border-2 border-navy-900/15 bg-cream-50 px-4 py-3 text-navy-900 transition-colors focus:border-orange"
        >
          <option value="">— {t('selectCategory')} —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} · {c.ecArticle}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="mt-2 text-sm text-navy-700">{selected.description}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="report-description"
          className="block text-xs font-semibold uppercase tracking-[0.18em] text-navy-700"
        >
          {t('description')}
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={6}
          placeholder={t('descriptionPlaceholder')}
          className="focus-ring mt-2 w-full rounded-lg border-2 border-navy-900/15 bg-cream-50 px-4 py-3 text-navy-900 transition-colors focus:border-orange"
        />
        <p className="mt-1 text-right text-xs text-navy-700/70">
          {description.length} / 2000
        </p>
      </div>

      <p className="rounded-lg bg-orange/10 px-4 py-3 text-xs text-navy-900">
        {t('evidenceHint')}
      </p>

      {captchaConfigured ? (
        <div>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
          <div ref={tsRef} />
        </div>
      ) : (
        <p className="rounded-lg border border-navy-900/15 bg-cream-50 px-3 py-2 text-xs text-navy-700">
          Dev mode — Turnstile not configured, captcha is bypassed.
        </p>
      )}

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? tCommon('loading') : t('submit')}
      </Button>

      <p className="text-xs text-navy-700/70">{tCommon('unverifiedNotice')}</p>
    </form>
  );
}
