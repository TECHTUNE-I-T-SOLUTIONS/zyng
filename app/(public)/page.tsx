import type { Metadata } from 'next';
import LandingPage from './HomePageClient';

export const metadata: Metadata = {
  title: 'Zyng | Connect on Campus. Scale for Life.',
  description: 'Zyng is a socio-professional campus platform for semi-anonymous feeds, personas, sentiment pulse, opportunities, and verified alumni networks.',
};

export default function Page() {
  return <LandingPage />;
}
