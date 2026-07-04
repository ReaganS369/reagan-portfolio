/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { JOURNEY } from '../../constants';
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
          The Timeline
        </motion.h2>
        <div className="origin-timeline" ref={timelineRef}>
          <div className="origin-spine" aria-hidden>
            <motion.span
              className="origin-spine__fill"
              style={{ scaleY: spineScale }}
            />
          </div>
          {JOURNEY.map((entry, i) => (
            <motion.div
              key={entry.year}
              className="origin-entry"
              {...entrance}
              transition={{ duration: 0.8, delay: 0.05 * (i % 2), ease: EASE }}
            >
              <div className="origin-entry__yearcol">
                <span className="origin-entry__dot" aria-hidden />
                <span className="origin-entry__year">{entry.year}</span>
                <span className="origin-entry__year-ghost" aria-hidden>
                  {entry.year}
                </span>
              </div>
              <div className="origin-entry__body">
                <div className="origin-entry__heading">
                  <h3 className="origin-entry__title">{entry.title}</h3>
                  {entry.projects !== null && (
                    <span className="origin-entry__count">{entry.projects} projects</span>
                  )}
                </div>
                <p className="origin-entry__summary">{entry.summary}</p>
                <p className="origin-entry__detail">{entry.detail}</p>
                <div className="origin-entry__tech">
                  {entry.tech.map((tag) => (
                    <span key={tag} className="origin-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
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
