/** @format */

'use client';

import { useHeroData } from '../../hooks/useHeroData';
import { HeroNavigationRibbon } from './HeroNavigationRibbon';
import { HeroCVRibbon } from './HeroCVRibbon';
import { HeroContent } from './HeroContent';
import { HeroAvatar } from './HeroAvatar';
import { HeroFooter } from './HeroFooter';
import '../../styles/base.css';

export default function HomeHero() {
  const { profile, roles, roleIndex, socialLinks } = useHeroData();

  if (!profile || roles.length === 0) {
    return <div className="home-hero-loading">Loading...</div>;
  }

  return (
    <section className="home-hero">
      <div className="hero-background" />

      <HeroNavigationRibbon />
      <HeroCVRibbon />

      <div className="hero-grid">
        <HeroContent
          roles={roles}
          roleIndex={roleIndex}
          socialLinks={socialLinks}
        />
        <HeroAvatar profile={profile} />
      </div>

      <HeroFooter />
    </section>
  );
}
