/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Rocket, Globe, Sparkles, Wrench, BookOpen, type LucideIcon } from 'lucide-react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import { CURRENT_FOCUS } from '../../constants';
import '../../styles/about-focus.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const FOCUS_ICONS: LucideIcon[] = [Rocket, Globe, Sparkles, Wrench, BookOpen];

export function AboutFocus() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about-focus" ref={ref}>
      <div className="about-focus__container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="04" title="Current Focus" />
        </motion.div>

        <div className="about-focus__row">
          {CURRENT_FOCUS.map((label, i) => {
            const Icon = FOCUS_ICONS[i];
            return (
              <motion.div
                key={label}
                className="about-focus__card"
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: EASE }}
              >
                <div className="about-focus__card-inner">
                  <Icon size={22} strokeWidth={1.8} className="about-focus__icon" />
                  <span className="about-focus__label">{label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
