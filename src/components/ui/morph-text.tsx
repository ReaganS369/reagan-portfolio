/** @format */

'use client';

import React, { useId } from 'react';

export interface MorphTextProps {
  words?: string[];
  interval?: number;
  fontSize?: string;
  fontFamily?: string;
}

export default function MorphText({
  words = ['CREATE', 'DESIGN', 'DEVELOP'],
  interval = 3000,
  fontSize = 'clamp(3rem, 15vw, 10rem)',
  fontFamily = '"Space Grotesk", sans-serif',
}: MorphTextProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `morph-${uid}`;

  const totalDuration = (interval / 1000) * words.length;
  const wordDuration = interval / 1000;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -9"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: 'relative',
          width: '22ch',
          height: '1.2em',
          fontSize,
          fontWeight: 700,
          fontFamily,
          filter: `url(#${filterId})`,
          overflow: 'visible',
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              opacity: 0,

              animationName: 'morph-word',
              animationDuration: `${totalDuration}s`,
              animationDelay: `${i * wordDuration}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
            }}
          >
            {word}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes morph-word {

          0%{
            opacity:0;
            filter:blur(20px);
            transform:translate(-50%,-50%) scale(.8);
          }

          5%{
            opacity:.5;
            filter:blur(10px);
          }

          15%,35%{
            opacity:1;
            filter:blur(0px);
            transform:translate(-50%,-50%) scale(1);
          }

          45%{
            opacity:.5;
            filter:blur(10px);
          }

          50%,100%{
            opacity:0;
            filter:blur(20px);
            transform:translate(-50%,-50%) scale(1.2);
          }

        }
      `}</style>
    </div>
  );
}
