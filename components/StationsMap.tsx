'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapsUrl } from '@/lib/maps';
import type { GeoStation } from '@/lib/stations';

// Leaflet's default marker images don't resolve through bundlers; pin them to
// the CDN so markers render reliably.
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function StationsMap({
  stations,
  locale,
  directionsLabel,
}: {
  stations: GeoStation[];
  locale: string;
  directionsLabel: string;
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
              <div className="font-semibold">
                {s.label}, №{s.stationNumber}
              </div>
              <div className="text-xs opacity-70">{s.cecCode}</div>
              <div className="mt-1 flex gap-3">
                <a href={`/${locale}/s/${s.id}`} className="underline">
                  {s.cecCode}
                </a>
                <a
                  href={mapsUrl(s.lat, s.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  📍 {directionsLabel}
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
