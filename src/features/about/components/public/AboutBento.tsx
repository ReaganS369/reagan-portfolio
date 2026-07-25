/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { WHAT_I_DO } from '../../constants';
import '../../styles/about-bento.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function AboutBento() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about-bento" ref={ref}>
      <div className="about-bento__container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="02" title="What I Do" />
        </motion.div>

        <div className="about-bento__grid">
          {WHAT_I_DO.map((item, i) => (
            <motion.div
              key={item.title}
              className="about-bento__card"
              initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.75, delay: 0.15 + i * 0.1, ease: EASE }}
            >
              <span className="about-bento__icon">{item.icon}</span>
              <h3 className="about-bento__title">{item.title}</h3>
              <p className="about-bento__desc">{item.description}</p>
              <div className="about-bento__glow" aria-hidden />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
