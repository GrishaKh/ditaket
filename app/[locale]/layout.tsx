import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/lib/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Դիտակետ · Ditaket',
    template: '%s · Ditaket',
  },
  description:
    "Public civic-monitoring portal for Armenia's 2026 parliamentary elections. Anonymous violation reporting + polling-station info.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ditaket.vercel.app',
  ),
  openGraph: {
    type: 'website',
    siteName: 'Ditaket',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const htmlLang = locale === 'am' ? 'hy' : locale;

  return (
    <html lang={htmlLang} className="bg-cream">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400..700;1,400..700&family=Noto+Sans+Armenian:wght@400..700&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale as Locale} />
          <div className="flex-1">{children}</div>
          <Footer locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
