/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import '../../styles/about-quote.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const LINES = [
  'Great digital experiences happen',
  'when creativity and technology',
  'work together—not separately.',
];

export function AboutQuote() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="about-quote" ref={ref}>
      <div className="about-quote__container">
        <span className="about-quote__mark" aria-hidden>
          &ldquo;
        </span>
        <blockquote className="about-quote__text">
          {LINES.map((line, i) => (
            <motion.span
              key={line}
              className="about-quote__line"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.8, delay: i * 0.18, ease: EASE }}
            >
              {line}
            </motion.span>
          ))}
        </blockquote>
      </div>
    </section>
  );
}
