/** @format */

'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import '../../styles/testimonials.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  platform: string;
  rating: number;
  review: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Creative Director',
    company: 'Studio Pixel',
    platform: 'LinkedIn',
    rating: 5,
    review:
      'Reagan delivered exceptional 3D character assets that elevated our entire game project. His ability to blend artistic vision with technical precision is rare — and he hit every deadline.',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechStart Inc.',
    platform: 'Upwork',
    rating: 5,
    review:
      'Outstanding UI/UX work on our mobile app. Reagan understands both design principles and technical constraints, making collaboration seamless from brief to final build.',
  },
  {
    id: 3,
    name: 'Marcus Rivera',
    role: 'Indie Developer',
    company: 'Solo Games',
    platform: 'Twitter/X',
    rating: 5,
    review:
      'Worked with Reagan on game art and VFX. The quality exceeded expectations and his communication throughout was excellent. Will definitely collaborate again.',
  },
  {
    id: 4,
    name: 'Priya Nair',
    role: 'Startup Founder',
    company: 'Luminate Labs',
    platform: 'Upwork',
    rating: 5,
    review:
      'Reagan redesigned our entire app from the ground up. Clean, fast, and beautiful — our retention metrics jumped 40% after the new UI launched. Highly recommend.',
  },
];

const AVG_RATING = 4.9;
const TOTAL_REVIEWS = 24;

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="testimonials-section" ref={ref}>
      <div className="testimonials-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionNumber number="04" title="What Others Say" />
        </motion.div>

        <motion.div
          className="testimonials-grid"
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          {/* Average rating feature card */}
          <motion.div className="avg-card" variants={item}>
            <div className="avg-card__bg" />
            <div className="avg-card__content">
              <span className="avg-card__label">AVERAGE RATING</span>
              <div className="avg-card__number">
                {AVG_RATING}<span className="avg-card__star">★</span>
              </div>
              <StarRating rating={5} />
              <p className="avg-card__count">Based on {TOTAL_REVIEWS} reviews</p>
              <div className="avg-card__platforms">
                <span>LinkedIn</span>
                <span>·</span>
                <span>Upwork</span>
                <span>·</span>
                <span>Direct</span>
              </div>
            </div>
          </motion.div>

          {/* Individual testimonial cards */}
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.id} className="testimonial-card" variants={item}>
              <StarRating rating={t.rating} />
              <blockquote className="testimonial-review">"{t.review}"</blockquote>
              <div className="testimonial-footer">
                <div className="testimonial-meta">
                  <span className="testimonial-name">{t.name}</span>
                  <span className="testimonial-role">
                    {t.role} · {t.company}
                  </span>
                </div>
                <span className="testimonial-platform">{t.platform}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
