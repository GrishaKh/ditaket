import { mapsUrl } from '@/lib/maps';
import { Button } from '@/components/ui/Button';

type Props = {
  lat: number | null;
  lng: number | null;
  /** Localized link text, e.g. t('openInMaps'). */
  label: string;
  variant?: 'button' | 'inline';
};

/**
 * Renders an external "Open in Maps" link for a station. Returns null when the
 * station has no coordinates — this is the single guard that enforces the
 * "omit when no coords" rule across the detail page and list cards.
 */
export function MapLink({ lat, lng, label, variant = 'button' }: Props) {
  if (lat == null || lng == null) return null;
  const href = mapsUrl(lat, lng);

  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring inline-flex items-center gap-1 rounded text-sm font-medium text-navy-700 hover:text-orange"
      >
        <span aria-hidden="true">📍</span> {label}
      </a>
    );
  }

  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      size="sm"
    >
      <span aria-hidden="true" className="mr-1.5">📍</span>
      {label}
    </Button>
  );
}
