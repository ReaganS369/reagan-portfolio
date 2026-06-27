/** @format */

'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import VariableProximity from '@/src/components/effects/VariableProximity';

export default function Projects() {
  const [profile, setProfile] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fontPresets = [
    {
      name: 'Inter',
      font: 'Inter, sans-serif',
    },
    {
      name: 'Satoshi',
      font: 'Satoshi, sans-serif',
    },
    {
      name: 'General Sans',
      font: '"General Sans", sans-serif',
    },
    {
      name: 'Clash Display',
      font: '"Clash Display", sans-serif',
    },
    {
      name: 'Chillax',
      font: 'Chillax, sans-serif',
    },
    {
      name: '"Neue Montreal"',
      font: '"Neue Montreal", sans-serif',
    },
    {
      name: 'Poppins',
      font: 'Poppins, sans-serif',
    },
    {
      name: 'Montserrat',
      font: 'Montserrat, sans-serif',
    },
  ];

  const [fontIndex, setFontIndex] = useState(0);

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
          background: '#000',
          color: '#fff',
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
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Glow */}
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
            'radial-gradient(circle, rgba(245,138,31,0.18), transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          width: '100%',
          paddingLeft: '8%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* FONT SWITCHER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '50px',
          }}
        >
          <button
            onClick={() =>
              setFontIndex(
                (prev) => (prev - 1 + fontPresets.length) % fontPresets.length,
              )
            }
            style={{
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              border: '1px solid #333',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            ←
          </button>

          <div
            style={{
              color: '#F58A1F',
              fontSize: '20px',
              fontWeight: 700,
              minWidth: '220px',
            }}
          >
            {fontPresets[fontIndex].name}
          </div>

          <button
            onClick={() =>
              setFontIndex((prev) => (prev + 1) % fontPresets.length)
            }
            style={{
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              border: '1px solid #333',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            →
          </button>
        </div>

        {/* NAME */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
          }}
        >
          <VariableProximity
            label={'REAGAN SAGOLSEM'}
            className={'variable-proximity-demo'}
            fromFontVariationSettings="'wght' 500, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={containerRef}
            radius={180}
            falloff="linear"
            style={{
              fontFamily: fontPresets[fontIndex].font,
              fontSize: 'clamp(5rem, 9vw, 10rem)',
              lineHeight: 0.9,
              color: '#F2EFE7',
              letterSpacing: '-4px',
              fontWeight: 900,
              display: 'block',
              maxWidth: '1400px',
            }}
          />
        </div>

        {/* TITLE */}
        <p
          style={{
            color: '#F58A1F',
            fontSize: '1.3rem',
            fontWeight: 600,
            marginTop: '2rem',
          }}
        >
          {profile.hero_title}
        </p>

        {/* SUBTITLE */}
        <p
          style={{
            color: '#9A9A9A',
            maxWidth: '650px',
            lineHeight: 1.8,
            fontSize: '1.05rem',
            marginTop: '1rem',
          }}
        >
          {profile.hero_subtitle}
        </p>
      </div>
    </section>
  );
}
