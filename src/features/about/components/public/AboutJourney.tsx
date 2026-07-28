/** @format */

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useMotionValueEvent } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { JOURNEY } from '../../constants';
import { JourneyScrub } from './JourneyScrub';
import { AutoJourneyButton } from './AutoJourneyButton';
import { JourneyProfile } from './JourneyProfile';
import '../../styles/about-journey.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * One cinematic berth per milestone. Each chapter is staged against a different
 * quadrant of the frame so it reads as its own title card rather than the same
 * row re-stamped six times — and so the type keeps clear of whatever the
 * footage is doing through the middle of the shot.
 *
 * Index-keyed, so it rides the existing activeIndex; the scroll/progress maths
 * that produces that index is untouched.
 */
const COMPOSITIONS = [
  'left-mid', // 2020 — The Spark
  'right-mid', // 2022 — Building the Foundation
  'bottom-left', // 2024 — Expanding Horizons
  'top-right', // 2025 — Into Immersive Worlds
  'center-left', // 2026 — Mastering the Stack
  'finale', // FUTURE — The Vision
] as const;

/** Drifting motes between the footage and the type — one of the depth layers.
 *  Hard-coded rather than random so server and client markup match exactly. */
const PARTICLES = [
  { left: 7, top: 24, size: 2.5, delay: 0, duration: 21 },
  { left: 15, top: 68, size: 1.8, delay: -6, duration: 26 },
  { left: 23, top: 41, size: 3.1, delay: -12, duration: 18 },
  { left: 31, top: 82, size: 2.0, delay: -3, duration: 24 },
  { left: 38, top: 17, size: 2.6, delay: -15, duration: 29 },
  { left: 46, top: 57, size: 1.6, delay: -9, duration: 20 },
  { left: 54, top: 31, size: 2.9, delay: -19, duration: 25 },
  { left: 62, top: 74, size: 2.1, delay: -2, duration: 22 },
  { left: 69, top: 12, size: 1.7, delay: -14, duration: 27 },
  { left: 76, top: 49, size: 3.0, delay: -7, duration: 19 },
  { left: 83, top: 86, size: 2.2, delay: -17, duration: 23 },
  { left: 89, top: 35, size: 1.9, delay: -11, duration: 28 },
  { left: 95, top: 63, size: 2.4, delay: -5, duration: 21 },
  { left: 11, top: 92, size: 1.5, delay: -21, duration: 30 },
  { left: 58, top: 6, size: 2.3, delay: -8, duration: 26 },
  { left: 42, top: 96, size: 1.8, delay: -13, duration: 24 },
];

/** A second, denser drift that only joins on the closing chapter. */
const FINALE_PARTICLES = [
  { left: 19, top: 34, size: 2.2, delay: -4, duration: 23 },
  { left: 28, top: 60, size: 1.6, delay: -10, duration: 27 },
  { left: 35, top: 45, size: 2.8, delay: -1, duration: 20 },
  { left: 49, top: 78, size: 1.9, delay: -16, duration: 25 },
  { left: 57, top: 22, size: 2.4, delay: -6, duration: 29 },
  { left: 65, top: 52, size: 1.7, delay: -12, duration: 22 },
  { left: 72, top: 88, size: 2.6, delay: -3, duration: 26 },
  { left: 80, top: 28, size: 2.0, delay: -18, duration: 24 },
  { left: 87, top: 66, size: 1.5, delay: -8, duration: 28 },
  { left: 44, top: 14, size: 2.3, delay: -14, duration: 21 },
];

const YEAR_ANIM = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: EASE,
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.35, ease: EASE, staggerChildren: 0.03, staggerDirection: -1 },
  },
};

/** Each line of the title card lifts in on its own beat. */
const LINE_ANIM = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: EASE } },
};

/** The closing chapter arrives slower and from further away. */
const FINALE_LINE_ANIM = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 1.15, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.4, ease: EASE } },
};

/** Opacity only — the ghost's scale is driven by CSS so the big→small hover
 *  morph isn't fighting an inline transform written by motion. */
const GHOST_ANIM = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.2, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: EASE } },
};

export function AboutJourney() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  const isInView = useInView(trackRef, { once: true, margin: '-60px' });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    // Nothing to show before the section pins, but there is deliberately NO
    // upper cutoff: once the last entry is reached it HOLDS to the end of the
    // runway. The footage running out must not blank the timeline while the
    // visitor is still inside the section.
    if (p <= 0.02) {
      setActiveIndex(-1);
      return;
    }
    const normalized = (p - 0.02) / 0.98;
    const index = Math.min(JOURNEY.length - 1, Math.max(0, Math.floor(normalized * JOURNEY.length)));
    setActiveIndex(index);
  });

  const isFinale = activeIndex === JOURNEY.length - 1;

  return (
    <div className="journey-scroll-track" ref={trackRef}>
      <section className="about-section" aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="sr-only">Career Journey & Professional Experience</h2>
        {/* Journey footage scrubbed by scroll — renders once the clip exists */}
        <JourneyScrub sectionRef={trackRef} videoRef={videoRef} />
        <AutoJourneyButton sectionRef={trackRef} videoRef={videoRef} />

        <div className="journey-particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="journey-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Extra air on the closing chapter only */}
        <div
          className={`journey-particles journey-particles--finale ${
            isFinale ? 'journey-particles--on' : ''
          }`}
          aria-hidden="true"
        >
          {FINALE_PARTICLES.map((p, i) => (
            <span
              key={i}
              className="journey-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* The closing chapter lifts the whole frame rather than just being
            another card — warm bloom fades up only on the final milestone. */}
        <div
          className={`journey-finale-glow ${isFinale ? 'journey-finale-glow--on' : ''}`}
          aria-hidden="true"
        />

        <div className="section-heading-wrapper">
          <div className="heading-container">
            <motion.div
              className="journey-heading"
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <SectionNumber number="02" title="The Journey" />
              <span className="journey-heading__rule" aria-hidden="true" />
            </motion.div>
          </div>
        </div>

        <div className="about-container">
          <div className="about-years">
            <AnimatePresence mode="wait">
              {activeIndex >= 0 && activeIndex < JOURNEY.length && (() => {
                const entry = JOURNEY[activeIndex];
                const composition = COMPOSITIONS[activeIndex % COMPOSITIONS.length];
                const finale = activeIndex === JOURNEY.length - 1;
                const lineAnim = finale ? FINALE_LINE_ANIM : LINE_ANIM;
                // Hover previews the profile; clicking pins it open, so touch
                // devices (which never hover) still get there.
                const open =
                  expandedYear === entry.id || hoveredYear === entry.id;

                /* NOTE: entry.accent is intentionally NOT bound to
                   --chapter-accent. The section runs on one colour; the
                   per-milestone accent stays in the data for the CMS, and
                   the CSS reads var(--chapter-accent, var(--primary)) so
                   wiring it back up later is a one-line change. */
                return (
                  <motion.div
                    key={entry.id}
                    className={`year-row year-row--${composition} ${
                      open ? 'year-row--open' : ''
                    }`}
                    variants={YEAR_ANIM}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {/* Environmental typography — the chapter marker, blurred
                        into the artwork rather than sitting on top of it */}
                    <motion.span
                      className="year-ghost"
                      aria-hidden="true"
                      variants={GHOST_ANIM}
                    >
                      {entry.year}
                    </motion.span>

                    {/* Title card: year → title → subtitle → description */}
                    <div
                      className={`year-item ${open ? 'year-item--open' : ''}`}
                      onMouseEnter={() => setHoveredYear(entry.id)}
                      onMouseLeave={() => setHoveredYear(null)}
                      onClick={() =>
                        setExpandedYear(expandedYear === entry.id ? null : entry.id)
                      }
                    >
                      <motion.h3 className="year-title" variants={lineAnim}>
                        {entry.title}
                      </motion.h3>

                      {/* The only affordance: a short rule that runs out under
                          the title on hover. Replaces the old "+" glyph. */}
                      <motion.span
                        className="year-rule"
                        aria-hidden="true"
                        variants={lineAnim}
                      />

                      {/* At rest the card is year + title. Everything else
                          arrives on hover. */}
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            className="year-profile"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                          >
                            <JourneyProfile milestone={entry} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
