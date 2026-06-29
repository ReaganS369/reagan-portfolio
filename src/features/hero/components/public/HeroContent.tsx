/** @format */

'use client';

import { useRef } from 'react';
import { getStorageUrl } from '@/src/lib/storage';
import VariableProximity from '@/src/components/effects/VariableProximity';
import type { HeroRole } from '../../types';
import type { SocialLink } from '@/src/features/social-links/api/social-links';
import { HeroButtons } from './HeroButtons';
import { HeroSocials } from './HeroSocials';

interface HeroContentProps {
  roles: HeroRole[];
  roleIndex: number;
  socialLinks: SocialLink[];
}

export function HeroContent({ roles, roleIndex, socialLinks }: HeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="hero-left">
      <div ref={containerRef}>
        <VariableProximity
          label={`REAGAN \nSAGOLSEM`}
          className="hero-name"
          fromFontVariationSettings="'wght' 400"
          toFontVariationSettings="'wght' 700"
          containerRef={containerRef}
          radius={120}
          falloff="gaussian"
          style={{
            whiteSpace: 'pre-line',
            lineHeight: 0.92,
            letterSpacing: '-6px',
          }}
        />
      </div>

      <div className="hero-role">
        <img
          src={getStorageUrl(roles[roleIndex].icon_url)}
          alt={roles[roleIndex].title}
          className="hero-role-icon"
        />
        <span>{roles[roleIndex].title}</span>
      </div>

      <p className="hero-description">
        Designing and building immersive worlds through games, XR and animation.
      </p>

      <HeroButtons />
      <HeroSocials socialLinks={socialLinks} />
    </div>
  );
}
