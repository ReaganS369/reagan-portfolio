/** @format */

'use client';

import { RefObject } from 'react';
import { useHeroData } from '../../hooks/useHeroData';
import { HeroNavigationRibbon } from './HeroNavigationRibbon';
import { HeroCVRibbon } from './HeroCVRibbon';
import { HeroContent } from './HeroContent';
import '../../styles/base.css';
import '../../styles/avatar.css';

interface HomeHeroProps {
  sectionRef?: RefObject<HTMLElement | null>;
}

export default function HomeHero({ sectionRef }: HomeHeroProps) {
  const { profile, roles, roleIndex, socialLinks } = useHeroData();

  if (!profile || roles.length === 0) {
    return <div className="home-hero-loading">Loading...</div>;
  }

  return (
    <section className="home-hero" ref={sectionRef}>
      <div className="hero-background" />

      <HeroNavigationRibbon />
      <HeroCVRibbon />

      <div className="hero-grid">
        <HeroContent
          roles={roles}
          roleIndex={roleIndex}
          socialLinks={socialLinks}
        />
        {/* Right grid column: empty on desktop (ScrollAvatar fixed overlay handles it),
            shows cropped casual head/shoulders on mobile (≤900px) */}
        <div className="hero-right">
          <div className="character-wrapper">
            <img src={profile.casual_avatar} className="character" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
