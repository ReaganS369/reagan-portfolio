/** @format */

'use client';

import { PageIntro } from '@/src/components/site/PageIntro';
import { OriginTimeline } from '@/src/features/about/components/public/OriginTimeline';
import { HomeFooter } from '@/src/components/home/HomeFooter';

export default function OriginPage() {
  return (
    <>
      <PageIntro
        eyebrow="Where It All Began"
        title="The Journey"
        description="From a first Unity tutorial to shipping full products — the years, the work, and what came out of them."
      />
      <OriginTimeline />
      <HomeFooter />
    </>
  );
}
