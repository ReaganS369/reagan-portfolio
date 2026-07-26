/** @format */

'use client';

import { RefObject, useEffect, useState } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react';

interface RibbonMotion {
  /** Resting tilt easing to dead-horizontal across the hero's scroll span. */
  rotate: MotionValue<number>;
  /** Lifts the ribbon flush to the viewport top as it flattens. */
  y: MotionValue<number>;
  /**
   * True once the ribbon has fully flattened and locked to the top — the cue
   * for the legend swap and the width sweep that split the nav bar open.
   */
  docked: boolean;
}

/**
 * Drives a hero ribbon from its resting diagonal into the flat, pinned nav bar
 * it becomes for every section below.
 *
 * The ribbons sit a few px down from the top so they cross each other cleanly
 * over the hero. Once flattened they're fixed over ordinary page content, and
 * that offset would leave a strip of the section showing above the bar — so
 * the same scroll span that straightens the ribbon also lifts it flush.
 */
export function useRibbonRotate(
  heroRef: RefObject<HTMLElement | null> | undefined,
  restDeg: number,
  restTop: number,
): RibbonMotion {
  const { scrollY } = useScroll();
  // Until the hero is measured, an out-of-reach span keeps the ribbon parked
  // at its resting tilt rather than snapping part-way through the rotation.
  const [heroEnd, setHeroEnd] = useState(Number.MAX_SAFE_INTEGER);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    let ro: ResizeObserver | null = null;
    let raf = 0;
    let measure: (() => void) | null = null;

    // The ribbons are children of the hero <section>, and React attaches refs
    // bottom-up — the parent's ref is still null while this effect first runs.
    // Retry on the next frame until it lands.
    const attach = () => {
      const hero = heroRef?.current;
      if (!hero) {
        raf = requestAnimationFrame(attach);
        return;
      }
      measure = () => setHeroEnd(hero.offsetHeight);
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(hero);
      window.addEventListener('resize', measure);
    };

    attach();

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (measure) window.removeEventListener('resize', measure);
    };
  }, [heroRef]);

  const progress = useTransform(scrollY, [0, heroEnd], [0, 1], { clamp: true });

  const rotate = useTransform(progress, [0, 1], [restDeg, 0]);
  const y = useTransform(progress, [0, 1], [0, -restTop]);

  // No seeding pass is needed alongside this subscription: the home page pins
  // scroll restoration to manual and jumps to the top on mount, so every load
  // starts inside the hero with the ribbon at its resting tilt.
  useMotionValueEvent(progress, 'change', (v) => setDocked(v >= 1));

  return { rotate, y, docked };
}
