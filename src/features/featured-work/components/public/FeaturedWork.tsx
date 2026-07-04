/** @format */

'use client';

import { useLayoutEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import '../../styles/featured-work.css';

const CARDS = [
  {
    key: 'game',
    category: 'GAME DEVELOPMENT',
    title: 'Where Stories Live',
    description:
      'Immersive game worlds built with Unity and Unreal Engine — from narrative design to polished mechanics.',
    cta: 'View Projects →',
    className: 'bento-card bento-card--game',
  },
  {
    key: '3d',
    category: '3D MODELING & RIGGING',
    title: 'Giving Shape to Ideas',
    description:
      'Character rigs, environment assets, and cinematic renders that bridge concept and reality.',
    cta: 'View Gallery →',
    className: 'bento-card bento-card--3d',
  },
  {
    key: 'ui',
    category: 'UI / APP DEVELOPMENT',
    title: 'Interfaces That Think',
    description:
      'Purposeful UI design paired with React and React Native — built fast, built right.',
    cta: 'Explore Work →',
    className: 'bento-card bento-card--ui',
  },
  {
    key: 'design',
    category: 'GRAPHIC DESIGN',
    title: 'Visual Language',
    description:
      'Brand identity, editorial layouts, and motion graphics crafted with intent and precision.',
    cta: 'See Designs →',
    className: 'bento-card bento-card--design',
  },
];

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export function FeaturedWork() {
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // The section paints a black cover ABOVE the fixed scroll-avatar with a
  // window cut out over the 3D card, so the character shows only inside the
  // card. Measure the card's layout rect (transform-agnostic offset chain)
  // relative to the section and expose it as CSS vars for the cover strips
  // and the behind-character hole background.
  useLayoutEffect(() => {
    const section = ref.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const measure = () => {
      let top = 0;
      let left = 0;
      let el: HTMLElement | null = card;
      while (el && el !== section) {
        top += el.offsetTop;
        left += el.offsetLeft;
        el = el.offsetParent as HTMLElement | null;
      }
      section.style.setProperty('--fw-hole-top', `${top}px`);
      section.style.setProperty('--fw-hole-left', `${left}px`);
      section.style.setProperty('--fw-hole-w', `${card.offsetWidth}px`);
      section.style.setProperty('--fw-hole-h', `${card.offsetHeight}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(card);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section className="featured-section" ref={ref}>
      {/* Layer B — sits BEHIND the fixed character, only in the card window:
          dark base + pink glow the character stands against */}
      <div className="featured-hole-bg" aria-hidden="true">
        <div className="featured-hole-glow" />
      </div>

      {/* Layer A — black cover ABOVE the character everywhere except the
          card window (4 strips framing the hole) */}
      <div className="featured-cover featured-cover--top" aria-hidden="true" />
      <div className="featured-cover featured-cover--left" aria-hidden="true" />
      <div className="featured-cover featured-cover--right" aria-hidden="true" />
      <div className="featured-cover featured-cover--bottom" aria-hidden="true" />

      <div className="featured-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="01" title="Where Ideas Become Reality" />
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          {/* Game — large top-left card */}
          <motion.div className={CARDS[0].className} variants={cardAnim}>
            <div className="bento-visual bento-visual--game">
              <div className="bento-carousel">
                <div className="bento-carousel__slot slot-a" />
                <div className="bento-carousel__slot slot-b" />
                <div className="bento-carousel__slot slot-c" />
              </div>
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[0].category}</span>
              <h3 className="bento-title">{CARDS[0].title}</h3>
              <p className="bento-desc">{CARDS[0].description}</p>
            </div>
            <div className="bento-cta-overlay">
              <span className="bento-cta">{CARDS[0].cta}</span>
            </div>
          </motion.div>

          {/* 3D Modeling — tall right card; transparent window: the fixed
              scroll avatar docks behind it and shows through, standing on the
              section's hole background (glow) while the black cover hides it
              everywhere else */}
          <motion.div
            ref={cardRef}
            className={CARDS[1].className}
            variants={cardAnim}
          >
            <div className="bento-visual bento-visual--3d">
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[1].category}</span>
              <h3 className="bento-title">{CARDS[1].title}</h3>
              <p className="bento-desc">{CARDS[1].description}</p>
            </div>
            <div className="bento-cta-overlay">
              <span className="bento-cta">{CARDS[1].cta}</span>
            </div>
          </motion.div>

          {/* UI / App */}
          <motion.div className={CARDS[2].className} variants={cardAnim}>
            <div className="bento-visual bento-visual--ui">
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[2].category}</span>
              <h3 className="bento-title">{CARDS[2].title}</h3>
              <p className="bento-desc">{CARDS[2].description}</p>
            </div>
            <div className="bento-cta-overlay">
              <span className="bento-cta">{CARDS[2].cta}</span>
            </div>
          </motion.div>

          {/* Graphic Design */}
          <motion.div className={CARDS[3].className} variants={cardAnim}>
            <div className="bento-visual bento-visual--design">
              <div className="bento-noise" />
            </div>
            <div className="bento-body">
              <span className="bento-category">{CARDS[3].category}</span>
              <h3 className="bento-title">{CARDS[3].title}</h3>
              <p className="bento-desc">{CARDS[3].description}</p>
            </div>
            <div className="bento-cta-overlay">
              <span className="bento-cta">{CARDS[3].cta}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
