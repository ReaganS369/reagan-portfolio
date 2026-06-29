/** @format */

'use client';

import { useState } from 'react';
import Magnet from '@/src/components/effects/Magnet';
import { cvRibbonMessages } from '../../constants';
import { MarqueeTrack } from './MarqueeTrack';
import '../../styles/cv-ribbon.css';

export function HeroCVRibbon() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="cv-ribbon"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MarqueeTrack
        messages={cvRibbonMessages}
        className="cv-ribbon__track marquee-track"
      />
      <div className="cv-ribbon__label" aria-hidden="true">
        <Magnet
          disabled={!isHovered}
          padding={2000}
          magnetStrength={6}
          activeTransition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
          inactiveTransition="transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
        >
          <span
            className={`cv-ribbon__label--desktop${isHovered ? ' is-visible' : ''}`}
          >
            CV ↗
          </span>
        </Magnet>
        <span className="cv-ribbon__label--mobile">CV</span>
      </div>
    </div>
  );
}
