/** @format */

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useMotionValueEvent } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { JOURNEY } from '../../constants';
import { JourneyScrub } from './JourneyScrub';
import { AutoJourneyButton } from './AutoJourneyButton';
import '../../styles/about-journey.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Horizontal berth for each successive entry. One entry is on screen at a
 *  time, so cycling left → right → centre makes the timeline traverse the
 *  frame instead of stamping every year in the same spot. */
const POSITIONS = ['left', 'right', 'center'] as const;

const YEAR_ANIM = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: EASE },
  }
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

  return (
    <div className="journey-scroll-track" ref={trackRef}>
      <section className="about-section" aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="sr-only">Career Journey & Professional Experience</h2>
        {/* Journey footage scrubbed by scroll — renders once the clip exists */}
        <JourneyScrub sectionRef={trackRef} videoRef={videoRef} />
        <AutoJourneyButton sectionRef={trackRef} videoRef={videoRef} />

        {/* Full-width header to match FeaturedWork alignment */}
        <div className="section-heading-wrapper">
          <div className="heading-container">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <SectionNumber number="02" title="The Journey" />
            </motion.div>
          </div>
        </div>

        <div className="about-container">
          <div className="about-years">
            <AnimatePresence mode="wait">
              {activeIndex >= 0 && activeIndex < JOURNEY.length && (() => {
                const entry = JOURNEY[activeIndex];
                return (
                  <motion.div
                    key={entry.year}
                    className={`year-row year-row--${POSITIONS[activeIndex % POSITIONS.length]}`}
                    variants={YEAR_ANIM}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    {/* Main clickable year + title line */}
                    <div
                      className={`year-item ${expandedYear === entry.year ? 'year-item--expanded' : ''}`}
                      onMouseEnter={() => setHoveredYear(entry.year)}
                      onMouseLeave={() => setHoveredYear(null)}
                      onClick={() =>
                        setExpandedYear(
                          expandedYear === entry.year ? null : entry.year,
                        )
                      }
                    >
                      <span className="year-num">{entry.year}</span>
                      <div className="year-meta">
                        <span className="year-title">{entry.title}</span>
                        {entry.projects !== null && (
                          <span className="year-count">
                            {entry.projects} projects
                          </span>
                        )}
                      </div>
                      <span className="year-toggle">
                        {expandedYear === entry.year ? '−' : '+'}
                      </span>
                    </div>

                    {/* Inline expanded panel */}
                    <AnimatePresence>
                      {expandedYear === entry.year && (
                        <motion.div
                          className="year-expand"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                        >
                          <div className="year-expand__inner">
                            <p className="year-expand__detail">{entry.detail}</p>
                            <div className="year-expand__tech">
                              {entry.tech.map((t) => (
                                <span key={t} className="year-tech-tag">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover floating card */}
                    <AnimatePresence>
                      {hoveredYear === entry.year && expandedYear !== entry.year && (
                        <motion.div
                          className="year-float-card"
                          initial={{ opacity: 0, x: -20, scale: 0.96 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -10, scale: 0.96 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          <p className="year-float__summary">{entry.summary}</p>
                          <div className="year-float__tech">
                            {entry.tech.map((t) => (
                              <span
                                key={t}
                                className="year-tech-tag year-tech-tag--small"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {entry.projects !== null && (
                            <span className="year-float__stat">
                              {entry.projects} projects
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
