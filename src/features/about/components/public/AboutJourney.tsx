/** @format */

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { JOURNEY } from '../../constants';
import '../../styles/about-journey.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const YEAR_ANIM = {
  hidden: { opacity: 0, x: -60 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE, delay: i * 0.08 },
  }),
};

export function AboutJourney() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  const getEntry = (year: string) => JOURNEY.find((e) => e.year === year)!;

  return (
    <section className="about-section" ref={ref}>
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
          {JOURNEY.map((entry, i) => (
            <div key={entry.year} className="year-row">
              {/* Main clickable year + title line */}
              <motion.div
                className={`year-item ${expandedYear === entry.year ? 'year-item--expanded' : ''}`}
                custom={i}
                variants={YEAR_ANIM}
                initial="hidden"
                animate={isInView ? 'show' : 'hidden'}
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
              </motion.div>

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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
