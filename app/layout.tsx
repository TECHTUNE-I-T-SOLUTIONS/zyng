import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Zyng',
  description: 'A campus-exclusive, semi-anonymous social platform.',
};

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

import { Providers } from '@/components/providers';
import { MaintenanceBanner } from '@/components/maintenance-banner';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          <MaintenanceBanner />
          <div className="pt-10 sm:pt-12">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
