/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import '../../styles/about-story.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const PARAGRAPHS = [
  'My journey began with curiosity rather than specialization. Instead of choosing a single creative field, I wanted to understand how digital experiences were built from start to finish. That curiosity led me into programming, UI design, 3D modeling, animation, technical art, and eventually game development.',
  'Today, I enjoy working across multiple disciplines because I believe the best products are created when technology and creativity complement one another. Every project is an opportunity to learn, improve, and create something meaningful.',
  "I'm currently focused on building interactive products, exploring AI-assisted creative workflows, and laying the foundation for NNGTW Studio.",
];

export function AboutStory() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about-story" ref={ref}>
      <div className="about-story__container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="01" title="My Story" />
        </motion.div>

        <motion.h2
          className="about-story__heading"
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          My Journey
        </motion.h2>

        <div className="about-story__body">
          {PARAGRAPHS.map((paragraph, i) => (
            <motion.p
              key={i}
              className="about-story__paragraph"
              initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, delay: 0.25 + i * 0.15, ease: EASE }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
