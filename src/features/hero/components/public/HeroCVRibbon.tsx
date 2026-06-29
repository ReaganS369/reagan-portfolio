/** @format */

'use client';

import { useState, useRef } from 'react';
import Magnet from '@/src/components/effects/Magnet';
import { cvRibbonMessages } from '../../constants';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/cv-ribbon.css';

const CV_CHARS = 'CV ↗'.split('');
// Wait for marquee exit (220ms) + stagger offset of last char + entry duration (200ms) + buffer
const CV_MAGNET_DELAY = 220 + (CV_CHARS.length - 1) * 30 + 250;

export function HeroCVRibbon() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    setIsHovered(true);
    timerRef.current = setTimeout(() => setIsMagnetActive(true), CV_MAGNET_DELAY);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
    setIsMagnetActive(false);
  }

  return (
    <div
      className="cv-ribbon"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <MarqueeTrack
        messages={cvRibbonMessages}
        className="cv-ribbon__track marquee-track"
      />
      <div className="cv-ribbon__label" aria-hidden="true">
        <Magnet
          disabled={!isMagnetActive}
          padding={2000}
          magnetStrength={6}
          activeTransition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
          inactiveTransition="transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <span className="cv-ribbon__label--desktop">
            {CV_CHARS.map((char, i) => (
              <span
                key={i}
                className={`cv-ribbon__char${isHovered ? ' is-visible' : ''}`}
                style={{ '--char-index': i } as React.CSSProperties}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </span>
        </Magnet>
        <span className="cv-ribbon__label--mobile">CV</span>
      </div>
    </div>
  );
}
