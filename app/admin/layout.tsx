import type { ReactNode } from 'react';
import '../globals.css';

// Admin uses its own minimal shell — no locale prefix, no localization.
// Basic-auth gate lives in middleware.ts.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-cream">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400..700&display=swap"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
