/** @format */

'use client';

import { useState } from 'react';
import Magnet from '@/src/components/effects/Magnet';

interface StoryItemProps {
  label: string;
  shortLabel: string;
}

export function StoryItem({ label, shortLabel }: StoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="story-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="story-item__long">{label}</span>
      <span className="story-item__short">
        <Magnet
          disabled={!isHovered}
          padding={2000}
          magnetStrength={6}
          activeTransition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
          inactiveTransition="transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <span>{shortLabel}</span>
        </Magnet>
      </span>
    </span>
  );
}
