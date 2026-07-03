/** @format */

'use client';

import { PageIntro } from '@/src/components/site/PageIntro';
import { StatsBreakdown } from '@/src/features/brain-skills/components/public/StatsBreakdown';
import { HomeFooter } from '@/src/components/home/HomeFooter';

export default function StatsPage() {
  return (
    <>
      <PageIntro
        eyebrow="What I'm Made Of"
        title="Skills & Tools"
        description="The design and engineering toolkit I reach for, grouped by discipline."
      />
      <StatsBreakdown />
      <HomeFooter />
    </>
  );
}
