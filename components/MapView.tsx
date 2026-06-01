'use client';

import dynamic from 'next/dynamic';
import type { GeoStation } from '@/lib/stations';

const StationsMap = dynamic(() => import('./StationsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl bg-navy-900/5 text-sm text-navy-700">
      …
    </div>
  ),
});

export function MapView(props: {
  stations: GeoStation[];
  locale: string;
  directionsLabel: string;
}) {
  return <StationsMap {...props} />;
}
