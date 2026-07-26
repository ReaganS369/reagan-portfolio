/** @format */

'use client';

import { RefObject, useState, useRef } from 'react';
import { motion, type MotionStyle } from 'motion/react';

import { cvRibbonMessages } from '../../constants';
import { useRibbonRotate } from '../../hooks/useRibbonRotate';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/cv-ribbon.css';

const CV_CHARS = 'CV'.split('');
// Wait for marquee exit (220ms) + stagger offset of last char + entry duration (200ms) + buffer
const CV_MAGNET_DELAY = 220 + (CV_CHARS.length - 1) * 30 + 250;

interface HeroCVRibbonProps {
  heroRef?: RefObject<HTMLElement | null>;
}

export function HeroCVRibbon({ heroRef }: HeroCVRibbonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Matches `top: 18px` in cv-ribbon.css. Shedding the full offset lands this
  // ribbon exactly on top of the story ribbon, so the two read as one bar
  // until the docked width animation splits it open.
  const { rotate, y, docked } = useRibbonRotate(heroRef, 7, 18);

  function handleEnter() {
    setIsHovered(true);
  }

  function handleLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsHovered(false);
  }

  return (
    <motion.div
      className={`cv-ribbon${docked ? ' cv-ribbon--docked' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={
        {
          '--glow-delay': `${CV_MAGNET_DELAY}ms`,
          rotate,
          y,
        } as MotionStyle
      }
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
    </motion.div>
  );
}
