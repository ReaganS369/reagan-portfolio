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
}

/** natural image aspect: 855 × 2890 */
const IMG_RATIO = 2890 / 855;

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

export function ScrollAvatar({ heroRef, profile }: ScrollAvatarProps) {
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

  /* ------------- hero: casual/formal 50-50 split (unchanged) ------------- */

  // Casual: left half visible (50% clipped from right) → fully hidden (100%)
  const casualClip = useTransform(scrollY, [0, heroEnd], [50, 100], { clamp: true });
  const casualClipPath = useMotionTemplate`inset(0 ${casualClip}% 0 0)`;

  // Formal: right half visible (50% clipped from left) → fully shown (0%)
  const formalClip = useTransform(scrollY, [0, heroEnd], [50, 0], { clamp: true });
  const formalClipPath = useMotionTemplate`inset(0 0 0 ${formalClip}%)`;

  /* --------- one continuous character: hero → 3D card → contact ---------- */

  // Keyframes are computed from measured page geometry. Until measurement
  // lands (or if a section is missing) we fall back to the old gentle shrink.
  let yIn = [0, 1];
  let yOut = [0, 0];
  let sIn = [0, 0.85];
  let sOut = [1, 0.5];
  let xIn = [0, 1];
  let xOut = [0, 0];
  let useProgressScale = true;

  if (marks && marks.card && marks.contact) {
    const { vh, rootW, rootCenterX, card, contact, footerTop } = marks;
    const H = rootW * IMG_RATIO; // full unscaled character height

    // fit the whole character inside the modeling card…
    const kCard = Math.min(1, (card.height * 0.94) / H);
    // …then keep shrinking — smallest by the contact section
    const kContact = kCard * 0.7;

    // while these scroll ranges pass, the character is glued to the section
    // (slope −1 keyframes make the fixed element track document content)
    const sA = card.top - vh * 0.8; // docking begins as the card rises
    const sB = card.top + card.height - vh * 0.4; // card scrolls on, release
    const sC = contact.top - vh * 0.85; // approach contact
    const sEnd = (footerTop ?? contact.top + contact.height) - vh * 0.05;

    const yCardAt = (s: number) => card.top - s + card.height * 0.03;
    const yContactAt = (s: number) =>
      contact.top - s + contact.height / 2 - (H * kContact) / 2;

    const xCard = card.centerX - rootCenterX;
    const xContact = contact.anchorX - rootCenterX;

    const inputs = mono([0, heroEnd, sA, sB, sC, sEnd]);
    yIn = inputs;
    yOut = [0, 0, yCardAt(inputs[2]), yCardAt(inputs[3]), yContactAt(inputs[4]), yContactAt(inputs[5])];
    sIn = inputs;
    sOut = [1, 1, kCard, kCard, kContact, kContact];
    xIn = inputs;
    xOut = [0, 0, xCard, xCard, xContact, xContact];
    useProgressScale = false;
  }

  const avatarY = useTransform(scrollY, yIn, yOut, { clamp: true });
  const avatarX = useTransform(scrollY, xIn, xOut, { clamp: true });
  const avatarScalePx = useTransform(scrollY, sIn, sOut, { clamp: true });
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
  const avatarOpacity = fadeStart !== null ? fadePx : fadeFallback;

  if (!profile) return null;

  return (
    <motion.div className="scroll-avatar-root" style={{ opacity: avatarOpacity }}>
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
    </motion.div>
  );
}
