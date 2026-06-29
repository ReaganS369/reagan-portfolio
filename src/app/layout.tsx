/** @format */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  posterama2001,
  chillax,
  cabinetGrotesk,
  posteramaTextBold,
  posteramaTextRegular,
} from '@/src/fonts';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Reagan Sagolsem',
  description: 'Portfolio of Reagan Sagolsem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        geistSans.variable,
        geistMono.variable,
        posterama2001.variable,
        chillax.variable,
        cabinetGrotesk.variable,
        posteramaTextBold.variable,
        posteramaTextRegular.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
