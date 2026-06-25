/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import VariableProximity from '../effects/VariableProximity';

import { Box, Cpu, Gamepad2 } from 'lucide-react';

import './HomeHero.css';

export default function HomeHero() {
  const [profile, setProfile] = useState<any>(null);

  const [roleIndex, setRoleIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const roles = [
    {
      icon: <Box size={24} />,
      text: '3D GENERALIST',
    },
    {
      icon: <Cpu size={24} />,
      text: 'TECHNICAL ARTIST',
    },
    {
      icon: <Gamepad2 size={24} />,
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
    return <div className="home-hero-loading">Loading...</div>;
  }

  return (
    <section className="home-hero">
      {/* Background */}
      <div className="hero-background" />

      {/* Top Story Ribbon */}
      <div className="story-ribbon">
        <div className="story-track">
          <span>What I Build</span>
          <span>Where It All Began</span>
          <span>What I'm Made Of</span>
          <span>Where Connections Begin</span>
        </div>
      </div>

      {/* CV Ribbon */}

      <div className="cv-ribbon">
        <span>View Curriculum Vitae: Experience Beyond the Portfolio</span>
      </div>

      {/* Main Hero */}

      <div className="hero-grid">
        {/* LEFT */}

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
                fontSize: 'clamp(6rem,9vw,10rem)',
                lineHeight: 0.84,
                letterSpacing: '-6px',
              }}
            />
          </div>

          <div className="hero-role">
            {roles[roleIndex].icon}

            <span>{roles[roleIndex].text}</span>
          </div>

          <p className="hero-description">
            Designing and building immersive worlds through games, XR and
            animation.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Explore Projects</button>

            <button className="secondary-btn">View Stats</button>
          </div>

          <div className="hero-socials">
            <a href="#">GitHub</a>

            <a href="#">LinkedIn</a>

            <a href="#">ArtStation</a>

            <a href="#">CV</a>
          </div>
        </div>

        {/* RIGHT */}

        <div className="hero-right">
          <div className="character-wrapper">
            <img
              src={profile.casual_avatar}
              className="character casual"
              alt=""
            />

            <img
              src={profile.formal_avatar}
              className="character formal"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="hero-footer">
        <div className="hero-footer-content">
          <div className="footer-item">
            <span className="footer-label">STATUS</span>
            <span className="footer-value">Available for Work</span>
          </div>

          <div className="footer-item">
            <span className="footer-label">LOCATION</span>
            <span className="footer-value">Manipur, India</span>
          </div>

          <div className="footer-item">
            <span className="footer-label">SPECIALITY</span>
            <span className="footer-value">Games · XR · Animation</span>
          </div>

          <div className="footer-item">
            <span className="footer-label">SCROLL</span>
            <span className="footer-value">↓ Discover More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
