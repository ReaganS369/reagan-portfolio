/** @format */

'use client';

import { RefObject, useEffect } from 'react';

interface PointerLightOptions {
  /** CSS selector (within the container) for elements receiving the vars. */
  targets: string;
  /** Distance (px) beyond an element's edge at which the light dies out. */
  radius?: number;
  /** Max parallax offsets (px) written to --spot-px / --spot-py. */
  parallaxX?: number;
  parallaxY?: number;
}

/**
 * Cursor as a moving light source. Writes CSS custom properties onto every
 * matched element while the container is on screen:
 *
 *   --spot     0..1 proximity of the pointer (1 = touching the element)
 *   --spot-x   pointer x as a % of the element's width (can exceed 0–100)
 *   --spot-y   pointer y as a % of the element's height
 *   --spot-px  / --spot-py   parallax offsets, when enabled
 *
 * The CSS side decides what the light does — reflections, rim glow,
 * deepening shadows, layer parallax. rAF-throttled, IntersectionObserver
 * gated to on-screen time, inert under prefers-reduced-motion.
 */
export function usePointerLight(
  containerRef: RefObject<HTMLElement | null>,
  { targets, radius = 300, parallaxX = 0, parallaxY = 0 }: PointerLightOptions,
) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(targets),
    );
    if (elements.length === 0) return;

    let raf = 0;
    let px = -1e4;
    let py = -1e4;

    const apply = () => {
      raf = 0;
      for (const el of elements) {
        const r = el.getBoundingClientRect();
        // distance from the pointer to the element's nearest edge
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const spot = Math.max(0, 1 - Math.hypot(dx, dy) / radius);

        el.style.setProperty('--spot', spot.toFixed(3));
        el.style.setProperty(
          '--spot-x',
          `${(((px - r.left) / r.width) * 100).toFixed(2)}%`,
        );
        el.style.setProperty(
          '--spot-y',
          `${(((py - r.top) / r.height) * 100).toFixed(2)}%`,
        );

        if (parallaxX || parallaxY) {
          const cx = (px - (r.left + r.width / 2)) / r.width;
          const cy = (py - (r.top + r.height / 2)) / r.height;
          const hold = Math.min(1, spot * 1.5);
          el.style.setProperty(
            '--spot-px',
            `${(cx * parallaxX * hold).toFixed(2)}px`,
          );
          el.style.setProperty(
            '--spot-py',
            `${(cy * parallaxY * hold).toFixed(2)}px`,
          );
        }
      }
    };

    const onMove = (ev: PointerEvent) => {
      px = ev.clientX;
      py = ev.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const listen = (on: boolean) => {
      if (on) window.addEventListener('pointermove', onMove, { passive: true });
      else window.removeEventListener('pointermove', onMove);
    };

    const io = new IntersectionObserver(([entry]) =>
      listen(entry.isIntersecting),
    );
    io.observe(container);

    return () => {
      io.disconnect();
      listen(false);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [containerRef, targets, radius, parallaxX, parallaxY]);
}
