/** @format */

'use client';

import { useState, useRef } from 'react';
import Magnet from '@/src/components/effects/Magnet';

interface StoryItemProps {
  label: string;
  shortLabel: string;
}

export function StoryItem({ label, shortLabel }: StoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chars = shortLabel.split('');
  // Wait for exit (200ms) + stagger offset of last char + entry duration (200ms) + buffer
  const magnetDelay = 200 + (chars.length - 1) * 30 + 250;

  function handleEnter() {
    setIsHovered(true);
    timerRef.current = setTimeout(() => setIsMagnetActive(true), magnetDelay);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
    setIsMagnetActive(false);
  }

  return (
    <span
      className="story-item"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="story-item__long">{label}</span>
      <span className="story-item__short">
        <Magnet
          disabled={!isMagnetActive}
          padding={2000}
          magnetStrength={6}
          activeTransition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
          inactiveTransition="transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <span className="story-item__chars">
            {chars.map((char, i) => (
              <span
                key={i}
                className="story-item__char"
                style={{ '--char-index': i } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        </Magnet>
      </span>
    </span>
  );
}
