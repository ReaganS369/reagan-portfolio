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

export function ScrollAvatar({ heroRef, profile }: ScrollAvatarProps) {
  // Pixel scroll — used for the split transition (tied to hero height in px)
  const { scrollY, scrollYProgress } = useScroll();

  // Measure hero section height after mount so we know when the split ends.
  // 999999 fallback keeps the split at 50/50 until the measurement is ready.
  const [heroEnd, setHeroEnd] = useState(999999);

  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const measure = () => setHeroEnd(el.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [heroRef]);

  // Casual: left half visible (50% clipped from right) → fully hidden (100%)
  const casualClip = useTransform(scrollY, [0, heroEnd], [50, 100], {
    clamp: true,
  });
  const casualClipPath = useMotionTemplate`inset(0 ${casualClip}% 0 0)`;

  // Formal: right half visible (50% clipped from left) → fully shown (0%)
  const formalClip = useTransform(scrollY, [0, heroEnd], [50, 0], {
    clamp: true,
  });
  const formalClipPath = useMotionTemplate`inset(0 0 0 ${formalClip}%)`;

  // Scale shrinks as user scrolls deeper through sections
  const avatarScale = useTransform(scrollYProgress, [0, 0.85], [1.0, 0.5], {
    clamp: true,
  });

  // Fade out when the footer arrives
  const avatarOpacity = useTransform(scrollYProgress, [0.88, 0.95], [1, 0], {
    clamp: true,
  });

  if (!profile) return null;

  return (
    <motion.div className="scroll-avatar-root" style={{ opacity: avatarOpacity }}>
      <motion.div
        className="scroll-avatar-inner"
        style={{ scale: avatarScale }}
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
