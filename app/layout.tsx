import type { Metadata } from 'next';
import './globals.css';
import { QualityTierBootstrap } from '@/components/QualityTierBootstrap';
import { LenisScrollProvider } from '@/components/scroll/LenisScrollProvider';

export const metadata: Metadata = {
  title: 'Crystal World',
  description: "Miftahul Islam's Crystal World portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Runs once on mount, writes the detected quality tier into
            useWorldStore before any island/canvas reads it. */}
        <QualityTierBootstrap />
        <LenisScrollProvider>{children}</LenisScrollProvider>
      </body>
    </html>
  );
}
