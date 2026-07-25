/** @format */

'use client';

import { AboutHero } from '@/src/features/about/components/public/AboutHero';
import { AboutStory } from '@/src/features/about/components/public/AboutStory';
import { AboutBento } from '@/src/features/about/components/public/AboutBento';
import { AboutQuote } from '@/src/features/about/components/public/AboutQuote';
import { OriginTimeline } from '@/src/features/about/components/public/OriginTimeline';
import { AboutBeyond } from '@/src/features/about/components/public/AboutBeyond';
import { AboutFocus } from '@/src/features/about/components/public/AboutFocus';
import { AboutClosing } from '@/src/features/about/components/public/AboutClosing';
import { HomeFooter } from '@/src/components/home/HomeFooter';

export default function OriginPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutBento />
      <AboutQuote />
      <OriginTimeline />
      <AboutBeyond />
      <AboutFocus />
      <AboutClosing />
      <HomeFooter />
    </>
  );
}
