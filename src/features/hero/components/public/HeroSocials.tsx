/** @format */

'use client';

import { useState } from 'react';
import type { SocialLink } from '@/src/features/social-links/api/social-links';
import '../../styles/socials.css';

interface HeroSocialsProps {
  socialLinks: SocialLink[];
}

export function HeroSocials({ socialLinks }: HeroSocialsProps) {
  const [brokenIcons, setBrokenIcons] = useState<string[]>([]);

  function markBroken(id: string) {
    setBrokenIcons((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <div className="hero-socials">
      {socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="hero-social-link"
        >
          {brokenIcons.includes(link.id) ? (
            <div className="hero-social-placeholder" />
          ) : (
            <img
              className="hero-social-icon"
              src={link.icon}
              alt={link.platform}
              width={64}
              height={64}
              onError={() => markBroken(link.id)}
            />
          )}
        </a>
      ))}
    </div>
  );
}
