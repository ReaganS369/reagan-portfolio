/** @format */

'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import './page-avatar.css';

interface Profile {
  casual_avatar: string;
  formal_avatar: string;
}

export function PageAvatar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { scrollYProgress } = useScroll();

  // Fade in after hero exits, fade out in footer
  const rootOpacity = useTransform(
    scrollYProgress,
    [0.17, 0.22, 0.87, 0.94],
    [0, 1, 1, 0],
    { clamp: true },
  );

  // Phase 1 (0.22→0.60): clip-path reveals body from head down
  // 82% clipped → 0% clipped (head only → full image height)
  const clipBottom = useTransform(scrollYProgress, [0.22, 0.60], [82, 0], {
    clamp: true,
  });
  const clipPath = useMotionTemplate`inset(0 0 ${clipBottom}% 0)`;

  // Phase 2 (0.60→0.87): scale zoom-out to reveal full body in viewport
  const avatarScale = useTransform(scrollYProgress, [0.60, 0.87], [1.0, 0.45], {
    clamp: true,
  });

  // Casual → Formal crossfade (About → Testimonials)
  const casualOpacity = useTransform(scrollYProgress, [0.35, 0.70], [1, 0], {
    clamp: true,
  });
  const formalOpacity = useTransform(scrollYProgress, [0.35, 0.70], [0, 1], {
    clamp: true,
  });

  useEffect(() => {
    supabase
      .from('profiles')
      .select('casual_avatar, formal_avatar')
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, []);

  if (!profile) return null;

  return (
    <motion.div className="page-avatar-root" style={{ opacity: rootOpacity }}>
      <motion.div
        className="page-avatar-inner"
        style={{ clipPath, scale: avatarScale }}
      >
        {/* Formal sits below; fades in as casual fades out */}
        <motion.img
          src={profile.formal_avatar}
          className="page-avatar-img"
          style={{ opacity: formalOpacity }}
          alt=""
          draggable={false}
        />
        {/* Casual sits on top initially */}
        <motion.img
          src={profile.casual_avatar}
          className="page-avatar-img"
          style={{ opacity: casualOpacity }}
          alt=""
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
