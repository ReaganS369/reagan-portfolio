/** @format */

'use client';

import { RefObject, useEffect } from 'react';
import { useHeroData } from '../../hooks/useHeroData';
import { useReportHomeReady } from '@/src/components/ui/loading/GlobalLoadingProvider';
import { HeroNavigationRibbon } from './HeroNavigationRibbon';
import { HeroCVRibbon } from './HeroCVRibbon';
import { HeroContent } from './HeroContent';
import '../../styles/base.css';
import '../../styles/avatar.css';

interface HomeHeroProps {
  sectionRef?: RefObject<HTMLElement | null>;
}

export default function HomeHero({ sectionRef }: HomeHeroProps) {
  const { profile, roles, socialLinks, isLoading } = useHeroData();
  const reportHomeReady = useReportHomeReady();

  useEffect(() => {
    if (!isLoading) reportHomeReady();
  }, [isLoading, reportHomeReady]);

  return (
    <section className="home-hero" ref={sectionRef}>
      <div className="hero-background" />

      <HeroNavigationRibbon />
      <HeroCVRibbon />

      <div className="hero-grid">
        <HeroContent roles={roles} socialLinks={socialLinks} />
        <div className="hero-right">
          <div className="character-wrapper">
            {profile?.casual_avatar && (
              <img
                src={profile.casual_avatar}
                className="character"
                alt="Casual avatar"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
