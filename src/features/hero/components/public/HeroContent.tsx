/** @format */

'use client';

import { useRef } from 'react';
import VariableProximity from '@/src/components/effects/VariableProximity';
import type { HeroRole } from '../../types';
import type { SocialLink } from '@/src/features/social-links/api/social-links';
import { HeroButtons } from './HeroButtons';
import { HeroSocials } from './HeroSocials';
import { HeroMorphRoles } from './HeroMorphRoles';

const HERO_TITLE_ENTRANCE = {
  letterDuration: 0.5,
  staggerDelay: 0.08,
  wordGap: 0.2,
} as const;

interface HeroContentProps {
  roles: HeroRole[];
  socialLinks: SocialLink[];
}

export function HeroContent({ roles, socialLinks }: HeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="hero-left">
      <h1 ref={containerRef} className="hero-name">
        <VariableProximity
          label="REAGAN"
          className="hero-first-name"
          containerRef={containerRef}
          style={{
            display: 'block',
            lineHeight: 0.9375,
            letterSpacing: 0,
          }}
          entrance={HERO_TITLE_ENTRANCE}
        />

        <VariableProximity
          label="SAGOLSEM"
          className="hero-last-name"
          containerRef={containerRef}
          style={{
            display: 'block',
            lineHeight: 0.9375,
            letterSpacing: 0,
            marginTop: 0,
          }}
          entrance={HERO_TITLE_ENTRANCE}
        />
      </h1>

      <HeroMorphRoles roles={roles} />

      <p className="hero-description">
        Designing and building immersive worlds through games, XR and animation.
      </p>

      <HeroButtons />
      <HeroSocials socialLinks={socialLinks} />
    </div>
  );
}
