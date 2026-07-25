/** @format */

import './film-grain.css';

/**
 * Cinematic film grain — a near-invisible animated noise field laid over
 * the whole page. Pure CSS (SVG turbulence tile stepped across the screen),
 * GPU-composited, frozen under prefers-reduced-motion and disabled on
 * mobile where the blend-mode layer costs more than it gives.
 */
export function FilmGrain() {
  return <div className="film-grain" aria-hidden="true" />;
}
