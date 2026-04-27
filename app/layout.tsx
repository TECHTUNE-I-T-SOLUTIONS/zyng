import type { Metadata } from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Zyng',
  description: 'A campus-exclusive, semi-anonymous social platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zyng',
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export const viewport = {
  themeColor: '#ffb800',
};

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

import { Providers } from '@/components/providers';
import { MaintenanceBanner } from '@/components/maintenance-banner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          <MaintenanceBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
