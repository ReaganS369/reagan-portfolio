/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Mail, Link2, GitBranch, FileText } from 'lucide-react';
import '../../styles/contact-cta.css';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const LINES = ["LET'S", 'BUILD', 'SOMETHING', 'TOGETHER'];

const ACTIONS = [
  {
    key: 'email',
    label: 'Email',
    href: 'mailto:hello@nngtw.com',
    icon: Mail,
    variant: 'primary' as const,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Link2,
    variant: 'outline' as const,
  },
  {
    key: 'github',
    label: 'GitHub',
    href: 'https://github.com/ReaganS369',
    icon: GitBranch,
    variant: 'outline' as const,
  },
  {
    key: 'resume',
    label: 'Resume',
    href: '#',
    icon: FileText,
    variant: 'outline' as const,
  },
];

export function ContactCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="contact-cta-section" ref={ref}>
      <div className="contact-cta-container">
        {/* Editorial big type */}
        <div className="contact-cta-type">
          {LINES.map((line, i) => (
            <motion.div
              key={line}
              className="contact-cta-line"
              initial={{ opacity: 0, x: -60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.85,
                ease: EASE,
                delay: i * 0.1,
              }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <motion.div
          className="contact-cta-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        >
          {ACTIONS.map(({ key, label, href, icon: Icon, variant }) => (
            <a
              key={key}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              className={`cta-action cta-action--${variant}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Background glow */}
      <div className="contact-cta-glow" aria-hidden />
    </section>
  );
}
