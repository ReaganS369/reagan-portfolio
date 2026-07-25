/** @format */

'use client';

import { RefObject, useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { useHeroVideos } from '@/src/features/hero/hooks/useHeroVideos';

interface JourneyScrubProps {
  /** The .about-section element — scroll progress through it drives time. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Shared with the parent so the Auto Journey button can read duration
   *  and drive its own scroll tween off the same element. */
  videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * Journey footage (Higgsfield video 5) as the section's cinematic background.
 *
 * One uninterrupted cinematic take — gaming, world design, VR — fills the
 * entire section behind the timeline. Scroll position through the section
 * maps to playback time: the footage never plays on its own, only advances
 * (or rewinds) as the visitor scrolls, and holds the instant scrolling stops.
 * Seeks are eased through a rAF lerp for a weighty, film-scrubber feel rather
 * than a jittery 1:1 lock.
 *
 * Renders nothing until the clip exists in storage (useHeroVideos), so the
 * section is untouched today.
 */
export function JourneyScrub({ sectionRef, videoRef }: JourneyScrubProps) {
  const { sources } = useHeroVideos();
  const targetTime = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    targetTime.current = Math.min(
      video.duration - 0.05,
      Math.max(0, p * video.duration),
    );
  });

  // Begin buffering shortly before the section arrives — not on mount.
  useEffect(() => {
    if (!sources.journey) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // preload='auto' is only a hint — call load() so buffering
          // actually begins here, ~600px before the section arrives.
          video.preload = 'auto';
          video.load();
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [sources.journey, sectionRef, videoRef]);

  // Ease playback time toward the scroll target while the section is on
  // screen. The 0.04s dead-zone avoids redundant seeks at rest. Playback
  // never runs on its own — this only ever seeks toward a scroll-derived
  // target, so an idle page always holds its current frame.
  useEffect(() => {
    if (!sources.journey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let running = false;

    const tick = () => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration)) {
        const diff = targetTime.current - video.currentTime;
        if (Math.abs(diff) > 0.04) {
          video.currentTime = video.currentTime + diff * 0.18;
        }
      }
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(section);

    return () => {
      io.disconnect();
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sources.journey, sectionRef, videoRef]);

  if (!sources.journey) return null;

  return (
    <div className="journey-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="journey-bg__video"
        src={sources.journey}
        muted
        playsInline
        // metadata only until the section nears — tiny with faststart, and it
        // keeps video.duration known so the scroll scrub can seek immediately.
        // The observer above upgrades to a full buffer ~600px ahead.
        preload="metadata"
      />
      <div className="journey-bg__scrim" />
      <div className="journey-bg__vignette" />
      <div className="journey-bg__grain" />
    </div>
  );
}
