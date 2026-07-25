/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ORIGIN_JOURNEY } from '../../constants';
import { getEducation, type Education } from '@/src/features/education/api/education';
import { getExperience, type Experience } from '@/src/features/experience/api/experience';
import '../../styles/origin-page.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

function formatYear(value: string | null): string {
  if (!value) return 'Present';
  return new Date(value).getFullYear().toString();
}

const entrance = {
  initial: { opacity: 0, y: 36, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' } as const,
};

export function OriginTimeline() {
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // timeline spine fills as the reader scrolls the story
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.75', 'end 0.6'],
  });
  const spineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  useEffect(() => {
    getEducation().then(setEducation).catch(console.error);
    getExperience().then(setExperience).catch(console.error);
  }, []);

  return (
    <div className="origin-container">
      <section className="origin-block">
        <motion.h2 className="origin-block__title" {...entrance} transition={{ duration: 0.7, ease: EASE }}>
          Journey
        </motion.h2>
        <div className="simple-timeline" ref={timelineRef}>
          <div className="origin-spine" aria-hidden>
            <motion.span
              className="origin-spine__fill"
              style={{ scaleY: spineScale }}
            />
          </div>
          {ORIGIN_JOURNEY.map((entry, i) => (
            <div key={entry.year}>
              <motion.div
                className="simple-entry"
                {...entrance}
                transition={{ duration: 0.7, delay: 0.06 * i, ease: EASE }}
              >
                <div className="simple-entry__yearcol">
                  <span className="simple-entry__dot" aria-hidden />
                  <span className="simple-entry__year">{entry.year}</span>
                </div>
                <p className="simple-entry__desc">{entry.description}</p>
              </motion.div>
              {i < ORIGIN_JOURNEY.length - 1 && (
                <span className="simple-entry__arrow" aria-hidden>
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {experience.length > 0 && (
        <section className="origin-block">
          <motion.h2 className="origin-block__title" {...entrance} transition={{ duration: 0.7, ease: EASE }}>
            Experience
          </motion.h2>
          <div className="origin-list">
            {experience.map((item, i) => (
              <motion.div
                key={item.id}
                className="origin-list__item"
                {...entrance}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              >
                <div className="origin-list__heading">
                  <h3>{item.position}</h3>
                  <span className="origin-list__dates">
                    {formatYear(item.start_date)} — {item.current ? 'Present' : formatYear(item.end_date)}
                  </span>
                </div>
                <p className="origin-list__sub">{item.company}</p>
                {item.description && <p className="origin-list__desc">{item.description}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="origin-block">
          <motion.h2 className="origin-block__title" {...entrance} transition={{ duration: 0.7, ease: EASE }}>
            Education
          </motion.h2>
          <div className="origin-list">
            {education.map((item, i) => (
              <motion.div
                key={item.id}
                className="origin-list__item"
                {...entrance}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              >
                <div className="origin-list__heading">
                  <h3>{item.degree}</h3>
                  <span className="origin-list__dates">
                    {item.start_year ?? ''}
                    {item.start_year && item.end_year ? ' — ' : ''}
                    {item.end_year ?? ''}
                  </span>
                </div>
                <p className="origin-list__sub">
                  {item.institution} · {item.field}
                </p>
                {item.description && <p className="origin-list__desc">{item.description}</p>}
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
