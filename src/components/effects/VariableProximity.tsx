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

interface VariableProximityProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: 'linear' | 'gaussian' | 'exponential';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  style?: CSSProperties;
}

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId: number;

    const loop = () => {
      callback();
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [callback]);
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
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = 'linear',
      className = '',
      onClick,
      style,
      ...restProps
    } = props;

    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const interpolatedSettingsRef = useRef<string[]>([]);

    const mousePositionRef = useMousePositionRef(containerRef);

    const lastPositionRef = useRef({
      x: null as number | null,
      y: null as number | null,
    });

    const parsedSettings = useMemo(() => {
      const parseSettings = (settingsStr: string) =>
        new Map(
          settingsStr
            .split(',')
            .map((s) => s.trim())
            .map((s) => {
              const [name, value] = s.split(' ');

              return [name.replace(/['"]/g, ''), parseFloat(value)];
            }),
        );

      const fromSettings = parseSettings(fromFontVariationSettings);
      const toSettings = parseSettings(toFontVariationSettings);

      return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: toSettings.get(axis) ?? fromValue,
      }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const calculateFalloff = (distance: number) => {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);

      switch (falloff) {
        case 'exponential':
          return norm ** 2;

        case 'gaussian':
          return Math.exp(-((distance / (radius / 2)) ** 2) / 2);

        default:
          return norm;
      }
    };

    useAnimationFrame(() => {
      if (!containerRef?.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const { x, y } = mousePositionRef.current;

      if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
        return;
      }

      lastPositionRef.current = { x, y };

      letterRefs.current.forEach((letterRef, index) => {
        if (!letterRef) return;

        const rect = letterRef.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2 - containerRect.left;

        const centerY = rect.top + rect.height / 2 - containerRect.top;

        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        const strength = calculateFalloff(distance);

        const weight =
          parsedSettings[0].fromValue +
          (parsedSettings[0].toValue - parsedSettings[0].fromValue) * strength;

        const variation = `'${parsedSettings[0].axis}' ${weight}`;

        interpolatedSettingsRef.current[index] = variation;

        letterRef.style.fontVariationSettings = variation;
      });
    });

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

              return (
                <motion.span
                  key={currentLetterIndex}
                  ref={(el) => {
                    letterRefs.current[currentLetterIndex] = el;
                  }}
                  style={{
                    display: 'inline-block',
                    fontVariationSettings:
                      interpolatedSettingsRef.current[currentLetterIndex],
                  }}
                  aria-hidden="true"
                >
                  {letter}
                </motion.span>
              );
            })}

            {wordIndex < words.length - 1 && (
              <span style={{ display: 'inline-block' }}>&nbsp;</span>
            )}
          </span>
        ))}

        <span className="sr-only">{label}</span>
      </span>
    );
  },
);

VariableProximity.displayName = 'VariableProximity';

export default VariableProximity;
