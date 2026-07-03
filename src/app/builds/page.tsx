/** @format */

'use client';

import { PageIntro } from '@/src/components/site/PageIntro';
import { BuildsShowcase } from '@/src/features/featured-work/components/public/BuildsShowcase';
import { HomeFooter } from '@/src/components/home/HomeFooter';

export default function BuildsPage() {
  return (
    <>
      <PageIntro
        eyebrow="What I Build"
        title="Selected Work"
        description="Games, 3D pipelines, interfaces, and visual design — the full breadth of what I ship."
      />
      <BuildsShowcase />
      <HomeFooter />
    </>
  );
}
