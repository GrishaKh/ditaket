import type { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

const STATIC_PATHS = [
  '',
  '/info',
  '/info/violations',
  '/info/your-rights',
  '/info/how-to-vote',
  '/about',
  '/stats',
  '/status',
  '/marz',
  '/legal/privacy',
  '/legal/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ditaket.vercel.app';
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.6,
      });
    }
  }
  return entries;
}
