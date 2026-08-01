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
}

/** natural image aspect: 855 × 2890 */
const IMG_RATIO = 2890 / 855;

/** Portion of the character's height framed inside the 3D card — a tight
 *  head-and-chest portrait rather than the full standing body. */
const CARD_PORTRAIT_FRACTION = 0.34;

/** Fraction of the (scaled) character height cropped ABOVE the card's top
 *  edge, so the top of the hair runs out of frame like a real portrait. */
const CARD_TOP_CROP = 0.05;

/** Portion of the character framed beside the skills section — head down to
 *  the upper thigh, i.e. a half body rather than the full standing figure. */
const SKILLS_PORTRAIT_FRACTION = 0.52;

/** How much of the viewport height that half body fills. Parked (not glued to
 *  the section), so the framing holds for the whole skills scroll. */
const SKILLS_VIEW_FRACTION = 0.78;

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
  /** The Journey's full scroll runway (the sticky track, not the 100vh pane).
   *  The section paints over the character, so the card→skills hand-off is
   *  timed to finish before this runway ends. */
  journey: { top: number; height: number } | null;
  /** The skills section — the character parks beside it as a half body. */
  skills: { top: number; height: number } | null;
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
      const journeyEl = document.querySelector<HTMLElement>('.journey-scroll-track');
      const skillsEl = document.querySelector<HTMLElement>('.brain-section');
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
        journey: journeyEl
          ? { top: docTop(journeyEl), height: journeyEl.offsetHeight }
          : null,
        skills: skillsEl
          ? { top: docTop(skillsEl), height: skillsEl.offsetHeight }
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
  const SPLIT_REST_TILT = 0; // diagonal amount (%) already visible at rest
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

  /* ----- one continuous character: hero → 3D card → skills → contact ----- */

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

  if (marks && marks.card && marks.contact) {
    const { vh, rootW, rootCenterX, card, contact, journey, skills, footerTop } =
      marks;
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
    // Stay glued for as long as ANY part of the card is on screen. Releasing
    // earlier let the character slide out of the card window while the window
    // was still visible — the cover strips only mask the section, not the
    // hole. Ending the dock once the card has fully cleared the viewport top
    // keeps the character strictly inside the card for its whole appearance.
    const sB = card.top + card.height;
    const sC = contact.top - vh * 0.85; // approach contact
    const sEnd = (footerTop ?? contact.top + contact.height) - vh * 0.05;

    // Image top sits ABOVE the card's top edge so the hair is cropped
    const yCardAt = (s: number) => card.top - s - H * kCard * CARD_TOP_CROP;
    const yContactAt = (s: number) =>
      contact.top - s + contact.height / 2 - (H * kContact) / 2;

    const xCard = card.centerX - rootCenterX;
    const xContact = contact.anchorX - rootCenterX;

    // Bottom clip (% of the image) while docked: everything below the card's
    // portrait window folds away, so the body never runs past the frame.
    const visibleFraction = CARD_TOP_CROP + card.height / (H * kCard);
    const bCard = Math.max(0, (1 - visibleFraction) * 100);

    // Skills stop — a half body parked at the lower right. Unlike the card and
    // contact stops this one is NOT glued to the section: the y is a viewport
    // constant, so the framing holds identically for the whole section instead
    // of drifting up and out of frame as it scrolls.
    const kSkills = Math.min(
      1,
      (vh * SKILLS_VIEW_FRACTION) / (H * SKILLS_PORTRAIT_FRACTION),
    );
    const skillsVisibleH = H * kSkills * SKILLS_PORTRAIT_FRACTION;
    const ySkills = vh - skillsVisibleH; // half body standing on the fold
    const bSkills = (1 - SKILLS_PORTRAIT_FRACTION) * 100;

    // The card→skills hand-off is timed to land before the Journey's runway
    // ends, because the Journey paints over the character (z 6) — the whole
    // re-framing happens out of sight and it emerges already composed.
    const journeyEnd = journey
      ? journey.top + journey.height
      : (skills?.top ?? sC);
    const sS0 = Math.max(sB + vh * 0.3, journeyEnd - vh * 0.5);
    const sS1 = skills
      ? Math.max(sS0 + vh * 0.3, skills.top + skills.height - vh * 0.45)
      : sS0 + vh * 0.3;

    const raw = [0, approachStart, sA, sB];
    if (skills) raw.push(sS0, sS1);
    raw.push(sC, sEnd);

    const inputs = mono(raw);
    const iC = inputs.length - 2;
    const iEnd = inputs.length - 1;

    yOut = [0, 0, yCardAt(inputs[2]), yCardAt(inputs[3])];
    sOut = [1, 1, kCard, kCard];
    xOut = [0, 0, xCard, xCard];
    bOut = [0, 0, bCard, bCard];
    if (skills) {
      yOut.push(ySkills, ySkills);
      sOut.push(kSkills, kSkills);
      xOut.push(0, 0); // already right-aligned by the fixed root
      bOut.push(bSkills, bSkills);
    }
    yOut.push(yContactAt(inputs[iC]), yContactAt(inputs[iEnd]));
    sOut.push(kContact, kContact);
    xOut.push(xContact, xContact);
    bOut.push(0, 0);

    yIn = inputs;
    sIn = inputs;
    xIn = inputs;
    bIn = inputs;
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

  // The Journey section needs no opacity ramp: it paints above the character
  // (z 6, see about-journey.css) and simply occludes it while it owns the
  // viewport — no dissolve to mistime, and nothing spills over the footage.
  const avatarOpacity = footerFade;

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
