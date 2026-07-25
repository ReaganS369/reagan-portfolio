/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { BEYOND_WORK } from '../../constants';
import '../../styles/about-beyond.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function AboutBeyond() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about-beyond" ref={ref}>
      <div className="about-beyond__container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="03" title="Beyond Work" />
        </motion.div>

        <div className="about-beyond__grid">
          {BEYOND_WORK.map((item, i) => (
            <motion.div
              key={item.title}
              className="about-beyond__card"
              initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.75, delay: 0.15 + i * 0.1, ease: EASE }}
            >
              <span className="about-beyond__icon">{item.icon}</span>
              <h3 className="about-beyond__title">{item.title}</h3>
              <p className="about-beyond__desc">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
