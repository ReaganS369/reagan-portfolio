/** @format */

'use client';

import { RefObject, useEffect } from 'react';
import { useHeroData } from '../../hooks/useHeroData';
import { useReportHomeReady } from '@/src/components/ui/loading/GlobalLoadingProvider';
import { HeroContent } from './HeroContent';
import { HeroVideoStage } from './HeroVideoStage';
import '../../styles/base.css';
import '../../styles/avatar.css';

interface HomeHeroProps {
  sectionRef?: RefObject<HTMLElement | null>;
  /** True while a cinematic avatar video is covering the hero. */
  onVideoActiveChange?: (active: boolean) => void;
}

export default function HomeHero({
  sectionRef,
  onVideoActiveChange,
}: HomeHeroProps) {
  const { profile, roles, socialLinks, isLoading } = useHeroData();
  const reportHomeReady = useReportHomeReady();

  useEffect(() => {
    if (!isLoading) reportHomeReady();
  }, [isLoading, reportHomeReady]);

  return (
    <section className="home-hero" ref={sectionRef}>
      <div className="hero-background" />

      <HeroVideoStage onActiveChange={onVideoActiveChange} />

      {/* The two nav ribbons that unfurl over this hero are mounted by
          SiteNav in the root layout — they are pinned on every route and find
          this section by class to know how far they have to travel. */}

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
