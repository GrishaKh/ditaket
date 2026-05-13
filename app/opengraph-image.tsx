import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Ditaket — civic monitoring for the 2026 RA parliamentary elections';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fbf8f3',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#1e3a64',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          ԴԻՏԱԿԵՏ · DITAKET
        </div>
        <div
          style={{
            marginTop: 'auto',
            fontSize: 110,
            fontWeight: 700,
            color: '#1e3a64',
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          Քո ձայնը
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            color: '#e8852a',
            lineHeight: 0.95,
            letterSpacing: -2,
          }}
        >
          կարևոր է
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: '#1e3a64',
            opacity: 0.7,
          }}
        >
          2026 թ. խորհրդարանական ընտրություններ · June 7, 2026
        </div>
      </div>
    ),
    { ...size },
  );
}
