/** @format */

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import HomeHero from '@/src/features/hero/components/public/HomeHero';
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

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [avatarProfile, setAvatarProfile] = useState<AvatarProfile | null>(null);

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
      <ScrollAvatar heroRef={heroRef} profile={avatarProfile} />

      <HomeHero sectionRef={heroRef} />
      <FeaturedWork />
      <AboutJourney />
      <BrainSkills />
      <Testimonials />
      <ContactCTA />
      <HomeFooter />
    </>
  );
}
