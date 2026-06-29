/** @format */

'use client';

import HomeHero from '@/src/features/hero/components/public/HomeHero';
import { PageAvatar } from '@/src/components/home/PageAvatar';
import { FeaturedWork } from '@/src/features/featured-work/components/public/FeaturedWork';
import { AboutJourney } from '@/src/features/about/components/public/AboutJourney';
import { BrainSkills } from '@/src/features/brain-skills/components/public/BrainSkills';
import { Testimonials } from '@/src/features/testimonials/components/public/Testimonials';
import { ContactCTA } from '@/src/features/contact/components/public/ContactCTA';
import { HomeFooter } from '@/src/components/home/HomeFooter';

export default function Home() {
  return (
    <>
      {/* Single fixed avatar — fades in after hero exits, persists through Contact */}
      <PageAvatar />

      <HomeHero />
      <FeaturedWork />
      <AboutJourney />
      <BrainSkills />
      <Testimonials />
      <ContactCTA />
      <HomeFooter />
    </>
  );
}
