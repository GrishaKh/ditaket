import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('Common');
  return (
    <main className="container-main flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-orange">
        404
      </p>
      <h1 className="mt-4 font-display text-5xl font-bold text-navy-900 sm:text-6xl">
        Not found
      </h1>
      <p className="mt-6 max-w-prose text-navy-700">
        {t('back')} →{' '}
        <a href="/" className="text-navy-900 underline hover:text-orange">
          home
        </a>
      </p>
      <Button as="a" href="/" className="mt-8">
        {t('back')}
      </Button>
    </main>
  );
}
