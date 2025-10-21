import '@/app/globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'LeadImmo - Intelligent Real Estate Lead Engine',
  description:
    'Landing page and AI-powered blog to capture real estate leads for Koh Samui with multi-locale support.',
  alternates: {
    canonical: 'https://www.leadimmo.example/en'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="bg-white text-slate-900">{children}</body>
    </html>
  );
}
