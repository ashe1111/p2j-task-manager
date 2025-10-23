import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { DesktopNav } from '@/components/DesktopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'P2J - Lazy to Legend',
  description: 'From P Person to J Person: Let AI Help You Plan Your Time and Break Down Tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DesktopNav />
        <main className="md:ml-64 pb-16 md:pb-0">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
