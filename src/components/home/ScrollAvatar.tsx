/** @format */

'use client';

import { RefObject, useState, useLayoutEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'motion/react';
import './scroll-avatar.css';

export interface AvatarProfile {
  casual_avatar: string;
  formal_avatar: string;
}

interface ScrollAvatarProps {
  heroRef: RefObject<HTMLElement | null>;
  profile: AvatarProfile | null;
  /** Hidden while a cinematic hero video covers the avatar spot. */
  suppressed?: boolean;
  /** True when the formal-loop video plays inside the 3D bento card — the
   *  static character hands the card window over to the footage while
   *  docked, re-emerging on the way to the contact section. */
  dockVideoActive?: boolean;
}

/** natural image aspect: 855 × 2890 */
const IMG_RATIO = 2890 / 855;

/** Portion of the character's height framed inside the 3D card — a tight
 *  head-and-chest portrait rather than the full standing body. */
const CARD_PORTRAIT_FRACTION = 0.34;

/** Fraction of the (scaled) character height cropped ABOVE the card's top
 *  edge, so the top of the hair runs out of frame like a real portrait. */
const CARD_TOP_CROP = 0.05;

/** document-space top/left ignoring motion transforms (offset chain) */
function docTop(el: HTMLElement): number {
  let t = 0;
  let e: HTMLElement | null = el;
  while (e) {
    t += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return t;
}

function docLeft(el: HTMLElement): number {
  let l = 0;
  let e: HTMLElement | null = el;
  while (e) {
    l += e.offsetLeft;
    e = e.offsetParent as HTMLElement | null;
  }
  return l;
}

interface PageMarks {
  heroEnd: number;
  vh: number;
  /** fixed-root geometry, derived from the same CSS math as .scroll-avatar-root */
  rootW: number;
  rootCenterX: number;
  card: { top: number; height: number; centerX: number } | null;
  contact: { top: number; height: number; anchorX: number } | null;
  /** The Journey section — the character hides while it owns the viewport so
   *  the full-bleed footage reads clean underneath. */
  about: { top: number; height: number } | null;
  footerTop: number | null;
}

/** keep keyframe inputs strictly increasing (useTransform requirement) */
function mono(values: number[]): number[] {
  const out = [...values];
  for (let i = 1; i < out.length; i++) {
    if (out[i] <= out[i - 1]) out[i] = out[i - 1] + 2;
  }
  return out;
}

export function ScrollAvatar({
  heroRef,
  profile,
  suppressed,
  dockVideoActive,
}: ScrollAvatarProps) {
  // Pixel scroll — every phase below is keyed in document pixels
  const { scrollY, scrollYProgress } = useScroll();

  const [marks, setMarks] = useState<PageMarks | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // mirror the CSS: width clamp(320px, 45vw, 855px), right edge aligned
      // with the hero character column
      const rootW = Math.min(855, Math.max(320, vw * 0.45));
      const container = Math.min(1600, vw * 0.92);
      const rootRight = (vw - container) / 2 - container * 0.0168;
      const rootCenterX = vw - rootRight - rootW / 2;

      const cardEl = document.querySelector<HTMLElement>('.bento-card--3d');
      const contactEl = document.querySelector<HTMLElement>('.contact-cta-section');
      const aboutEl = document.querySelector<HTMLElement>('.about-section');
      const footerEl = document.querySelector<HTMLElement>('.home-footer');

      setMarks({
        heroEnd: hero.offsetHeight,
        vh,
        rootW,
        rootCenterX,
        card: cardEl
          ? {
              top: docTop(cardEl),
              height: cardEl.offsetHeight,
              centerX: docLeft(cardEl) + cardEl.offsetWidth / 2,
            }
          : null,
        contact: contactEl
          ? {
              top: docTop(contactEl),
              height: contactEl.offsetHeight,
              anchorX: docLeft(contactEl) + contactEl.offsetWidth * 0.8,
            }
          : null,
        about: aboutEl
          ? { top: docTop(aboutEl), height: aboutEl.offsetHeight }
          : null,
        footerTop: footerEl ? docTop(footerEl) : null,
      });
    };

    measure();
    // content height shifts as Supabase data arrives — remeasure when the
    // document grows, and once more after everything settles
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    const late = window.setTimeout(measure, 1500);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.clearTimeout(late);
    };
  }, [heroRef]);

  const heroEnd = marks?.heroEnd ?? 999999;

  /* ---------------- hero: casual/formal cinematic split wipe ------------- */

  // One shared boundary line between the two halves. At rest it's already a
  // diagonal cut (top tilts right, bottom tilts left) rather than a plain
  // vertical split — then as scrolling begins the diagonal steepens and the
  // line sweeps left and rides off the image, the casual half dissolving
  // away until only the formal character remains.
  //
  // The rotation pivots around the neck/lower-chin (~SPLIT_PIVOT_FROM% from
  // the image top) rather than mid-image, and the pivot drifts slightly
  // upward as the wipe progresses — combined with the leftward sweep the
  // perceived pivot moves toward the upper-left.
  const SPLIT_REST_TILT = 11; // diagonal amount (%) already visible at rest
  const SPLIT_TILT = 22; // total horizontal drift (%) once fully wiping away
  const SPLIT_PIVOT_FROM = 14; // pivot height (% from top) — neck / lower chin
  const SPLIT_PIVOT_TO = 8; // pivot eases upward as the scroll progresses
  const split = useTransform(scrollY, [0, heroEnd], [50, -SPLIT_TILT], {
    clamp: true,
  });
  const splitTilt = useTransform(
    scrollY,
    [0, heroEnd * 0.35],
    [SPLIT_REST_TILT, SPLIT_TILT],
    { clamp: true },
  );
  const splitPivot = useTransform(
    scrollY,
    [0, heroEnd],
    [SPLIT_PIVOT_FROM, SPLIT_PIVOT_TO],
    { clamp: true },
  );
  const splitTop = useTransform(
    [split, splitTilt, splitPivot] as const,
    ([s, t, p]: number[]) => s + (t * p) / 100,
  );
  const splitBottom = useTransform(
    [split, splitTilt, splitPivot] as const,
    ([s, t, p]: number[]) => s - (t * (100 - p)) / 100,
  );

  /* --------- one continuous character: hero → 3D card → contact ---------- */

  // Keyframes are computed from measured page geometry. Until measurement
  // lands (or if a section is missing) we fall back to the old gentle shrink.
  let yIn = [0, 1];
  let yOut = [0, 0];
  let sIn = [0, 0.85];
  let sOut = [1, 0.5];
  let xIn = [0, 1];
  let xOut = [0, 0];
  let bIn = [0, 1];
  let bOut = [0, 0];
  let useProgressScale = true;
  // Dock hand-off to the formal-loop video (identity when inactive)
  let dockIn = [0, 1];
  let dockOut = [1, 1];

  if (marks && marks.card && marks.contact) {
    const { vh, rootW, rootCenterX, card, contact, footerTop } = marks;
    const H = rootW * IMG_RATIO; // full unscaled character height

    // The 3D card frames a head-and-chest PORTRAIT: scale up until the
    // CARD_PORTRAIT_FRACTION slice of the character fills the card height;
    // everything below runs past the card and is hidden by the black cover.
    const kCard = Math.min(1, card.height / (H * CARD_PORTRAIT_FRACTION));
    // By the contact section the FULL standing body is revealed beside the
    // "let's build something together" copy — fit the whole height there.
    const kContact = Math.min(0.32, (contact.height * 0.8) / H);

    // while these scroll ranges pass, the character is glued to the section
    // (slope −1 keyframes make the fixed element track document content)
    //
    // The dock needs a real approach runway: card.top − 0.8vh usually falls
    // BEFORE the hero's end, and mono() then collapsed the whole hero→card
    // interpolation into a ~2px scroll span — a visible last-frame snap.
    // Instead the approach starts during the late hero scroll and lands on
    // the exact same glued state, guaranteeing ≥0.45vh of interpolation.
    const approachStart = heroEnd * 0.55;
    const sA = Math.max(card.top - vh * 0.8, approachStart + vh * 0.45);
    const sB = card.top + card.height - vh * 0.4; // card scrolls on, release
    const sC = contact.top - vh * 0.85; // approach contact
    const sEnd = (footerTop ?? contact.top + contact.height) - vh * 0.05;

    // Image top sits ABOVE the card's top edge so the hair is cropped
    const yCardAt = (s: number) => card.top - s - H * kCard * CARD_TOP_CROP;
    const yContactAt = (s: number) =>
      contact.top - s + contact.height / 2 - (H * kContact) / 2;

    const xCard = card.centerX - rootCenterX;
    const xContact = contact.anchorX - rootCenterX;

    // Bottom clip (% of the image) while docked: everything below the card's
    // portrait window folds away smoothly on approach and unfolds again on
    // the way to the contact section — one continuous character throughout.
    const visibleFraction = CARD_TOP_CROP + card.height / (H * kCard);
    const bClip = Math.max(0, (1 - visibleFraction) * 100);

    // While the formal-loop video owns the card window, the continuous
    // character dissolves on approach and re-materialises as the card
    // releases — the footage carries the docked portrait instead.
    if (dockVideoActive) {
      dockIn = mono([approachStart, sA, sB, sB + vh * 0.45]);
      dockOut = [1, 0, 0, 1];
    }

    const inputs = mono([0, approachStart, sA, sB, sC, sEnd]);
    yIn = inputs;
    yOut = [0, 0, yCardAt(inputs[2]), yCardAt(inputs[3]), yContactAt(inputs[4]), yContactAt(inputs[5])];
    sIn = inputs;
    sOut = [1, 1, kCard, kCard, kContact, kContact];
    xIn = inputs;
    xOut = [0, 0, xCard, xCard, xContact, xContact];
    bIn = inputs;
    bOut = [0, 0, bClip, bClip, 0, 0];
    useProgressScale = false;
  }

  const avatarY = useTransform(scrollY, yIn, yOut, { clamp: true });
  const avatarX = useTransform(scrollY, xIn, xOut, { clamp: true });
  const avatarScalePx = useTransform(scrollY, sIn, sOut, { clamp: true });
  const bottomClip = useTransform(scrollY, bIn, bOut, { clamp: true });
  const bottomEdge = useTransform(bottomClip, (v: number) => 100 - v);
  // Casual: left of the tilted split line. Formal: right of it. Both share
  // the scroll-driven bottom edge that folds the body away in the 3D card.
  const casualClipPath = useMotionTemplate`polygon(0% 0%, ${splitTop}% 0%, ${splitBottom}% ${bottomEdge}%, 0% ${bottomEdge}%)`;
  const formalClipPath = useMotionTemplate`polygon(${splitTop}% 0%, 100% 0%, 100% ${bottomEdge}%, ${splitBottom}% ${bottomEdge}%)`;
  const avatarScaleFallback = useTransform(scrollYProgress, [0, 0.85], [1.0, 0.5], {
    clamp: true,
  });
  const avatarScale = useProgressScale ? avatarScaleFallback : avatarScalePx;

  // Fade only when the footer arrives — the character stays visible standing
  // beside the contact section
  const fadeStart = marks?.footerTop ? marks.footerTop - (marks.vh ?? 900) * 0.75 : null;
  const fadePx = useTransform(
    scrollY,
    fadeStart !== null ? [fadeStart, fadeStart + (marks!.vh ?? 900) * 0.4] : [0, 1],
    fadeStart !== null ? [1, 0] : [1, 1],
    { clamp: true },
  );
  const fadeFallback = useTransform(scrollYProgress, [0.88, 0.95], [1, 0], { clamp: true });
  const footerFade = fadeStart !== null ? fadePx : fadeFallback;

  // Compose the footer fade with the dock hand-off (1 everywhere when the
  // formal-loop video is absent, so this is a no-op today).
  const dockFade = useTransform(scrollY, dockIn, dockOut, { clamp: true });

  // Hide the traveling character while the Journey section owns the viewport:
  // its full-bleed footage is the subject there, so the avatar fades out on
  // approach and fades back in as the section scrolls away.
  let aboutIn = [0, 1];
  let aboutOut = [1, 1];
  if (marks?.about) {
    const { top, height } = marks.about;
    const vh = marks.vh;
    aboutIn = mono([
      top - vh * 0.55,
      top - vh * 0.1,
      top + height - vh * 0.85,
      top + height - vh * 0.4,
    ]);
    aboutOut = [1, 0, 0, 1];
  }
  const aboutFade = useTransform(scrollY, aboutIn, aboutOut, { clamp: true });

  const avatarOpacity = useTransform(
    [footerFade, dockFade, aboutFade] as const,
    ([a, b, c]: number[]) => a * b * c,
  );

  // Top-down black fade over the split casual/formal avatar — hero only.
  // Fully faded out by the time the hero scrolls away, so it never shows
  // up once the character docks into the 3D card or the contact section.
  const heroFadeOpacity = useTransform(scrollY, [0, heroEnd], [1, 0], {
    clamp: true,
  });

  if (!profile) return null;

  return (
    <motion.div
      className={`scroll-avatar-root${suppressed ? ' scroll-avatar-root--suppressed' : ''}`}
      style={{ opacity: avatarOpacity }}
    >
      <motion.div
        className="scroll-avatar-inner"
        style={{ x: avatarX, y: avatarY, scale: avatarScale }}
      >
        {/* Formal behind — revealed as casual clips away */}
        <motion.img
          src={profile.formal_avatar}
          className="scroll-avatar-img"
          alt=""
          style={{ clipPath: formalClipPath }}
          draggable={false}
        />
        {/* Casual on top — clips to the right as hero scrolls out */}
        <motion.img
          src={profile.casual_avatar}
          className="scroll-avatar-img"
          alt=""
          style={{ clipPath: casualClipPath }}
          draggable={false}
        />
      </motion.div>

      {/* Hero-only top-down fade, black 50% → 0 opacity */}
      <motion.div
        className="scroll-avatar-hero-fade"
        style={{ opacity: heroFadeOpacity }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
