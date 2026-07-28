/** @format */

'use client';

import { RefObject, useEffect, useState } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'motion/react';

/**
 * hero    — resting diagonal, marquee looping
 * spinning — flattened; the loop is racing to a stop at a clean offset
 * settled  — stopped; legend swaps to short labels, then the bar splits open
 */
type DockPhase = 'hero' | 'spinning' | 'settled';

interface RibbonDock {
  /** Resting tilt easing to dead-horizontal across the hero's scroll span. */
  rotate: MotionValue<number>;
  /** Lifts the ribbon flush to the viewport top as it flattens. */
  y: MotionValue<number>;
  /** Flattened and locked to the top — the loop is spinning down. */
  docked: boolean;
  /** The loop has come to rest; the legend and the split may now play. */
  settled: boolean;
}

/**
 * Time the loop would take to cover one full repeat while settling. Actual
 * duration is scaled by how far it still has to go, so the labels keep a
 * steady pace instead of lurching — the loop simply carries on until the slots
 * line up, then eases the last fraction into place.
 */
const SETTLE_FULL_MS = 1150;
/** Floor, so an almost-aligned loop still glides rather than jumping. */
const SETTLE_MIN_MS = 280;
/** Barely-there ease so the stop lands softly without reading as a brake. */
const SETTLE_EASING = 'cubic-bezier(0.25, 0, 0.2, 1)';

/**
 * Drives a ribbon from its resting diagonal into the flat, pinned nav bar it
 * becomes for every section below.
 *
 * The ribbons sit a few px down from the top so they cross each other cleanly
 * over the hero. Once flattened they're fixed over ordinary page content, and
 * that offset would leave a strip of the section showing above the bar — so
 * the same scroll span that straightens the ribbon also lifts it flush.
 *
 * `animated` is the home page only, where there is a hero to unfurl over.
 * Everywhere else the bar is simply a nav: it mounts already settled, with no
 * tilt to shed and no loop to stop.
 *
 * The hero is found by query rather than handed in as a ref — the ribbons are
 * rendered from the root layout now, so they have no way to receive one from
 * the page that owns the hero.
 */
export function useRibbonDock(
  animated: boolean,
  restDeg: number,
  restTop: number,
  trackRef?: RefObject<HTMLDivElement | null>,
): RibbonDock {
  const { scrollY } = useScroll();
  // Until the hero is measured, an out-of-reach span keeps the ribbon parked
  // at its resting tilt rather than snapping part-way through the rotation.
  const [heroEnd, setHeroEnd] = useState(Number.MAX_SAFE_INTEGER);
  const [phase, setPhase] = useState<DockPhase>(animated ? 'hero' : 'settled');

  useEffect(() => {
    if (!animated) return;

    let ro: ResizeObserver | null = null;
    let raf = 0;
    let frames = 0;
    let measure: (() => void) | null = null;

    // The hero mounts with the page, a beat after this layout-level effect
    // first runs. Retry per frame until it lands, then give up rather than
    // spin forever on a route that turned out not to have one.
    const attach = () => {
      const hero = document.querySelector<HTMLElement>('.home-hero');
      if (!hero) {
        if (++frames < 120) raf = requestAnimationFrame(attach);
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
  }, [animated]);

  const progress = useTransform(scrollY, [0, heroEnd], [0, 1], { clamp: true });

  // Off the home page there is no tilt to shed and no offset to lift: the CSS
  // parks the bar flush itself, so both stay at zero for the element's life.
  const rotate = useTransform(progress, [0, 1], animated ? [restDeg, 0] : [0, 0]);
  const y = useTransform(progress, [0, 1], animated ? [0, -restTop] : [0, 0]);

  // No seeding pass is needed alongside this subscription: the home page pins
  // scroll restoration to manual and jumps to the top on mount, so every load
  // starts inside the hero with the ribbon at its resting tilt. Undocking is
  // immediate — scrolling back must restore the loop on the same frame the
  // ribbon starts tilting again.
  useMotionValueEvent(progress, 'change', (v) => {
    if (!animated) return;
    setPhase((prev) => {
      if (v < 1) return 'hero';
      return prev === 'hero' ? 'spinning' : prev;
    });
  });

  // Carry the loop on to the next repeat boundary and stop it there. Every
  // item is one docked slot wide, so a boundary is exactly where the labels
  // tile the bar in their listed order, each centred in its own slot. Halting
  // it where it stood would leave them straddling slots with the leading one
  // chopped against the ribbon's left edge.
  useEffect(() => {
    const el = trackRef?.current;
    if (phase !== 'spinning' || !el) return;

    const cs = getComputedStyle(el);
    const m = new DOMMatrixReadOnly(cs.transform === 'none' ? '' : cs.transform);
    const currentX = m.m41;

    // The track holds two identical sets of labels, so its loop — and every
    // offset that looks like a clean start — repeats every half its width.
    const period = el.scrollWidth / 2;
    if (!period) return;

    // The settled bar holds the loop clear of the monogram, so the stop has to
    // land on `boundary + brand width` rather than the boundary itself —
    // otherwise the CSS resting transform would yank it sideways on settle.
    // Zero on the CV ribbon, which carries no monogram.
    const brand = el.parentElement?.querySelector('.story-ribbon__brand');
    const brandWidth = brand ? brand.getBoundingClientRect().width : 0;

    // Nearest boundary still ahead — never backwards, so the loop is only ever
    // seen continuing in the direction it was already travelling.
    const target =
      -Math.ceil((-currentX + 1) / period) * period + brandWidth;
    const duration = Math.max(
      SETTLE_MIN_MS,
      ((target - currentX) / -period) * SETTLE_FULL_MS,
    );

    // Take the transform off the CSS loop without a jump: freeze inline at the
    // exact offset it had reached, then animate from there. Doing this here
    // rather than from a CSS class is deliberate — a class would null the
    // animation before this effect runs, and the offset would already have
    // snapped to zero by the time it was read.
    /* eslint-disable react-hooks/immutability -- a DOM node reached through a
       ref is mutable by design; the compiler cannot tell one apart from React
       state it owns. */
    el.style.animation = 'none';
    el.style.transform = `translateX(${currentX}px)`;
    /* eslint-enable react-hooks/immutability */

    const anim = el.animate(
      [
        { transform: `translateX(${currentX}px)` },
        { transform: `translateX(${target}px)` },
      ],
      { duration, easing: SETTLE_EASING, fill: 'forwards' },
    );

    let live = true;
    anim.finished
      .then(() => {
        if (live) setPhase((prev) => (prev === 'spinning' ? 'settled' : prev));
      })
      .catch(() => {
        /* cancelled by an undock — the loop simply resumes */
      });

    return () => {
      live = false;
      anim.cancel();
      // Safe on the way to `settled` too: React has already committed that
      // class by the time cleanup runs, so the CSS resting state — loop off,
      // laid out as a nav — is what these inline styles fall back to.
      el.style.animation = '';
      el.style.transform = '';
    };
  }, [phase, trackRef]);

  return { rotate, y, docked: phase !== 'hero', settled: phase === 'settled' };
}
