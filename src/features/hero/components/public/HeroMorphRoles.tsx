/** @format */

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useId } from 'react';
import { getStorageUrl } from '@/src/lib/storage';
import type { HeroRole } from '../../types';

interface HeroMorphRolesProps {
  roles: HeroRole[];
  interval?: number;
}

export function HeroMorphRoles({
  roles,
  interval = 3000,
}: HeroMorphRolesProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `morph-hero-${uid}`;

  const totalDuration = (interval / 1000) * roles.length;
  const wordDuration = interval / 1000;

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -9"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="hero-role-container"
        style={{ filter: `url(#${filterId})` }}
      >
        {roles.map((role, i) => (
          <div
            key={role.id}
            className="hero-role"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              transformOrigin: 'left center',
              opacity: 0,
              animationName: 'morph-hero-role',
              animationDuration: `${totalDuration}s`,
              animationDelay: `${i * wordDuration}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
            }}
          >
            <img
              src={getStorageUrl(role.icon_url)}
              alt=""
              aria-hidden="true"
              className="hero-role-icon"
            />
            <span>{role.title}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes morph-hero-role {
          0%        { opacity: 0;   filter: blur(20px); transform: scale(0.8); }
          8%        { opacity: 0.5; filter: blur(10px); }
          15%, 30%  { opacity: 1;   filter: blur(0);    transform: scale(1);   }
          35%       { opacity: 0.5; filter: blur(10px); transform: scale(1);   }
          40%, 100% { opacity: 0;   filter: blur(20px); transform: scale(1);   }
        }
      `}</style>
    </>
  );
}
