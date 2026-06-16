/** @format */

'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import VariableProximity from '../effects/VariableProximity';

export default function Hero() {
  const [profile, setProfile] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').single();

      setProfile(data);
    }

    loadProfile();
  }, []);

  if (!profile)
    return (
      <div
        style={{
          height: '100vh',
          background: 'var(--dark)',
          color: 'var(--light)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Loading...
      </div>
    );

  return (
    <section
      style={{
        height: '100vh',
        background: 'var(--dark)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* GOLD GLOW */}
      <div
        style={{
          position: 'absolute',
          right: '-15%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(245,138,31,0.22), transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />

      {/* TEXT */}
      <div
        style={{
          width: '55%',
          paddingLeft: '8%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* NAME */}
        <div ref={containerRef}>
          <VariableProximity
            label="REAGAN SAGOLSEM"
            className="hero-name"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 1000"
            containerRef={containerRef}
            radius={220}
            falloff="gaussian"
            style={{
              fontSize: 'clamp(5rem, 9vw, 10rem)',
              lineHeight: 0.88,
              letterSpacing: '-2px',
              display: 'block',
              maxWidth: '900px',
            }}
          />
        </div>

        {/* ROLE */}
        <div
          style={{
            marginTop: '2rem',
          }}
        >
          <VariableProximity
            label={profile.hero_title}
            className="hero-role"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 900"
            containerRef={containerRef}
            radius={160}
            falloff="gaussian"
            style={{
              fontSize: '1.35rem',
              display: 'block',
            }}
          />
        </div>

        {/* VALUE PROPOSITION */}
        <div
          style={{
            marginTop: '1.25rem',
            maxWidth: '620px',
          }}
        >
          <VariableProximity
            label={
              profile.hero_subtitle ||
              'Designing and building interactive worlds through art and technology.'
            }
            className="hero-body"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 700"
            containerRef={containerRef}
            radius={120}
            falloff="gaussian"
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* CHARACTER */}
      <div
        style={{
          position: 'absolute',
          right: -300,
          bottom: -1800,
          width: '100%',
          height: '400%',
          zIndex: 3,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* CASUAL */}
        <img
          src={profile.casual_avatar}
          alt="Casual"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            clipPath: 'inset(0 50% 0 0)',
          }}
        />

        {/* FORMAL */}
        <img
          src={profile.formal_avatar}
          alt="Formal"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            clipPath: 'inset(0 0 0 50%)',
          }}
        />
      </div>
    </section>
  );
}
