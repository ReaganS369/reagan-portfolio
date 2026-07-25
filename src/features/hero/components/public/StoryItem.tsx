/** @format */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';


interface StoryItemProps {
  label: string;
  shortLabel: string;
  href: string;
}

export function StoryItem({ label, shortLabel, href }: StoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chars = shortLabel.split('');
  // Wait for exit (200ms) + stagger offset of last char + entry duration (200ms) + buffer
  const magnetDelay = 200 + (chars.length - 1) * 30 + 250;

  function handleEnter() {
    setIsHovered(true);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
  }

  return (
    <Link
      href={href}
      className="story-item"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ '--glow-delay': `${magnetDelay}ms` } as React.CSSProperties}
    >
      <span className="story-item__long">{label}</span>
      <span className="story-item__short">
        <span className="story-item__chars">
          <span className="story-item__glow" aria-hidden="true">
            <span className="story-item__glow-blob" />
          </span>
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
      </span>
    </Link>
  );
}
