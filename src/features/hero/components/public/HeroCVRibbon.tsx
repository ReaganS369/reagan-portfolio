/** @format */

'use client';

import { useState, useRef } from 'react';

import { cvRibbonMessages } from '../../constants';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/cv-ribbon.css';

const CV_CHARS = 'CV'.split('');
// Wait for marquee exit (220ms) + stagger offset of last char + entry duration (200ms) + buffer
const CV_MAGNET_DELAY = 220 + (CV_CHARS.length - 1) * 30 + 250;

export function HeroCVRibbon() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    setIsHovered(true);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
  }

  return (
    <div
      className="cv-ribbon"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ '--glow-delay': `${CV_MAGNET_DELAY}ms` } as React.CSSProperties}
    >
      <MarqueeTrack
        messages={cvRibbonMessages}
        className="cv-ribbon__track marquee-track"
      />
      <div className="cv-ribbon__label" aria-hidden="true">
        <span className="cv-ribbon__label--desktop">
          <span className="cv-ribbon__chars">
            <span className="cv-ribbon__glow" aria-hidden="true">
              <span className="cv-ribbon__glow-blob" />
            </span>
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
        </span>
        <span className="cv-ribbon__label--mobile">CV</span>
      </div>
    </div>
  );
}
