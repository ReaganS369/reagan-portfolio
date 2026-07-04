/** @format */

'use client';

import React from 'react';
import './kinetic-text-loader.css';

export interface KineticTextLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export default function KineticTextLoader({
  className = '',
  text = 'Loading',
  ...props
}: KineticTextLoaderProps) {
  const letters = text.split('');

  return (
    <div className={`ktl-loading ${className}`} {...props}>
      {/* Moving Dot */}
      <div className="ktl-dot" />

      <p className="ktl-text" aria-label={text}>
        {letters.map((char, index) => {
          // Animate first L
          if (index === 0 && char.toUpperCase() === 'L') {
            return (
              <span key={index} className="ktl-letter ktl-l">
                {char}
              </span>
            );
          }

          // Animate i
          if (index === 4 && char.toLowerCase() === 'i') {
            return (
              <span key={index} className="ktl-letter ktl-i">
                {char === 'i' ? 'ı' : char}
              </span>
            );
          }

          return (
            <span key={index} className="ktl-letter">
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
}
