/** @format */

'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import VariableProximity from '../effects/VariableProximity';
import { FileText, Box, Gamepad2, Cpu } from 'lucide-react';

export default function Hero() {
  const [profile, setProfile] = useState<any>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const roles = [
    {
      icon: <Box size={22} />,
      text: '3D GENERALIST',
    },
    {
      icon: <Cpu size={22} />,
      text: 'TECHNICAL ARTIST',
    },
    {
      icon: <Gamepad2 size={22} />,
      text: 'GAME DESIGNER',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').single();

      setProfile(data);
    }

    loadProfile();
  }, []);

  if (!profile) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#050505',
          color: '#fff',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <section
      style={{
        height: '100vh',
        background: '#050505',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* ORANGE GLOW */}
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
            'radial-gradient(circle, rgba(223,138,56,0.22), transparent 70%)',
          filter: 'blur(120px)',
          zIndex: 0,
        }}
      />
      {/* CONTENT */}
      <div
        style={{
          width: '50%',
          paddingLeft: '7%',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* NAME */}
        <div ref={containerRef}>
          <VariableProximity
            label={`REAGAN\nSAGOLSEM`}
            className="hero-name"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 1000"
            containerRef={containerRef}
            radius={220}
            falloff="gaussian"
            style={{
              whiteSpace: 'pre-line',
              fontSize: 'clamp(5rem, 9vw, 9rem)',
              lineHeight: 0.85,
              letterSpacing: '-4px',
              maxWidth: '700px',
            }}
          />
        </div>

        {/* ROLE */}
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.75rem',
            color: '#DF8A38',
            minHeight: '40px',
          }}
        >
          {roles[roleIndex].icon}

          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            {roles[roleIndex].text}
          </span>
        </div>

        {/* CATEGORIES */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '1rem',
            color: '#8f8f8f',
            textTransform: 'uppercase',
            fontSize: '.9rem',
          }}
        >
          <span>Games</span>
          <span>•</span>
          <span>XR</span>
          <span>•</span>
          <span>Animation</span>
        </div>

        {/* DESCRIPTION */}
        <p
          style={{
            marginTop: '1.5rem',
            maxWidth: '620px',
            color: '#c5c5c5',
            lineHeight: 1.8,
            fontSize: '1.05rem',
          }}
        >
          Creating immersive experiences through game design, technical art and
          3D production — bridging creativity and technology.
        </p>

        {/* BUTTONS */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <button
            style={{
              background: '#DF8A38',
              color: '#000',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '999px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            EXPLORE PROJECTS
          </button>

          <button
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,.15)',
              padding: '16px 32px',
              borderRadius: '999px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            CHARACTER SHEET
          </button>
        </div>

        {/* SOCIALS */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <a href="https://github.com/ReaganS369">GitHub</a>

          <a href="#">LinkedIn</a>

          <a href="/resume.pdf">
            <FileText size={20} />
          </a>

          <a href="/resume.pdf" target="_blank">
            <FileText size={20} />
          </a>
        </div>

        {/* SOFTWARE */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '3rem',
            alignItems: 'center',
          }}
        >
          <img src="/icons/unity.svg" alt="Unity" height={24} />
          <img src="/icons/unreal.svg" alt="Unreal" height={24} />
          <img src="/icons/blender.svg" alt="Blender" height={24} />
          <img src="/icons/photoshop.svg" alt="Photoshop" height={24} />
          <img src="/icons/illustrator.svg" alt="Illustrator" height={24} />
        </div>

        {/* SCROLL */}
        <div
          style={{
            marginTop: '2rem',
            color: '#666',
            fontSize: '.75rem',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Scroll To Discover ↓
        </div>
      </div>
      {/* CHARACTER */}{' '}
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
        {' '}
        {/* CASUAL */}{' '}
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
        />{' '}
        {/* FORMAL */}{' '}
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
        />{' '}
      </div>
    </section>
  );
}
