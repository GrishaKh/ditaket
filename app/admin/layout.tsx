import type { ReactNode } from "react";
import "../globals.css";
import { SearchShortcut } from "./SearchShortcut";

// Admin uses its own minimal shell — no locale prefix, no localization.
// Basic-auth gate lives in middleware.ts.
export const metadata = {
  title: "Ditaket · Moderation console",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-cream-50">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400..700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </head>
      <body className="font-sans">
        {children}
        <SearchShortcut />
      </body>
    </html>
  );
}
