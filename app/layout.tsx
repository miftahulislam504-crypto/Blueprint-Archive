import type { Metadata } from 'next';
import './globals.css';
import { QualityTierBootstrap } from '@/components/QualityTierBootstrap';
import { SecretsBootstrap } from '@/components/SecretsBootstrap';
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
        {/* Runs once on mount, hydrates useSecretsStore from
            localStorage — see its own comment for why this can't just
            happen in the store's initializer. */}
        <SecretsBootstrap />
        <LenisScrollProvider>{children}</LenisScrollProvider>
      </body>
    </html>
  );
}
