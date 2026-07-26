/** @format */

import { getStorageUrl } from '@/src/lib/storage';

/**
 * Cinematic avatar videos (Higgsfield Seedance renders).
 *
 * The site treats every video as OPTIONAL progressive enhancement: each URL
 * is probed once per session (see useHeroVideos) and the static avatar
 * system remains the source of truth whenever a file is missing. Dropping a
 * finished render into the Supabase bucket at one of these paths lights the
 * corresponding sequence up on the next load — no code change required.
 */
export const HERO_VIDEO_PATHS = {
  /** Video 1 — character walks in from the right, greets, freezes to idle */
  intro: 'videos/hero-intro.mp4',
  /** Video 2 — near-still half-casual/half-formal breathing loop */
  idle: 'videos/hero-idle.mp4',
  /** Video 3 — creative-pipeline flash transformation (casual → formal) */
  transformation: 'videos/hero-transformation.mp4',
  /**
   * Video 5 — uninterrupted journey sequence for the career timeline.
   *
   * This object is the ALL-INTRA scrub build, not the raw render: the timeline
   * seeks it every frame as the visitor scrolls, which only stays smooth when
   * every frame is a keyframe. The untouched master is archived alongside it as
   * videos/journey-source.mp4. Re-encode recipe: scripts/encode-scrub-video.md.
   */
  journey: 'videos/journey.mp4',
} as const;

export type HeroVideoKey = keyof typeof HERO_VIDEO_PATHS;

/** Canonical production sources — Supabase Storage, probed once per session. */
export const HERO_VIDEOS: Record<HeroVideoKey, string> = Object.fromEntries(
  Object.entries(HERO_VIDEO_PATHS).map(([key, path]) => [
    key,
    getStorageUrl(path),
  ]),
) as Record<HeroVideoKey, string>;

/**
 * TEMPORARY dev-only fallbacks. When a render hasn't been promoted to the
 * Supabase bucket yet, the probe (see useHeroVideos) may fall back to a local
 * /public copy — but ONLY outside production, so the deploy always resolves to
 * Storage. To retire a fallback once its file lives in the bucket: delete the
 * entry here and remove public/videos/<file>. Nothing else references these.
 *
 * Currently empty: every video above is served from Storage, so no clip is
 * shipped in /public. Add an entry here only while a new render is still local.
 */
export const HERO_VIDEO_DEV_FALLBACKS: Partial<Record<HeroVideoKey, string>> =
  {};
