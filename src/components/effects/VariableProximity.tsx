/** @format */

import React, {
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  CSSProperties,
} from 'react';
import { motion } from 'motion/react';
import './VariableProximity.css';

export interface EntranceAnimation {
  letterDuration?: number; // seconds each letter takes
  staggerDelay?: number; // seconds between each letter
  wordGap?: number; // extra pause after first word completes before second begins
}

interface VariableProximityProps {
  label: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  style?: CSSProperties;
  entrance?: EntranceAnimation | null;
}

function useMousePositionRef(
  containerRef?: React.RefObject<HTMLElement | null>,
) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();

        positionRef.current = {
          x: x - rect.left,
          y: y - rect.top,
        };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY);
    };

    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];

      if (!touch) return;

      updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>(
  (props, ref) => {
    const {
      label,
      containerRef,
      className = '',
      onClick,
      style,
      entrance,
      ...restProps
    } = props;

    // Mouse position is tracked for potential future proximity effects.
    useMousePositionRef(containerRef);

    // Pre-compute per-letter entrance delays, accounting for word gaps
    const entranceDelays = useMemo<number[]>(() => {
      if (!entrance) return [];

      const dur = entrance.letterDuration ?? 0.5;
      const stag = entrance.staggerDelay ?? 0.08;
      const gap = entrance.wordGap ?? 0.2;

      const wordList = label.split(' ');
      const delays: number[] = [];
      let wordStartDelay = 0;

      wordList.forEach((word, wordIndex) => {
        const chars = word.split('');
        let visibleCount = 0;

        chars.forEach((char) => {
          // Newlines are invisible — give them the same delay as the next visible letter
          delays.push(wordStartDelay + visibleCount * stag);
          if (char !== '\n' && char !== '\r') {
            visibleCount++;
          }
        });

        // Advance start delay past this word's completion before next word begins
        if (wordIndex < wordList.length - 1) {
          const wordFinish =
            wordStartDelay + Math.max(0, visibleCount - 1) * stag + dur;
          wordStartDelay = wordFinish + gap;
        }
      });

      return delays;
    }, [label, entrance]);

    // Stable motion props — only computed once (entrance config is constant)
    const entranceInitial = useMemo(
      () =>
        entrance
          ? { rotateX: 90, y: 20, opacity: 0, filter: 'blur(8px)' }
          : undefined,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const entranceAnimate = useMemo(
      () =>
        entrance
          ? { rotateX: 0, y: 0, opacity: 1, filter: 'blur(0px)' }
          : undefined,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const words = label.split(' ');

    let letterIndex = 0;

    return (
      <span
        ref={ref}
        className={`${className} variable-proximity`}
        onClick={onClick}
        style={{ display: 'inline', ...style }}
        {...restProps}
      >
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            {word.split('').map((letter) => {
              const currentLetterIndex = letterIndex++;
              const delay = entranceDelays[currentLetterIndex] ?? 0;

              return (
                <motion.span
                  key={currentLetterIndex}
                  style={{ display: 'inline-block' }}
                  aria-hidden="true"
                  initial={entranceInitial}
                  animate={entranceAnimate}
                  transition={
                    entrance
                      ? {
                          duration: entrance.letterDuration ?? 0.5,
                          delay,
                          ease: [0.2, 0.65, 0.3, 0.9] as [
                            number,
                            number,
                            number,
                            number,
                          ],
                        }
                      : undefined
                  }
                  transformTemplate={
                    entrance ? (_, t) => `perspective(600px) ${t}` : undefined
                  }
                >
                  {letter}
                </motion.span>
              );
            })}
          </span>
        ))}

        <span className="sr-only">{label}</span>
      </span>
    );
  },
);

VariableProximity.displayName = 'VariableProximity';

export default VariableProximity;
