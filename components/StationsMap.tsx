'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapsUrl } from '@/lib/maps';
import type { GeoStation } from '@/lib/stations';
import type { CommissionChair } from '@/lib/commission';
import type { Locale } from '@/lib/i18n/routing';

// Leaflet's default marker images don't resolve through bundlers. Serve them
// from our own /public (vendored from the leaflet package) so markers never
// depend on a third-party CDN being reachable on election day.
const icon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
        <Marker key={s.id} position={[s.lat, s.lng]} icon={icon}>
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
