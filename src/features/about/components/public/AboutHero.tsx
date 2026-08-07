/** @format */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getStorageUrl } from '@/src/lib/storage';
import { PORTRAIT_STORAGE_PATH, RESUME_STORAGE_PATH } from '../../constants';
import '../../styles/about-hero.css';
import '../../../hero/styles/buttons.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  return (
    <section className="about-hero" ref={sectionRef}>
      <div className="about-hero__container">
        <motion.div
          className="about-hero__portrait-col"
          initial={{ opacity: 0, x: -32, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.div className="about-hero__portrait-frame" style={{ y: parallaxY }}>
            <motion.img
              src={getStorageUrl(PORTRAIT_STORAGE_PATH)}
              alt="Reagan Sagolsem"
              className="about-hero__portrait"
              loading="lazy"
              decoding="async"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="about-hero__portrait-glow" aria-hidden />
          </motion.div>
        </motion.div>

        <div className="about-hero__content-col">
          <motion.span
            className="about-hero__label"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            About Me
          </motion.span>

          <motion.h1
            className="about-hero__heading"
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
          >
            Architecting Immersive Experiences Through Technology and Art
          </motion.h1>

          <motion.p
            className="about-hero__description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            I am Reagan Sagolsem—a Game Developer, Technical Artist, and Creative
            Technologist. I bridge the gap between engineering and aesthetics, leveraging
            real-time technologies, 3D art, and design to build interactive worlds that feel alive.
          </motion.p>

          <motion.div
            className="hero-buttons about-hero__buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            <div className="btn-3d btn-3d--primary">
              <span className="btn-3d__base btn-3d__base--primary" aria-hidden="true" />
              <Link href="/builds" className="primary-btn">
                View My Builds <ArrowRight size={18} />
              </Link>
            </div>
            <div className="btn-3d btn-3d--secondary">
              <span className="btn-3d__base btn-3d__base--secondary" aria-hidden="true" />
              <a
                href={getStorageUrl(RESUME_STORAGE_PATH)}
                download
                className="secondary-btn"
              >
                Download CV
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
