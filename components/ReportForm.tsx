"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

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
  locale: "am" | "en" | "ru";
  categories: Category[];
}) {
  const t = useTranslations("Report");
  const tCommon = useTranslations("Common");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const captchaConfigured = Boolean(siteKey);

  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [token, setToken] = useState(captchaConfigured ? "" : "dev-bypass");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tsRef = useRef<HTMLDivElement>(null);

  type GeoState =
    | { kind: "idle" }
    | { kind: "capturing" }
    | { kind: "captured"; lat: number; lng: number; accuracy: number }
    | { kind: "error"; reason: "denied" | "unavailable" | "timeout" };
  // Start in 'capturing' so there's no flash of the manual button before the
  // mount-time auto-request fires below.
  const [geo, setGeo] = useState<GeoState>({ kind: "capturing" });

  function requestLocation() {
    // Runtime check — must not be evaluated at render time because navigator
    // is undefined during SSR, which would otherwise leak a stale `disabled`
    // attribute into the hydrated HTML.
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeo({ kind: "error", reason: "unavailable" });
      return;
    }
    setGeo({ kind: "capturing" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          kind: "captured",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        const reason =
          err.code === 1
            ? "denied"
            : err.code === 3
              ? "timeout"
              : "unavailable";
        setGeo({ kind: "error", reason });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  // Auto-ask on mount. The browser permission dialog is the user's opt-out;
  // if they deny, we land in the 'error' state with a Try-again button.
  // iOS Safari silently blocks no-gesture calls and we end up in error too —
  // Try-again is a real click handler, which satisfies iOS's gesture rule.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { requestLocation(); }, []);

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
          "error-callback": () => setToken(""),
          "expired-callback": () => setToken(""),
          theme: "light",
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
      setError(t("errors.category_required"));
      return;
    }
    if (!token) {
      setError(t("errors.captcha_required"));
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        stationId,
        categoryId,
        description,
        locale,
        turnstileToken: token,
        website,
      };
      if (geo.kind === "captured") {
        body.reporterLat = geo.lat;
        body.reporterLng = geo.lng;
        body.reporterAccuracyM = geo.accuracy;
      }
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 429) setError(t("errors.rate_limited"));
        else if (res.status === 403) setError(t("errors.captcha_failed"));
        else if (res.status === 400) setError(t("errors.validation"));
        else setError(t("errors.generic"));
        return;
      }
      setSuccess(true);
    } catch {
      setError(t("errors.network"));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-orange/40 bg-orange/5 p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900">
          {t("successTitle")}
        </h2>
        <p className="mt-3 text-navy-700">{t("successBody")}</p>
        <Button
          as="a"
          href={`/${locale}/s/${stationId}`}
          variant="secondary"
          className="mt-6"
        >
          ← {tCommon("back")}
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
          {t("category")}
        </label>
        <select
          id="report-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="focus-ring mt-2 w-full rounded-lg border-2 border-navy-900/15 bg-cream-50 px-4 py-3 text-navy-900 transition-colors focus:border-orange"
        >
          <option value="">— {t("selectCategory")} —</option>
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
          {t("description")}
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={6}
          placeholder={t("descriptionPlaceholder")}
          className="focus-ring mt-2 w-full rounded-lg border-2 border-navy-900/15 bg-cream-50 px-4 py-3 text-navy-900 transition-colors focus:border-orange"
        />
        <p className="mt-1 text-right text-xs text-navy-700/70">
          {description.length} / 2000
        </p>
      </div>

      <p className="rounded-lg bg-orange/10 px-4 py-3 text-xs text-navy-900">
        {t("evidenceHint")}
      </p>

      {/* Optional geolocation snapshot — captured once on user gesture */}
      <fieldset className="rounded-lg border-2 border-navy-900/15 bg-cream-50 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">
          {t("geo.title")}
        </legend>
        <p className="text-sm text-navy-700">{t("geo.body")}</p>

        {geo.kind === "idle" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={requestLocation}
            className="mt-3"
          >
            {t("geo.allowButton")}
          </Button>
        ) : null}

        {geo.kind === "capturing" ? (
          <p className="mt-3 text-sm text-navy-700">{t("geo.capturing")}</p>
        ) : null}

        {geo.kind === "captured" ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-orange/15 px-3 py-1 text-sm text-navy-900">
              {t("geo.capturedTemplate", {
                accuracy: Math.round(geo.accuracy),
              })}
            </span>
            <button
              type="button"
              onClick={() => setGeo({ kind: "idle" })}
              className="text-xs text-navy-700 underline hover:text-orange"
            >
              {t("geo.clear")}
            </button>
          </div>
        ) : null}

        {geo.kind === "error" ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-navy-700">{t(`geo.${geo.reason}`)}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={requestLocation}
            >
              {t("geo.tryAgain")}
            </Button>
          </div>
        ) : null}
      </fieldset>

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

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? tCommon("loading") : t("submit")}
      </Button>

      <p className="text-xs text-navy-700/70">{tCommon("unverifiedNotice")}</p>
    </form>
  );
}
