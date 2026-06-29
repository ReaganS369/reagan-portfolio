/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import './home-footer.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const NAV_LINKS = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Resume', href: '#' },
  { label: 'Contact', href: '#contact' },
  { label: 'GitHub', href: 'https://github.com/ReaganS369' },
];

export function HomeFooter() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <footer className="home-footer" ref={ref}>
      {/* Big editorial name */}
      <div className="footer-hero-text">
        <motion.div
          className="footer-name-line"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0 }}
        >
          REAGAN
        </motion.div>
        <motion.div
          className="footer-name-line footer-name-line--outline"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        >
          SAGOLSEM
        </motion.div>
      </div>

      {/* Footer bottom bar */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <nav className="footer-nav" aria-label="Footer navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="footer-nav__link"
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="footer-credits">
          <span>© 2026 Reagan Sagolsem</span>
          <span className="footer-sep">·</span>
          <span>Built with Next.js</span>
          <span className="footer-sep">·</span>
          <span>Designed by Reagan Sagolsem</span>
        </div>
      </motion.div>
    </footer>
  );
}
