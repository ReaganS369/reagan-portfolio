/** @format */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import KineticTextLoader from '../KineticTextLoader';
import { getStorageUrl } from '@/src/lib/storage';
import './global-loading-overlay.css';

const HOME_PATH = '/';
const MIN_LOADING_MS = 1500;
const FADE_OUT_MS = 350;

/* ===== Cinematic intro (first home visit per session) =====
   The approved intro clip is fetched IN FULL behind the loading screen and
   played from a blob: URL, so playback can never stall or show the browser
   spinner. The loading overlay only lifts once the browser confirms
   stall-free playback (canplaythrough on the fully-local source); the clip
   plays exactly once above the already-rendered Hero, then dissolves into
   it and is removed from the DOM. */
const INTRO_VIDEO_URL = getStorageUrl('videos/introA.mp4');
const INTRO_WATCHED_KEY = 'reagan-intro-watched';
/** Give up preloading after this long and load the page normally. */
const INTRO_PRELOAD_TIMEOUT_MS = 15000;
const INTRO_FADE_OUT_MS = 1250;

/* Set to true to freeze the splash video on its final frame for layout alignment. */
const DEBUG_FREEZE_SPLASH = false;

type IntroPhase = 'inactive' | 'preloading' | 'ready' | 'playing' | 'zooming' | 'fading';

function markIntroWatched() {
  try {
    sessionStorage.setItem(INTRO_WATCHED_KEY, '1');
  } catch {
    /* private browsing — replaying on the next load is harmless */
  }
}

interface LoadingContextValue {
  reportHomeReady: () => void;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

/** Called by the Home page once its real data has finished loading. */
export function useReportHomeReady() {
  const ctx = useContext(LoadingContext);
  return ctx?.reportHomeReady ?? (() => {});
}

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === HOME_PATH;

  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const startRef = useRef(Date.now());
  const readyRef = useRef(false);
  const hiddenRef = useRef(false);
  const scheduleTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  const [introPhase, setIntroPhase] = useState<IntroPhase>('inactive');
  const [introSrc, setIntroSrc] = useState<string | null>(null);
  const introPhaseRef = useRef<IntroPhase>('inactive');
  const introSrcRef = useRef<string | null>(null);
  const introAttemptedRef = useRef(false);
  const pendingHideRef = useRef(false);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const introFadeTimeoutRef = useRef<number | null>(null);

  const setIntro = useCallback((phase: IntroPhase) => {
    introPhaseRef.current = phase;
    setIntroPhase(phase);
  }, []);

  // The single place that hides the overlay: fade out, then unmount. When
  // the intro is still buffering, the hide is parked and re-fired the moment
  // the clip is playable (or preloading is abandoned).
  const hide = useCallback(() => {
    if (hiddenRef.current) return;

    if (introPhaseRef.current === 'preloading') {
      pendingHideRef.current = true;
      return;
    }

    hiddenRef.current = true;

    if (introPhaseRef.current === 'ready') {
      // Reveal the intro beneath the lifting overlay. The clip opens on the
      // same dark backdrop the overlay uses, so the crossfade is seamless.
      setIntro('playing');
      const video = introVideoRef.current;
      if (video) {
        if (DEBUG_FREEZE_SPLASH) {
          video.currentTime = 999999; // Seek to end
        } else {
          video.play().then(() => {
            // At 2.2s, trigger the zoom animation (video keeps playing)
            window.setTimeout(() => {
              if (introPhaseRef.current === 'playing') {
                setIntro('zooming');
                
                // After 3.5s (longest animation is zoom which takes 3.5s), dissolve into the Hero
                introFadeTimeoutRef.current = window.setTimeout(() => {
                  if (introPhaseRef.current === 'zooming') {
                    markIntroWatched();
                    setIntro('fading');
                    introFadeTimeoutRef.current = window.setTimeout(() => {
                      setIntro('inactive');
                    }, INTRO_FADE_OUT_MS);
                  }
                }, 3500);
              }
            }, 1500);
          }).catch(() => {
            // Autoplay rejection — dissolve straight into the Hero.
            setIntro('fading');
            introFadeTimeoutRef.current = window.setTimeout(() => {
              setIntro('inactive');
            }, INTRO_FADE_OUT_MS);
          });
        }
      }
    }

    setFading(true);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, FADE_OUT_MS);
  }, [setIntro]);

  // Abandon the intro (fetch error / timeout) and release any parked hide.
  const skipIntro = useCallback(() => {
    if (
      introPhaseRef.current !== 'preloading' &&
      introPhaseRef.current !== 'ready'
    ) {
      return;
    }
    setIntro('inactive');
    if (pendingHideRef.current) {
      pendingHideRef.current = false;
      hide();
    }
  }, [hide, setIntro]);

  // First home visit per session (desktop, full motion): preload the entire
  // intro clip behind the loading screen. Runs once for the app's lifetime.
  useEffect(() => {
    if (introAttemptedRef.current || !isHome) return;
    introAttemptedRef.current = true;

    const desktop = window.matchMedia('(min-width: 901px)').matches;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let watched = false;
    // try {
    //   watched = sessionStorage.getItem(INTRO_WATCHED_KEY) === '1';
    // } catch {
    //   /* ignore */
    // }
    // if (!desktop || reduced || watched) return;
    if (!desktop || reduced) return;

    setIntro('preloading');

    const abort = new AbortController();
    const timeout = window.setTimeout(() => {
      abort.abort();
      skipIntro();
    }, INTRO_PRELOAD_TIMEOUT_MS);

    fetch(INTRO_VIDEO_URL, { signal: abort.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`intro fetch ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        window.clearTimeout(timeout);
        const url = URL.createObjectURL(blob);
        introSrcRef.current = url;
        setIntroSrc(url);
        // canplaythrough on the blob-backed <video> flips the phase to
        // 'ready' and releases any parked hide.
      })
      .catch(() => {
        window.clearTimeout(timeout);
        skipIntro();
      });

    return () => window.clearTimeout(timeout);
  }, [isHome, setIntro, skipIntro]);

  // Fully-local source is decodable end to end — the intro may now start.
  const handleIntroCanPlay = useCallback(() => {
    if (introPhaseRef.current !== 'preloading') return;
    setIntro('ready');
    if (pendingHideRef.current) {
      pendingHideRef.current = false;
      hide();
    }
  }, [hide, setIntro]);



  // Release the blob once the intro has left the DOM.
  useEffect(() => {
    if (introPhase !== 'inactive' || !introSrcRef.current) return;
    URL.revokeObjectURL(introSrcRef.current);
    introSrcRef.current = null;
    setIntroSrc(null);
  }, [introPhase]);

  // loading time = MAX(page loading time, MIN_LOADING_MS)
  const scheduleHide = useCallback(() => {
    if (scheduleTimeoutRef.current !== null) return;
    const remaining = MIN_LOADING_MS - (Date.now() - startRef.current);
    scheduleTimeoutRef.current = window.setTimeout(hide, Math.max(0, remaining));
  }, [hide]);

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    scheduleHide();
  }, [scheduleHide]);

  const reportHomeReady = useCallback(() => {
    markReady();
  }, [markReady]);

  // Show the overlay for every route change (and the initial load), then
  // wait for the page to be ready before scheduling the hide.
  useEffect(() => {
    startRef.current = Date.now();
    readyRef.current = false;
    hiddenRef.current = false;
    if (scheduleTimeoutRef.current !== null) {
      window.clearTimeout(scheduleTimeoutRef.current);
      scheduleTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    setFading(false);
    setVisible(true);

    if (isHome) {
      // Home reports readiness itself once its data has loaded (see
      // reportHomeReady above), which always fires even on fetch failure.
      return undefined;
    }

    // Every other route: ready as soon as the new page has painted.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(markReady);
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, isHome, markReady]);

  useEffect(() => {
    return () => {
      if (scheduleTimeoutRef.current !== null) {
        window.clearTimeout(scheduleTimeoutRef.current);
      }
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
      if (introFadeTimeoutRef.current !== null) {
        window.clearTimeout(introFadeTimeoutRef.current);
      }
      if (introSrcRef.current) {
        URL.revokeObjectURL(introSrcRef.current);
      }
    };
  }, []);

  const introOnScreen = introPhase === 'playing';

  useEffect(() => {
    if (!visible && !introOnScreen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, introOnScreen]);

  const introMounted = introPhase !== 'inactive' && introSrc !== null;
  const introLayerClass =
    introPhase === 'playing'
      ? 'global-intro-layer global-intro-layer--active'
      : introPhase === 'zooming'
        ? 'global-intro-layer global-intro-layer--active global-intro-layer--zooming'
        : introPhase === 'fading'
          ? 'global-intro-layer global-intro-layer--active global-intro-layer--leaving'
          : 'global-intro-layer';

  return (
    <LoadingContext.Provider value={{ reportHomeReady }}>
      {introMounted && (
        <div className={introLayerClass} aria-hidden="true">
          <video
            ref={introVideoRef}
            className="global-intro-layer__video"
            src={introSrc}
            muted
            playsInline
            preload="auto"
            onCanPlayThrough={handleIntroCanPlay}
          />
        </div>
      )}
      {visible && (
        <div
          className={`global-loading-overlay ${fading ? '' : 'global-loading-overlay--visible'}`}
          aria-hidden="true"
        >
          <KineticTextLoader text="Loading" />
        </div>
      )}
      {children}
      {/* Temp grid lines for alignment. Remove when done. */}
      <div className="temp-grid-lines" aria-hidden="true" />
    </LoadingContext.Provider>
  );
}
