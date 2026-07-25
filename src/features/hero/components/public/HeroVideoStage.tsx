/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useHeroVideos } from '../../hooks/useHeroVideos';
import '../../styles/video-stage.css';

/**
 * Cinematic hero video layer.
 *
 * Sits full-bleed inside the hero (z 5 — above the ambient glow, below the
 * z-6 typography and z-19/20 ribbons) and runs the avatar video sequence:
 *
 *   intro (walk-in, once per session) → idle loop → [Watch Showreel]
 *   → transformation → fade to black → auto-scroll to Skills → fade in
 *
 * Every clip is optional: the stage only activates for videos that exist in
 * storage (useHeroVideos) and reports its visibility upward so the static
 * ScrollAvatar can yield while a video is on screen. With no videos in the
 * bucket the component renders nothing and the page behaves exactly as
 * before — this is pure progressive enhancement.
 */

type Phase = 'boot' | 'intro' | 'idle' | 'transforming' | 'off';

const INTRO_SEEN_KEY = 'reagan-hero-intro-seen';
/** Scroll depth (in viewport heights) where the stage yields to the static
 *  scroll-avatar choreography — with hysteresis so it never flickers. */
const HIDE_AT_VH = 0.4;
const SHOW_AT_VH = 0.25;
/** Fade-to-black dwell before the hidden jump to the Skills section. */
const BLACKOUT_MS = 700;
const REVEAL_DELAY_MS = 250;

/** Custom event fired by the Watch Showreel button. The stage claims it
 *  (preventDefault) only when the transformation video actually exists. */
export const PLAY_TRANSFORMATION_EVENT = 'reagan:play-transformation';

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    /* private browsing — replaying the intro is harmless */
  }
}

interface HeroVideoStageProps {
  /** Reports whether a video is currently covering the hero avatar spot. */
  onActiveChange?: (active: boolean) => void;
}

export function HeroVideoStage({ onActiveChange }: HeroVideoStageProps) {
  const { sources, ready } = useHeroVideos();

  const [phase, setPhase] = useState<Phase>('boot');
  const [scrolledAway, setScrolledAway] = useState(false);
  const [blackout, setBlackout] = useState(false);

  const introRef = useRef<HTMLVideoElement>(null);
  const idleRef = useRef<HTMLVideoElement>(null);
  const transformRef = useRef<HTMLVideoElement>(null);
  const phaseRef = useRef<Phase>('boot');
  const scrolledAwayRef = useRef(false);

  // Event handlers (scroll, custom events) read the latest values via refs.
  useEffect(() => {
    phaseRef.current = phase;
    scrolledAwayRef.current = scrolledAway;
  }, [phase, scrolledAway]);

  const hasAnyHeroVideo = Boolean(sources.intro || sources.idle);
  const stageRunning = phase !== 'off' && phase !== 'boot';

  // Decide the opening phase once probing settles (next frame, so the state
  // change never cascades inside the effect pass). Desktop pointers only —
  // ≤900px uses the handcrafted mobile hero, and reduced-motion visitors
  // keep the still avatar.
  useEffect(() => {
    if (!ready) return;

    const id = requestAnimationFrame(() => {
      const desktop = window.matchMedia('(min-width: 901px)').matches;
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (!desktop || reduced || !hasAnyHeroVideo) {
        setPhase('off');
        return;
      }

      let introSeen = false;
      try {
        introSeen = sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
      } catch {
        /* ignore */
      }

      if (sources.intro && !introSeen) setPhase('intro');
      else if (sources.idle) setPhase('idle');
      else setPhase('off');
    });

    return () => cancelAnimationFrame(id);
  }, [ready, sources, hasAnyHeroVideo]);

  // Yield to the static scroll choreography once the hero starts leaving.
  useEffect(() => {
    if (!stageRunning) return;

    const onScroll = () => {
      // The transformation owns the screen — scroll can't dismiss it.
      if (phaseRef.current === 'transforming') return;

      const vh = window.innerHeight;
      const y = window.scrollY;
      const away = scrolledAwayRef.current
        ? y >= vh * SHOW_AT_VH
        : y > vh * HIDE_AT_VH;
      if (away === scrolledAwayRef.current) return;

      setScrolledAway(away);
      // Leaving mid-intro counts as seen; returning lands on the idle loop.
      if (away && phaseRef.current === 'intro') {
        markIntroSeen();
        setPhase(sources.idle ? 'idle' : 'off');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [stageRunning, sources.idle]);

  // Watch Showreel → transformation sequence (only if the clip exists).
  useEffect(() => {
    const onPlay = (ev: Event) => {
      if (!sources.transformation) return; // unclaimed — button falls back
      if (phaseRef.current === 'transforming') {
        ev.preventDefault();
        return;
      }
      ev.preventDefault();
      const el = transformRef.current;
      if (el) {
        el.currentTime = 0;
        el.preload = 'auto';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setScrolledAway(false);
      setPhase('transforming');
    };

    window.addEventListener(PLAY_TRANSFORMATION_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_TRANSFORMATION_EVENT, onPlay);
  }, [sources.transformation]);

  // Single source of truth for playback: exactly one clip plays at a time.
  useEffect(() => {
    const players: Partial<Record<Phase, HTMLVideoElement | null>> = {
      intro: introRef.current,
      idle: idleRef.current,
      transforming: transformRef.current,
    };

    for (const el of Object.values(players)) el?.pause();
    if (scrolledAway || phase === 'off' || phase === 'boot') return;

    players[phase]?.play().catch(() => {
      // Autoplay rejection (rare with muted) — fall back to the still avatar.
      if (phaseRef.current === 'intro' || phaseRef.current === 'idle') {
        setPhase('off');
      }
    });
  }, [phase, scrolledAway]);

  // Tell the page whether a video is covering the avatar spot.
  const active =
    phase !== 'off' && phase !== 'boot' && (!scrolledAway || phase === 'transforming');
  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const handleIntroEnded = () => {
    markIntroSeen();
    setPhase(sources.idle ? 'idle' : 'off');
  };

  const handleTransformEnded = () => {
    // Lights out → glide happens behind the black → reveal the Skills section
    setBlackout(true);
    window.setTimeout(() => {
      document
        .querySelector('.brain-section')
        ?.scrollIntoView({ behavior: 'auto' });
      setPhase('off');
      window.setTimeout(() => setBlackout(false), REVEAL_DELAY_MS);
    }, BLACKOUT_MS);
  };

  if (phase === 'off' || phase === 'boot') {
    // Keep the blackout overlay mounted so the reveal fade can animate
    // after the transformation hands the page back to the static system.
    return (
      <div
        className={`hero-video-blackout${blackout ? ' hero-video-blackout--active' : ''}`}
        aria-hidden="true"
      />
    );
  }

  const showIntro = phase === 'intro' && !scrolledAway;
  const showIdle = phase === 'idle' && !scrolledAway;
  const showTransform = phase === 'transforming';

  return (
    <>
      <div
        className={`hero-video-stage${active ? ' hero-video-stage--active' : ''}`}
        aria-hidden="true"
      >
        {sources.intro && (
          <video
            ref={introRef}
            className={`hero-video-stage__video${showIntro ? ' hero-video-stage__video--visible' : ''}`}
            src={sources.intro}
            muted
            playsInline
            preload="auto"
            onEnded={handleIntroEnded}
          />
        )}
        {sources.idle && (
          <video
            ref={idleRef}
            className={`hero-video-stage__video${showIdle ? ' hero-video-stage__video--visible' : ''}`}
            src={sources.idle}
            muted
            playsInline
            loop
            preload="auto"
          />
        )}
        {sources.transformation && (
          <video
            ref={transformRef}
            className={`hero-video-stage__video${showTransform ? ' hero-video-stage__video--visible' : ''}`}
            src={sources.transformation}
            muted
            playsInline
            preload="metadata"
            onEnded={handleTransformEnded}
          />
        )}
      </div>

      <div
        className={`hero-video-blackout${blackout ? ' hero-video-blackout--active' : ''}`}
        aria-hidden="true"
      />
    </>
  );
}
