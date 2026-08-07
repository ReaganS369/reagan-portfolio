/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import '../../styles/about-closing.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const LINES = ['I don’t just write code.', 'I engineer digital worlds that feel alive.'];

export function AboutClosing() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="about-closing" ref={ref}>
      <div className="about-closing__container">
        {LINES.map((line, i) => (
          <motion.p
            key={line}
            className="about-closing__line"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.9, delay: i * 0.22, ease: EASE }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
