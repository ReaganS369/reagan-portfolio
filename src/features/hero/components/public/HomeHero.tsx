/** @format */

'use client';
import { getStorageUrl } from '@/src/lib/storage';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import VariableProximity from '@/src/components/effects/VariableProximity';
import { getHeroRoles } from '@/src/features/hero/api/heroRoles';

import './HomeHero.css';
interface HeroRole {
  id: string;
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
}

export default function HomeHero() {
  const [profile, setProfile] = useState<any>(null);

  const [roleIndex, setRoleIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [roles, setRoles] = useState<HeroRole[]>([]);
  useEffect(() => {
    if (roles.length === 0) return;

    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [roles]);
  useEffect(() => {
    loadRoles();
  }, []);
  async function loadRoles() {
    try {
      const data = await getHeroRoles();
      setRoles(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').single();

      setProfile(data);
    }

    loadProfile();
  }, []);
  if (!profile || roles.length === 0) {
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
            <img
              src={getStorageUrl(roles[roleIndex].icon_url)}
              alt={roles[roleIndex].title}
              className="hero-role-icon"
            />

            <span>{roles[roleIndex].title}</span>
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
