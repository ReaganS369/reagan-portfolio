/** @format */

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import HomeHero from '@/src/features/hero/components/public/HomeHero';
import { useMagneticSnap } from '@/src/features/hero/hooks/useMagneticSnap';
import {
  ScrollAvatar,
  type AvatarProfile,
} from '@/src/components/home/ScrollAvatar';
import { FeaturedWork } from '@/src/features/featured-work/components/public/FeaturedWork';
import { AboutJourney } from '@/src/features/about/components/public/AboutJourney';
import { BrainSkills } from '@/src/features/brain-skills/components/public/BrainSkills';
import { Testimonials } from '@/src/features/testimonials/components/public/Testimonials';
import { ContactCTA } from '@/src/features/contact/components/public/ContactCTA';
import { HomeFooter } from '@/src/components/home/HomeFooter';
import { FilmGrain } from '@/src/components/effects/FilmGrain';

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [avatarProfile, setAvatarProfile] = useState<AvatarProfile | null>(
    null,
  );
  // While a cinematic hero video plays, the static scroll-avatar yields.
  const [videoStageActive, setVideoStageActive] = useState(false);

  // Always start at the hero: stop the browser from restoring the previous
  // scroll position on reload — the scroll-driven avatar/section choreography
  // is designed to begin from the top.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Magnetic scroll: glide from Hero to the next section once the hero title
  // has left the viewport and the user's downward scroll comes to rest.
  useMagneticSnap(heroRef);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('casual_avatar, formal_avatar')
      .single()
      .then(({ data }) => {
        if (data) setAvatarProfile(data as AvatarProfile);
      });
  }, []);

  return (
    <>
      {/* Fixed avatar: 50/50 split in hero → formal-only in all sections below */}
      <ScrollAvatar
        heroRef={heroRef}
        profile={avatarProfile}
        suppressed={videoStageActive}
      />

      <HomeHero sectionRef={heroRef} onVideoActiveChange={setVideoStageActive} />
      <FeaturedWork />
      <AboutJourney />
      <BrainSkills />
      <Testimonials />
      <ContactCTA />
      <HomeFooter />

      {/* Cinematic treatment over everything */}
      <FilmGrain />
    </>
  );
}
