/** @format */

'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, useSpring, useAnimationFrame, AnimatePresence } from 'motion/react';
import { BODY_REGIONS, getRegion } from '../data/skillsData';
import type { BodyRegion, RegionId, SkillNode } from '../data/skillsData';
import { useSkillsLab } from '../SkillsLabContext';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const VB = { x: 0, y: 0, w: 600, h: 900 };

/* ------------------------------------------------------------------ */
/*  Zone bubble layout — largest node centered, rest on an ellipse     */
/* ------------------------------------------------------------------ */

interface Zone {
  node: SkillNode;
  cx: number;
  cy: number;
  r: number;
}

function layoutZones(region: BodyRegion): Zone[] {
  const { x, y, w: fw, h: fh } = region.focus;
  const cx = x + fw / 2;
  const cy = y + fh / 2;
  // widen flat rects so rings have vertical room for labels
  const w = Math.max(fw, fh * 0.9);
  const h = Math.max(fh, fw * 0.75);
  const base = Math.min(w, h);
  const sorted = [...region.nodes].sort((a, b) => b.weight - a.weight);

  return sorted.map((node, i) => {
    const r = base * (0.075 + node.weight * 0.011);
    if (i === 0) return { node, cx, cy, r };
    // offset start angle so no label sits exactly beside the center one
    const angle =
      ((i - 1) / (sorted.length - 1)) * Math.PI * 2 - Math.PI / 2 + Math.PI / 7;
    // alternate between two ellipse rings so neighboring labels don't collide
    const ringScale = i % 2 === 0 ? 0.48 : 0.3;
    const rx = w * ringScale;
    const ry = h * ringScale;
    return {
      node,
      cx: cx + Math.cos(angle) * rx,
      cy: cy + Math.sin(angle) * ry,
      r: r * 0.75,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Placeholder body — relaxed stance, arms slightly open              */
/* ------------------------------------------------------------------ */

interface HotspotDef {
  id: RegionId;
  shape: 'circle' | 'rect';
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rx?: number;
}

const HOTSPOTS: HotspotDef[] = [
  { id: 'head', shape: 'circle', cx: 300, cy: 110, r: 62 },
  { id: 'eyes', shape: 'rect', x: 262, y: 88, w: 76, h: 26, rx: 13 },
  { id: 'ears', shape: 'rect', x: 228, y: 92, w: 20, h: 34, rx: 10 },
  { id: 'mouth', shape: 'rect', x: 272, y: 134, w: 56, h: 22, rx: 11 },
  { id: 'neck', shape: 'rect', x: 278, y: 172, w: 44, h: 40, rx: 12 },
  { id: 'shoulders', shape: 'rect', x: 190, y: 212, w: 220, h: 46, rx: 23 },
  { id: 'heart', shape: 'circle', cx: 322, cy: 300, r: 34 },
  { id: 'torso', shape: 'rect', x: 232, y: 258, w: 136, h: 200, rx: 40 },
  { id: 'hands', shape: 'rect', x: 100, y: 470, w: 90, h: 76, rx: 30 },
  { id: 'legs', shape: 'rect', x: 230, y: 470, w: 140, h: 270, rx: 44 },
  { id: 'feet', shape: 'rect', x: 200, y: 760, w: 200, h: 60, rx: 26 },
];

function PlaceholderBody({ dim }: { dim: boolean }) {
  return (
    <g className={`sl-body ${dim ? 'sl-body--dim' : ''}`}>
      {/* pedestal */}
      <ellipse cx="300" cy="830" rx="190" ry="26" className="sl-body__pedestal" />
      {/* legs — relaxed, slightly apart */}
      <rect x="242" y="460" width="50" height="290" rx="25" className="sl-body__part" transform="rotate(3 267 605)" />
      <rect x="308" y="460" width="50" height="290" rx="25" className="sl-body__part" transform="rotate(-3 333 605)" />
      {/* feet */}
      <rect x="212" y="762" width="80" height="34" rx="17" className="sl-body__part" />
      <rect x="312" y="762" width="80" height="34" rx="17" className="sl-body__part" />
      {/* torso */}
      <rect x="232" y="252" width="136" height="216" rx="46" className="sl-body__part sl-body__torso" />
      {/* arms — slightly open, welcoming */}
      <rect x="176" y="242" width="42" height="220" rx="21" className="sl-body__part" transform="rotate(14 197 352)" />
      <rect x="382" y="242" width="42" height="220" rx="21" className="sl-body__part" transform="rotate(-14 403 352)" />
      {/* hands */}
      <circle cx="132" cy="500" r="30" className="sl-body__part" />
      <circle cx="468" cy="500" r="30" className="sl-body__part" />
      {/* shoulders */}
      <rect x="196" y="214" width="208" height="44" rx="22" className="sl-body__part" />
      {/* neck */}
      <rect x="280" y="168" width="40" height="44" rx="14" className="sl-body__part" />
      {/* head */}
      <circle cx="300" cy="110" r="58" className="sl-body__part sl-body__head" />
      {/* face hints */}
      <circle cx="278" cy="100" r="7" className="sl-body__face" />
      <circle cx="322" cy="100" r="7" className="sl-body__face" />
      <rect x="284" y="136" width="32" height="10" rx="5" className="sl-body__face" />
      {/* ears */}
      <rect x="234" y="96" width="12" height="26" rx="6" className="sl-body__face" />
      <rect x="354" y="96" width="12" height="26" rx="6" className="sl-body__face" />
      {/* heart glow */}
      <circle cx="322" cy="300" r="16" className="sl-body__heart" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage                                                              */
/* ------------------------------------------------------------------ */

export function AvatarStage() {
  const { region, path, focusRegion, pushNode, reset } = useSkillsLab();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<RegionId | null>(null);

  const active = region ? getRegion(region) : null;

  // cinematic camera — springs on the viewBox
  const spring = { stiffness: 60, damping: 16, mass: 1 };
  const camX = useSpring(VB.x, spring);
  const camY = useSpring(VB.y, spring);
  const camW = useSpring(VB.w, spring);
  const camH = useSpring(VB.h, spring);

  const target = useMemo(() => {
    if (!active) return VB;
    const { x, y, w, h } = active.focus;
    // pad the focus rect and preserve aspect ratio (600:900)
    const pad = Math.max(w, h) * 0.45;
    let fw = w + pad * 2;
    let fh = h + pad * 2;
    const aspect = VB.w / VB.h;
    if (fw / fh > aspect) fh = fw / aspect;
    else fw = fh * aspect;
    return { x: x + w / 2 - fw / 2, y: y + h / 2 - fh / 2, w: fw, h: fh };
  }, [active]);

  camX.set(target.x);
  camY.set(target.y);
  camW.set(target.w);
  camH.set(target.h);

  useAnimationFrame(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute(
      'viewBox',
      `${camX.get()} ${camY.get()} ${camW.get()} ${camH.get()}`
    );
  });

  const zones = active ? layoutZones(active) : [];

  return (
    <div className="sl-stage">
      {/* ambient parallax blobs (CSS-driven float, camera adds depth) */}
      <div className="sl-stage__ambient" aria-hidden>
        <span className="sl-blob sl-blob--a" />
        <span className="sl-blob sl-blob--b" />
        <span className="sl-blob sl-blob--c" />
      </div>

      <motion.div
        className="sl-stage__frame"
        animate={{ filter: region ? 'saturate(1.1)' : 'saturate(1)' }}
      >
        <motion.svg
          ref={svgRef}
          viewBox="0 0 600 900"
          className="sl-stage__svg"
          role="img"
          aria-label="Interactive skills avatar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <defs>
            <radialGradient id="sl-halo" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(245,138,31,0.14)" />
              <stop offset="100%" stopColor="rgba(245,138,31,0)" />
            </radialGradient>
            <filter id="sl-soft-blur" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <ellipse cx="300" cy="420" rx="280" ry="380" fill="url(#sl-halo)" />

          {/* breathing */}
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PlaceholderBody dim={!!region} />

            {/* hotspots */}
            {!region &&
              HOTSPOTS.map((hs) => {
                const common = {
                  className: `sl-hotspot ${hovered === hs.id ? 'sl-hotspot--hover' : ''}`,
                  onMouseEnter: () => setHovered(hs.id),
                  onMouseLeave: () => setHovered(null),
                  onClick: () => focusRegion(hs.id),
                };
                return hs.shape === 'circle' ? (
                  <circle key={hs.id} {...common} cx={hs.cx} cy={hs.cy} r={hs.r} />
                ) : (
                  <rect key={hs.id} {...common} x={hs.x} y={hs.y} width={hs.w} height={hs.h} rx={hs.rx} />
                );
              })}

            {/* hover label */}
            <AnimatePresence>
              {!region && hovered && (
                <HoverLabel key={hovered} id={hovered} />
              )}
            </AnimatePresence>

            {/* zoomed region: capability zones */}
            <AnimatePresence mode="wait">
              {active && (
                <motion.g
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                  style={{
                    transformOrigin: `${active.focus.x + active.focus.w / 2}px ${
                      active.focus.y + active.focus.h / 2
                    }px`,
                  }}
                >
                  {/* backdrop plate for the zone map (brain / tongue / palm...) */}
                  <rect
                    x={active.focus.x - active.focus.w * 0.12}
                    y={active.focus.y - active.focus.h * 0.12}
                    width={active.focus.w * 1.24}
                    height={active.focus.h * 1.24}
                    rx={Math.min(active.focus.w, active.focus.h) * 0.3}
                    className="sl-zonemap__plate"
                  />
                  {zones.map((z, i) => (
                    <motion.g
                      key={z.node.id}
                      className={`sl-zone ${
                        path[0] === z.node.id ? 'sl-zone--active' : ''
                      }`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: EASE }}
                      style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
                      onClick={() => focusRegion(active.id, [z.node.id])}
                    >
                      <motion.g
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 3 + (i % 3),
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{ transformOrigin: `${z.cx}px ${z.cy}px` }}
                      >
                        <circle cx={z.cx} cy={z.cy} r={z.r} className="sl-zone__bubble" />
                      </motion.g>
                      <text
                        x={z.cx}
                        y={z.cy}
                        className="sl-zone__label"
                        style={{ fontSize: Math.max(7, z.r * 0.28) }}
                      >
                        {z.node.label}
                      </text>
                    </motion.g>
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          </motion.g>
        </motion.svg>
      </motion.div>

      {/* region title + back control */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="sl-stage__hud"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <button className="sl-back" onClick={reset}>
              ← Full body
            </button>
            <div className="sl-stage__hud-title">
              <span className="sl-stage__hud-region">{active.label}</span>
              <span className="sl-stage__hud-tagline">{active.tagline}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* vertical region rail */}
      <nav className="sl-rail" aria-label="Body regions">
        {BODY_REGIONS.map((r) => (
          <button
            key={r.id}
            className={`sl-rail__dot ${region === r.id ? 'sl-rail__dot--active' : ''}`}
            onClick={() => (region === r.id ? reset() : focusRegion(r.id))}
            title={r.label}
          >
            <span className="sl-rail__label">{r.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HoverLabel({ id }: { id: RegionId }) {
  const r = getRegion(id);
  const hs = HOTSPOTS.find((h) => h.id === id)!;
  const cx = hs.shape === 'circle' ? hs.cx! : hs.x! + hs.w! / 2;
  const cy = (hs.shape === 'circle' ? hs.cy! - hs.r! : hs.y!) - 18;
  return (
    <motion.g
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25, ease: EASE }}
      pointerEvents="none"
    >
      <text x={cx} y={cy} className="sl-hoverlabel">
        {r.label} · {r.tagline}
      </text>
    </motion.g>
  );
}
