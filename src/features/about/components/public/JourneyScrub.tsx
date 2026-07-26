/** @format */

'use client';

import { RefObject, useEffect, useState } from 'react';
import { useScroll } from 'motion/react';
import { useHeroVideos } from '@/src/features/hero/hooks/useHeroVideos';

interface JourneyScrubProps {
  /** The .journey-scroll-track element — scroll progress through it drives time. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Shared with the parent so the Auto Journey button can read duration
   *  and drive its own scroll tween off the same element. */
  videoRef: RefObject<HTMLVideoElement | null>;
}

/** Frame duration of the scrub master (24fps). Seeks finer than half a frame
 *  land on the frame already displayed, so they are skipped as wasted decode. */
const FRAME = 1 / 24;

/** How hard the playhead chases the scroll target each rAF tick. Lower is
 *  heavier/filmier, higher is tighter to the finger. */
const CHASE = 0.2;

/** A seek that never reports back (decode error, tab throttling) would freeze
 *  the scrub forever, so the in-flight gate self-clears after this long. */
const SEEK_WATCHDOG_MS = 400;

/**
 * Journey footage (Higgsfield video 5) as the section's cinematic background.
 *
 * One uninterrupted cinematic take — gaming, world design, VR — fills the
 * entire section behind the timeline. Scroll position through the section
 * maps to playback time: the footage never plays on its own, only advances
 * (or rewinds) as the visitor scrolls, and holds the instant scrolling stops.
 *
 * Smooth scrubbing rests on two things that must stay in sync:
 *
 *  1. The asset is encoded ALL-INTRA (every frame a keyframe) — see
 *     scripts/encode-scrub-video.md. A normally-encoded clip only carries a
 *     keyframe every few seconds, so each seek has to decode the whole GOP to
 *     reach the wanted frame; mid-scroll the browser gives up and the
 *     background reads as one frozen frame that snaps, which is exactly the
 *     artefact this component exists to avoid.
 *  2. Only ONE seek is ever in flight. The playhead is eased on its own
 *     timeline and flushed to the element only when the previous seek has
 *     reported back, so a slow decode degrades into a lower scrub framerate
 *     instead of a queue of stale seeks fighting each other.
 *
 * Renders nothing until the clip exists in storage (useHeroVideos), so the
 * section is untouched when the render is missing.
 */
export function JourneyScrub({ sectionRef, videoRef }: JourneyScrubProps) {
  const { sources } = useHeroVideos();
  /** Gates the fade-in: held back until a real frame is decoded, so the
   *  footage dissolves in instead of popping from black. */
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
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
          // actually begins here, ~800px before the section arrives.
          video.preload = 'auto';
          video.load();
          io.disconnect();
        }
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [sources.journey, sectionRef, videoRef]);

  // Reveal only once a frame actually exists to show.
  useEffect(() => {
    if (!sources.journey) return;
    const video = videoRef.current;
    if (!video) return;

    const check = () => {
      if (video.readyState >= 2) setReady(true);
    };
    check();
    video.addEventListener('loadeddata', check);
    return () => video.removeEventListener('loadeddata', check);
  }, [sources.journey, videoRef]);

  // The scrub engine. Runs only while the section is on screen.
  useEffect(() => {
    if (!sources.journey) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Reduced motion: hold a still frame, never scrub.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let onScreen = false;
    /** Eased playhead in seconds, tracked independently of video.currentTime
     *  so easing keeps advancing while a seek is still resolving. */
    let playhead = 0;
    /** false until the first tick, which snaps rather than eases — otherwise
     *  arriving mid-section would scrub the whole take to catch up. */
    let primed = false;
    let seekingAt = 0;

    const onSeeked = () => {
      seekingAt = 0;
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onSeeked);

    const tick = () => {
      raf = 0;
      const duration = video.duration;

      if (Number.isFinite(duration) && duration > 0) {
        // Read straight off the motion value each tick. Kept as raw 0..1
        // progress rather than a cached time so arriving partway down the
        // section resolves to the right frame the moment metadata lands.
        const target = Math.min(
          duration - FRAME,
          Math.max(0, scrollYProgress.get() * duration),
        );

        if (!primed) {
          playhead = target;
          primed = true;
        } else {
          playhead += (target - playhead) * CHASE;
          // Settle exactly on target instead of easing forever inside a
          // sub-frame remainder.
          if (Math.abs(target - playhead) < FRAME * 0.25) playhead = target;
        }

        const now = performance.now();
        if (seekingAt && now - seekingAt > SEEK_WATCHDOG_MS) seekingAt = 0;

        if (!seekingAt && Math.abs(playhead - video.currentTime) > FRAME * 0.5) {
          seekingAt = now;
          // fastSeek skips the precise-seek penalty on Safari; with an
          // all-intra master the nearest sync sample IS the wanted frame,
          // so it stays frame-accurate.
          if (typeof video.fastSeek === 'function') video.fastSeek(playhead);
          else video.currentTime = playhead;
        }
      }

      if (onScreen) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(section);

    return () => {
      io.disconnect();
      onScreen = false;
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onSeeked);
    };
  }, [sources.journey, sectionRef, videoRef, scrollYProgress]);

  if (!sources.journey) return null;

  return (
    <div
      className={`journey-bg ${ready ? 'journey-bg--ready' : ''}`}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="journey-bg__video"
        src={sources.journey}
        muted
        playsInline
        // metadata only until the section nears — tiny with faststart, and it
        // keeps video.duration known so the scroll scrub can seek immediately.
        // The observer above upgrades to a full buffer ~800px ahead.
        preload="metadata"
      />
      <div className="journey-bg__scrim" />
      <div className="journey-bg__vignette" />
      <div className="journey-bg__grain" />
    </div>
  );
}
