import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EAM Manager | Electrical & Automation',
  description: 'Electrical and Automation Engineering Management System',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
