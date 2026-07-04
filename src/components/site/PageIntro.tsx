/** @format */

'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import './page-intro.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** oversized ghost word behind the title — defaults to the title's first word */
  ghost?: string;
}

const reveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, delay: 0.1 + i * 0.12, ease: EASE },
  }),
};

export function PageIntro({ eyebrow, title, description, ghost }: PageIntroProps) {
  return (
    <header className="page-intro">
      <motion.span
        className="page-intro__ghost"
        aria-hidden
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
      >
        {(ghost ?? title).split(' ')[0]}
      </motion.span>

      <motion.div custom={0} variants={reveal} initial="hidden" animate="show">
        <Link href="/" className="page-intro__back">
          <ArrowLeft size={16} />
          <span>Back home</span>
        </Link>
      </motion.div>

      <motion.div
        className="page-intro__eyebrow-row"
        custom={1}
        variants={reveal}
        initial="hidden"
        animate="show"
      >
        <motion.span
          className="page-intro__rule"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
        />
        <span className="page-intro__eyebrow">{eyebrow}</span>
      </motion.div>

      <motion.h1
        className="page-intro__title"
        custom={2}
        variants={reveal}
        initial="hidden"
        animate="show"
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          className="page-intro__description"
          custom={3}
          variants={reveal}
          initial="hidden"
          animate="show"
        >
          {description}
        </motion.p>
      )}
    </header>
  );
}
