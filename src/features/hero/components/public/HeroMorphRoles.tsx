/** @format */

/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { getStorageUrl } from '@/src/lib/storage';
import type { HeroRole } from '../../types';

interface HeroMorphRolesProps {
  roles: HeroRole[];
  /** Seconds spent morphing between two roles. */
  morphDuration?: number;
  /** Seconds a role holds fully in view before the next morph starts. */
  cooldownDuration?: number;
}

interface RoleLayer {
  containerRef: React.RefObject<HTMLDivElement | null>;
  iconRef: React.RefObject<HTMLImageElement | null>;
  textRef: React.RefObject<HTMLSpanElement | null>;
  appliedRoleId: React.RefObject<string | null>;
}

function useMorphingRoles(
  roles: HeroRole[],
  morphDuration: number,
  cooldownDuration: number
) {
  const indexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(cooldownDuration);
  const timeRef = useRef<number | null>(null);

  const layer1: RoleLayer = {
    containerRef: useRef(null),
    iconRef: useRef(null),
    textRef: useRef(null),
    appliedRoleId: useRef<string | null>(null),
  };
  const layer2: RoleLayer = {
    containerRef: useRef(null),
    iconRef: useRef(null),
    textRef: useRef(null),
    appliedRoleId: useRef<string | null>(null),
  };

  const applyRole = useCallback((layer: RoleLayer, role: HeroRole) => {
    if (layer.appliedRoleId.current === role.id) return;
    layer.appliedRoleId.current = role.id;

    if (layer.textRef.current) layer.textRef.current.textContent = role.title;
    if (layer.iconRef.current) {
      layer.iconRef.current.src = getStorageUrl(role.icon_url);
    }
  }, []);

  const setStyles = useCallback(
    (fraction: number) => {
      const c1 = layer1.containerRef.current;
      const c2 = layer2.containerRef.current;
      if (!c1 || !c2 || roles.length === 0) return;

      c2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      c2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      c1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      c1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      applyRole(layer1, roles[indexRef.current % roles.length]);
      applyRole(layer2, roles[(indexRef.current + 1) % roles.length]);
    },
    [roles, applyRole, layer1, layer2]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphDuration;

    if (fraction > 1) {
      cooldownRef.current = cooldownDuration;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      indexRef.current++;
    }
  }, [setStyles, morphDuration, cooldownDuration]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const c1 = layer1.containerRef.current;
    const c2 = layer2.containerRef.current;
    if (c1 && c2) {
      c2.style.filter = 'none';
      c2.style.opacity = '100%';
      c1.style.filter = 'none';
      c1.style.opacity = '0%';
    }
  }, [layer1, layer2]);

  useEffect(() => {
    if (roles.length === 0) return;

    // Both layers start on the same role so the initial cooldown hold
    // shows one clean role (layer2 visible, layer1 hidden underneath);
    // layer2 only swaps to the next role once the first morph begins.
    applyRole(layer1, roles[0]);
    applyRole(layer2, roles[0]);

    let animationFrameId: number;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (timeRef.current === null) timeRef.current = now;
      const dt = (now - timeRef.current) / 1000;
      timeRef.current = now;

      cooldownRef.current -= dt;

      if (roles.length > 1) {
        if (cooldownRef.current <= 0) doMorph();
        else doCooldown();
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, doMorph, doCooldown]);

  return { layer1, layer2 };
}

function RoleLayerView({ layer }: { layer: RoleLayer }) {
  return (
    <div
      ref={layer.containerRef}
      className="hero-role-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        opacity: 0,
      }}
    >
      <img
        ref={layer.iconRef}
        alt=""
        aria-hidden="true"
        className="hero-role-icon"
      />
      <span ref={layer.textRef} />
    </div>
  );
}

export function HeroMorphRoles({
  roles,
  morphDuration = 1.2,
  cooldownDuration = 5,
}: HeroMorphRolesProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `morph-hero-${uid}`;

  const { layer1, layer2 } = useMorphingRoles(
    roles,
    morphDuration,
    cooldownDuration
  );

  if (roles.length === 0) return null;

  return (
    <>
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
        className="hero-role-container"
        style={{ filter: `url(#${filterId})` }}
      >
        <RoleLayerView layer={layer1} />
        <RoleLayerView layer={layer2} />
      </div>
    </>
  );
}
