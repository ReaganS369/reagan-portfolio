/** @format */

'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import { useHeroVideos } from '@/src/features/hero/hooks/useHeroVideos';

gsap.registerPlugin(ScrollToPlugin);

interface AutoJourneyButtonProps {
  sectionRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * Floating control that replays the Journey exactly as directed: a single
 * linear scroll tween from wherever the visitor currently is through to the
 * end of the section, timed to whatever footage remains. Because the video
 * itself is driven purely by scroll position (see JourneyScrub), keeping
 * this tween's easing at "none" is what keeps playback perfectly locked to
 * the page moving — any other easing would let the two drift apart.
 */
export function AutoJourneyButton({
  sectionRef,
  videoRef,
}: AutoJourneyButtonProps) {
  const { sources } = useHeroVideos();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const blockScroll = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const stop = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    setActive(false);
    window.removeEventListener('wheel', blockScroll);
    window.removeEventListener('touchmove', blockScroll);
    document.documentElement.classList.remove('auto-journey-lock');
  }, [blockScroll]);

  const start = useCallback(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !Number.isFinite(video.duration)) return;

    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const rangeStart = sectionTop;
    const rangeEnd = sectionTop + section.offsetHeight - vh;

    const currentY = window.scrollY;
    const progress = Math.min(
      1,
      Math.max(0, (currentY - rangeStart) / (rangeEnd - rangeStart)),
    );

    // Not yet at the section: snap the pre-roll instantly, then run the
    // full take. Already inside it: continue from here with no jump, so
    // the footage never skips a frame the visitor already watched.
    const startY = progress <= 0 ? rangeStart : currentY;
    const remaining =
      progress <= 0 ? video.duration : video.duration * (1 - progress);

    if (progress <= 0) window.scrollTo({ top: startY });

    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
    document.documentElement.classList.add('auto-journey-lock');
    setActive(true);

    tweenRef.current = gsap.to(window, {
      duration: Math.max(0.3, remaining),
      ease: 'none',
      scrollTo: { y: rangeEnd, autoKill: true },
      onComplete: stop,
      onInterrupt: stop,
    });
  }, [sectionRef, videoRef, blockScroll, stop]);

  const toggle = useCallback(() => {
    if (active) stop();
    else start();
  }, [active, start, stop]);

  // ESC cancels immediately.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, stop]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [sectionRef]);

  useEffect(() => stop, [stop]);

  if (!sources.journey) return null;

  return (
    <div
      className={`auto-journey ${visible ? 'auto-journey--visible' : ''} ${
        active ? 'auto-journey--active' : ''
      }`}
    >
      <button
        type="button"
        className="auto-journey__btn"
        onClick={toggle}
        aria-label={active ? 'Stop Auto Journey' : 'Play Auto Journey'}
        aria-pressed={active}
      >
        {active ? (
          <Square size={16} strokeWidth={2} />
        ) : (
          <Play size={16} strokeWidth={2} />
        )}
      </button>
      <span className="auto-journey__label">
        {active ? 'Playing' : 'Auto Journey'}
      </span>
    </div>
  );
}
