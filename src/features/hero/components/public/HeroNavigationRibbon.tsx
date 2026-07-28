/** @format */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

import { storyMessages } from '../../constants';
import { useRibbonDock } from '../../hooks/useRibbonDock';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/story-ribbon.css';

interface HeroNavigationRibbonProps {
  /** Home page only: unfurl from the hero's diagonal. Elsewhere, a plain nav. */
  animated?: boolean;
}

export function HeroNavigationRibbon({
  animated = false,
}: HeroNavigationRibbonProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Matches `top: 5px` in story-ribbon.css — the offset the ribbon sheds as
  // it flattens so the pinned bar sits flush with the viewport top.
  const { rotate, y, docked, settled } = useRibbonDock(animated, -1, 5, trackRef);

  return (
    <motion.div
      className={[
        'story-ribbon',
        !animated && 'story-ribbon--static',
        docked && 'story-ribbon--docked',
        settled && 'story-ribbon--settled',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ rotate, y }}
    >
      <MarqueeTrack
        messages={storyMessages}
        className="story-track marquee-track"
        trackRef={trackRef}
      />

      {/* Home. Only earns its place once the bar is a nav — over the hero it
          would sit on top of the running marquee, and the hero already has the
          full name in 8rem type a few hundred pixels below. */}
      <Link
        href="/"
        className="story-ribbon__brand"
        aria-label="Reagan Sagolsem — home"
      >
        <span aria-hidden="true">RS</span>
      </Link>
    </motion.div>
  );
}
