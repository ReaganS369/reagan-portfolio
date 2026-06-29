/** @format */

'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import '../../styles/brain-skills.css';

type Side = 'design' | 'dev' | null;

interface Skill {
  name: string;
  angle: number;
  ring: number; // 1 = inner, 2 = outer
}

const DESIGN_SKILLS: Skill[] = [
  { name: 'Blender', angle: 0, ring: 1 },
  { name: 'Figma', angle: 60, ring: 1 },
  { name: 'Illustrator', angle: 120, ring: 1 },
  { name: 'Photoshop', angle: 180, ring: 1 },
  { name: 'DaVinci Resolve', angle: 240, ring: 1 },
  { name: 'After Effects', angle: 300, ring: 1 },
  { name: 'Substance', angle: 30, ring: 2 },
  { name: 'Premiere', angle: 150, ring: 2 },
  { name: 'ZBrush', angle: 270, ring: 2 },
];

const DEV_SKILLS: Skill[] = [
  { name: 'Unreal Engine', angle: 0, ring: 1 },
  { name: 'Unity', angle: 45, ring: 1 },
  { name: 'React', angle: 90, ring: 1 },
  { name: 'React Native', angle: 135, ring: 1 },
  { name: 'C#', angle: 180, ring: 1 },
  { name: 'JavaScript', angle: 225, ring: 1 },
  { name: 'Firebase', angle: 270, ring: 1 },
  { name: 'MySQL', angle: 315, ring: 1 },
  { name: 'Next.js', angle: 20, ring: 2 },
  { name: 'TypeScript', angle: 110, ring: 2 },
  { name: 'Three.js', angle: 200, ring: 2 },
  { name: 'Supabase', angle: 290, ring: 2 },
];

const RING_RADIUS = { 1: 190, 2: 270 };

function skillPosition(angle: number, ring: 1 | 2) {
  const r = RING_RADIUS[ring];
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: Math.cos(rad) * r,
    y: Math.sin(rad) * r,
  };
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const nodeAnim = (i: number) => ({
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
  transition: {
    duration: 0.4,
    ease: EASE,
    delay: i * 0.04,
  },
});

export function BrainSkills() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState<Side>(null);

  const currentSkills = active === 'design' ? DESIGN_SKILLS : active === 'dev' ? DEV_SKILLS : [];

  const handleSide = (side: Side) => setActive((prev) => (prev === side ? null : side));

  return (
    <section className="brain-section" ref={ref}>
      <div className="brain-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="03" title="How I Think" />
        </motion.div>

        {/* Instruction hint */}
        <motion.p
          className="brain-hint"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Click a hemisphere to explore
        </motion.p>

        {/* Brain visualization */}
        <motion.div
          className="brain-stage"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.9, ease: EASE }}
        >
          {/* SVG brain shape */}
          <svg
            className="brain-svg"
            viewBox="0 0 400 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left hemisphere */}
            <path
              d="M200 40 C160 35 120 50 95 80 C70 110 65 145 70 175 C75 210 95 240 130 258 C155 270 178 272 200 268"
              stroke="rgba(245,138,31,0.3)"
              strokeWidth="1.5"
              fill="rgba(245,138,31,0.04)"
              className={active === 'design' ? 'brain-path--active-design' : ''}
            />
            <path
              d="M200 40 C160 35 120 50 95 80 C70 110 65 145 70 175 C75 210 95 240 130 258 C155 270 178 272 200 268"
              stroke="rgba(245,138,31,0.15)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Gyri (wrinkles) on left */}
            <path d="M130 90 Q115 110 120 135" stroke="rgba(245,138,31,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M110 145 Q100 165 108 185" stroke="rgba(245,138,31,0.10)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M145 200 Q135 220 145 240" stroke="rgba(245,138,31,0.10)" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Right hemisphere */}
            <path
              d="M200 40 C240 35 280 50 305 80 C330 110 335 145 330 175 C325 210 305 240 270 258 C245 270 222 272 200 268"
              stroke="rgba(223,19,138,0.3)"
              strokeWidth="1.5"
              fill="rgba(223,19,138,0.04)"
              className={active === 'dev' ? 'brain-path--active-dev' : ''}
            />
            <path
              d="M200 40 C240 35 280 50 305 80 C330 110 335 145 330 175 C325 210 305 240 270 258 C245 270 222 272 200 268"
              stroke="rgba(223,19,138,0.15)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Gyri (wrinkles) on right */}
            <path d="M270 90 Q285 110 280 135" stroke="rgba(223,19,138,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M290 145 Q300 165 292 185" stroke="rgba(223,19,138,0.10)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M255 200 Q265 220 255 240" stroke="rgba(223,19,138,0.10)" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Center divider */}
            <line x1="200" y1="42" x2="200" y2="268" stroke="rgba(242,239,231,0.08)" strokeWidth="1" strokeDasharray="4 6" />

            {/* Stem */}
            <path d="M185 268 Q200 285 215 268" stroke="rgba(242,239,231,0.15)" strokeWidth="2" fill="none" />
          </svg>

          {/* Clickable overlay buttons */}
          <button
            className={`brain-btn brain-btn--design ${active === 'design' ? 'brain-btn--active' : ''}`}
            onClick={() => handleSide('design')}
            aria-pressed={active === 'design'}
          >
            <span className="brain-btn__label">Design</span>
          </button>

          <button
            className={`brain-btn brain-btn--dev ${active === 'dev' ? 'brain-btn--active' : ''}`}
            onClick={() => handleSide('dev')}
            aria-pressed={active === 'dev'}
          >
            <span className="brain-btn__label">Dev</span>
          </button>

          {/* Skill nodes orbit */}
          <div className="brain-orbit">
            <AnimatePresence>
              {currentSkills.map((skill, i) => {
                const pos = skillPosition(skill.angle, skill.ring as 1 | 2);
                const anim = nodeAnim(i);
                return (
                  <motion.div
                    key={`${active}-${skill.name}`}
                    className={`skill-node skill-node--${active}`}
                    style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px` } as React.CSSProperties}
                    initial={anim.initial}
                    animate={anim.animate}
                    exit={anim.exit}
                    transition={anim.transition}
                  >
                    {skill.name}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="brain-legend">
          <div className="brain-legend__item">
            <span className="brain-legend__dot brain-legend__dot--design" />
            <span>Design</span>
          </div>
          <div className="brain-legend__item">
            <span className="brain-legend__dot brain-legend__dot--dev" />
            <span>Development</span>
          </div>
        </div>
      </div>
    </section>
  );
}
