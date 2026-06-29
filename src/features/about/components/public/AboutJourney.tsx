/** @format */

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import '../../styles/about-journey.css';

interface YearEntry {
  year: string;
  title: string;
  summary: string;
  tech: string[];
  projects: number | null;
  detail: string;
}

const JOURNEY: YearEntry[] = [
  {
    year: '2018',
    title: 'The Spark',
    summary: 'Discovered game development through Unity tutorials and never looked back.',
    tech: ['Unity', 'C#', 'Blender basics'],
    projects: 2,
    detail:
      'Started exploring 3D game development after being fascinated by indie games. Built first prototype — a simple platformer that never shipped but sparked everything that followed.',
  },
  {
    year: '2020',
    title: 'Building the Foundation',
    summary: 'First game jam victories and deep dives into 3D art and animation.',
    tech: ['Blender', 'Illustrator', 'Unity', 'C#'],
    projects: 5,
    detail:
      'Participated in multiple game jams, shipped 3 games. Learned 3D modeling and began understanding the full pipeline from raw asset to running engine.',
  },
  {
    year: '2022',
    title: 'Expanding Horizons',
    summary: 'Entered UI/UX and web development while growing freelance work.',
    tech: ['React', 'Figma', 'JavaScript', 'CSS'],
    projects: 8,
    detail:
      'Began freelancing for app UI design and web development projects. Discovered that great design requires understanding both aesthetics and the code that delivers it.',
  },
  {
    year: '2024',
    title: 'Into Immersive Worlds',
    summary: 'XR/VR projects and advanced real-time development work.',
    tech: ['Unreal Engine', 'Unity XR', 'Blender', 'React Native'],
    projects: 12,
    detail:
      'Shipped first XR application and contributed to VR training simulations. Architecture began to feel as important as aesthetics — and performance became non-negotiable.',
  },
  {
    year: '2025',
    title: 'Mastering the Stack',
    summary: 'Full-stack capabilities, portfolio launch, and leveling up across disciplines.',
    tech: ['Next.js', 'Supabase', 'DaVinci Resolve', 'Three.js'],
    projects: 15,
    detail:
      'Built this portfolio from scratch. Deepened knowledge of backend systems, motion design, and film-quality rendering pipelines — and learned to ship complete products end-to-end.',
  },
  {
    year: 'FUTURE',
    title: 'The Vision',
    summary: 'International studios, original IP, and building immersive worlds at scale.',
    tech: ['Unreal 5', 'Nanite', 'Lumen', 'MetaHuman'],
    projects: null,
    detail:
      'The goal: ship games that millions play, XR experiences that reshape how people see virtual spaces, and build a studio that creates worlds with genuine soul.',
  },
];

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
      <div className="about-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="02" title="The Journey" />
        </motion.div>

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
                  setExpandedYear(expandedYear === entry.year ? null : entry.year)
                }
              >
                <span className="year-num">{entry.year}</span>
                <div className="year-meta">
                  <span className="year-title">{entry.title}</span>
                  {entry.projects !== null && (
                    <span className="year-count">{entry.projects} projects</span>
                  )}
                </div>
                <span className="year-toggle">{expandedYear === entry.year ? '−' : '+'}</span>
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
                        <span key={t} className="year-tech-tag year-tech-tag--small">
                          {t}
                        </span>
                      ))}
                    </div>
                    {entry.projects !== null && (
                      <span className="year-float__stat">{entry.projects} projects</span>
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
