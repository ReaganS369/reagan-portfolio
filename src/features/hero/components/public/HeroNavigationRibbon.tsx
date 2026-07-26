/** @format */

'use client';

import { RefObject } from 'react';
import { motion } from 'motion/react';

import { storyMessages } from '../../constants';
import { useRibbonRotate } from '../../hooks/useRibbonRotate';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/story-ribbon.css';

interface HeroNavigationRibbonProps {
  heroRef?: RefObject<HTMLElement | null>;
}

export function HeroNavigationRibbon({ heroRef }: HeroNavigationRibbonProps) {
  // Matches `top: 5px` in story-ribbon.css — the offset the ribbon sheds as
  // it flattens so the pinned bar sits flush with the viewport top.
  const { rotate, y, docked } = useRibbonRotate(heroRef, -1, 5);

  return (
    <motion.div
      className={`story-ribbon${docked ? ' story-ribbon--docked' : ''}`}
      style={{ rotate, y }}
    >
      <MarqueeTrack
        messages={storyMessages}
        className="story-track marquee-track"
      />
    </motion.div>
  );
}
