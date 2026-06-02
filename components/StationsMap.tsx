'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapsUrl } from '@/lib/maps';
import type { GeoStation } from '@/lib/stations';
import type { CommissionChair } from '@/lib/commission';
import type { Locale } from '@/lib/i18n/routing';

// Color pins by coordinate accuracy via lightweight CSS divIcons (no image
// assets, so they never depend on a CDN): green = verified, amber = approximate.
function makeDot(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}
const ICONS: Record<'verified' | 'approximate', L.DivIcon> = {
  verified: makeDot('#2e7d32'),
  approximate: makeDot('#e0a800'),
};

type MapStation = GeoStation & { chair: CommissionChair | null };

export default function StationsMap({
  stations,
  locale,
  directionsLabel,
  chairLabel,
}: {
  stations: MapStation[];
  locale: Locale;
  directionsLabel: string;
  chairLabel: string;
}) {
  return (
    <MapContainer
      center={[40.2, 44.9]}
      zoom={8}
      scrollWheelZoom={false}
      className="h-[70vh] w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={ICONS[s.coordAccuracy]}>
          <Popup>
            <div className="text-sm">
              <a
                href={`/${locale}/s/${s.id}`}
                className="font-semibold underline"
              >
                {s.label}, №{s.stationNumber}
              </a>
              <div className="text-xs opacity-70">{s.cecCode}</div>
              {s.chair ? (
                <div className="mt-1 text-xs">
                  {chairLabel}: {s.chair.name} ({s.chair.party})
                </div>
              ) : null}
              <a
                href={mapsUrl(s.lat, s.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block underline"
              >
                📍 {directionsLabel}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
