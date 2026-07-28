/** @format */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  posterama2001,
  chillax,
  cabinetGrotesk,
  posteramaTextBold,
  posteramaTextRegular,
  posterama2001Regular,
  posterama2001UltraBlack,
} from '@/src/fonts';
import { GlobalLoadingProvider } from '@/src/components/ui/loading/GlobalLoadingProvider';
import { SiteNav } from '@/src/components/site/SiteNav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import { SEO_CONFIG, PERSON_SCHEMA, ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from '@/src/config/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.baseUrl),
  title: {
    default: SEO_CONFIG.title,
    template: `%s | ${SEO_CONFIG.author.name}`,
  },
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  authors: [SEO_CONFIG.author],
  creator: SEO_CONFIG.author.name,
  publisher: 'NNGTW Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.baseUrl,
    siteName: `${SEO_CONFIG.author.name} Portfolio`,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    creator: SEO_CONFIG.social.twitter,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: {
    canonical: SEO_CONFIG.baseUrl,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    PERSON_SCHEMA,
    ORGANIZATION_SCHEMA,
    WEBSITE_SCHEMA,
  ],
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
        posterama2001Regular.variable,
        posterama2001UltraBlack.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GlobalLoadingProvider>
          <SiteNav />
          {children}
        </GlobalLoadingProvider>
      </body>
    </html>
  );
}
