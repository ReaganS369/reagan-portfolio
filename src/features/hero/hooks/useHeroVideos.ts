/** @format */

'use client';

import { useEffect, useState } from 'react';
import {
  HERO_VIDEOS,
  HERO_VIDEO_DEV_FALLBACKS,
  type HeroVideoKey,
} from '../constants/videos';

export type HeroVideoSources = Partial<Record<HeroVideoKey, string>>;

interface HeroVideosState {
  /** URLs that actually exist in storage — absent keys mean "no video yet" */
  sources: HeroVideoSources;
  /** true once probing has finished (even if nothing was found) */
  ready: boolean;
}

// Probe results are immutable for the life of the tab — cache module-wide so
// remounts (route changes back to Home) never re-issue the HEAD requests.
let cached: HeroVideoSources | null = null;
let pending: Promise<HeroVideoSources> | null = null;

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function probeAvailability(): Promise<HeroVideoSources> {
  const entries = await Promise.all(
    (Object.entries(HERO_VIDEOS) as [HeroVideoKey, string][]).map(
      async ([key, url]) => {
        // Storage is always the primary source.
        if (await headOk(url)) return [key, url] as const;
        // Only if it isn't there yet, a dev-only local fallback may stand in
        // (empty object in production, so the deploy never uses /public).
        const fallback = HERO_VIDEO_DEV_FALLBACKS[key as HeroVideoKey];
        if (fallback && (await headOk(fallback))) {
          return [key, fallback] as const;
        }
        return null;
      },
    ),
  );

  return Object.fromEntries(
    entries.filter((e): e is readonly [HeroVideoKey, string] => e !== null),
  );
}

/** Which cinematic avatar videos exist in the Supabase bucket right now. */
export function useHeroVideos(): HeroVideosState {
  const [state, setState] = useState<HeroVideosState>(() =>
    cached ? { sources: cached, ready: true } : { sources: {}, ready: false },
  );

  useEffect(() => {
    if (cached) return;
    let alive = true;

    pending ??= probeAvailability().then((sources) => {
      cached = sources;
      return sources;
    });

    pending.then((sources) => {
      if (alive) setState({ sources, ready: true });
    });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
