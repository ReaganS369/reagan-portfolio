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
import './global-loading-overlay.css';

const HOME_PATH = '/';
const MIN_LOADING_MS = 1500;
const FADE_OUT_MS = 350;

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

  // The single place that hides the overlay: fade out, then unmount.
  const hide = useCallback(() => {
    if (hiddenRef.current) return;
    hiddenRef.current = true;
    setFading(true);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, FADE_OUT_MS);
  }, []);

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
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <LoadingContext.Provider value={{ reportHomeReady }}>
      {visible && (
        <div
          className={`global-loading-overlay ${fading ? '' : 'global-loading-overlay--visible'}`}
          aria-hidden="true"
        >
          <KineticTextLoader text="Loading" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}
