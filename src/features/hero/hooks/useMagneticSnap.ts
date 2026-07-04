/** @format */

'use client';

import { RefObject, useEffect } from 'react';

/**
 * Magnetic scroll transition from the Hero to the section below it.
 *
 * Once the large hero title has fully left the viewport (or ~80% of the hero
 * has scrolled past) and the user's downward scroll comes to rest in the gap
 * between the two sections, the viewport glides to align the next section
 * with the top of the screen.
 *
 * The glide waits for scroll input to go idle rather than firing mid-flick,
 * so it never fights wheel momentum or an active touch drag. Scrolling up
 * cancels everything; the snap re-arms only after the user climbs back above
 * the trigger threshold.
 *
 * The hero mounts asynchronously (it waits on a profile fetch), so the element
 * is resolved lazily inside the handlers rather than captured once at effect
 * time — otherwise the listeners would bind before the hero exists and the
 * snap would never activate.
 */

/** Quiet period after the last scroll event before the glide begins. */
const IDLE_DELAY_MS = 90;
/** Distances below this are treated as already aligned. */
const MIN_SNAP_DISTANCE = 4;
const BASE_DURATION_MS = 300;
const EXTRA_DURATION_MS = 200;
const REAGAN_TRIGGER_OFFSET = -20;

/** Smootherstep: zero velocity and acceleration at both ends. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function useMagneticSnap(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number | null = null;
    let idleTimer: number | null = null;
    let animating = false;
    let snappedThisPass = false;
    let touchActive = false;
    let lastY = window.scrollY;
    let direction: 1 | -1 | 0 = 0;
    let titleEl: HTMLElement | null = null;

    const getTitle = (hero: HTMLElement) => {
      if (!titleEl || !hero.contains(titleEl)) {
        titleEl = hero.querySelector('.hero-first-name');
      }
      return titleEl;
    };

    const thresholdReached = (hero: HTMLElement) => {
      const title = getTitle(hero);
      if (!title) return false;
      const rect = title.getBoundingClientRect();
      return rect.bottom <= REAGAN_TRIGGER_OFFSET;
    };

    /** Document-space Y that aligns the next section with the viewport top. */
    const snapTarget = (hero: HTMLElement) => {
      const next = hero.nextElementSibling as HTMLElement | null;
      if (!next) return hero.getBoundingClientRect().bottom + window.scrollY;
      return next.getBoundingClientRect().top + window.scrollY;
    };

    const cancelGlide = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      animating = false;
    };

    const clearIdleTimer = () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = null;
    };

    const glideTo = (targetY: number) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (distance <= MIN_SNAP_DISTANCE) return;

      animating = true;
      snappedThisPass = true;
      const duration =
        BASE_DURATION_MS +
        EXTRA_DURATION_MS * Math.min(1, distance / window.innerHeight);
      const startTime = performance.now();

      const step = (now: number) => {
        if (!animating) return;
        const t = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, startY + distance * ease(t));
        lastY = window.scrollY;
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          animating = false;
          rafId = null;
        }
      };

      rafId = requestAnimationFrame(step);
    };

    /** (Re)start the idle timer; the glide fires only once scrolling rests. */
    const maybeArm = () => {
      clearIdleTimer();
      const hero = heroRef.current;
      if (!hero) return;
      if (animating || snappedThisPass || touchActive) return;
      if (direction !== 1 || !thresholdReached(hero)) return;
      if (snapTarget(hero) - window.scrollY <= MIN_SNAP_DISTANCE) return;

      idleTimer = window.setTimeout(() => {
        idleTimer = null;
        const h = heroRef.current;
        if (!h || animating || snappedThisPass || touchActive) return;
        if (!thresholdReached(h)) return;
        glideTo(snapTarget(h));
      }, IDLE_DELAY_MS);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (animating) {
        lastY = y;
        return;
      }
      if (y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;

      const hero = heroRef.current;
      if (direction === -1) {
        clearIdleTimer();
        // Re-arm for the next departure once the user is back above the trigger.
        if (hero && !thresholdReached(hero)) snappedThisPass = false;
        return;
      }
      maybeArm();
    };

    const onWheel = (ev: WheelEvent) => {
      // Upward wheel returns control instantly; downward rides the glide.
      if (ev.deltaY < 0) {
        cancelGlide();
        clearIdleTimer();
      }
    };

    const onTouchStart = () => {
      touchActive = true;
      cancelGlide();
      clearIdleTimer();
    };

    const onTouchEnd = () => {
      touchActive = false;
      maybeArm();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowUp' || ev.key === 'PageUp' || ev.key === 'Home') {
        cancelGlide();
        clearIdleTimer();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      cancelGlide();
      clearIdleTimer();
    };
  }, [heroRef]);
}
