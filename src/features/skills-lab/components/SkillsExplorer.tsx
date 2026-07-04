/** @format */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadExplorerTree } from '../data/loadExplorerTree';
import type { ExplorerNode as SkillNode } from '../data/explorerTypes';

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ================================================================
   Scene constants — one physical device: platform + mounted orb.
   The orb is visually mounted but NOT a rotation handle — only the
   platform beneath it accepts press/drag/double-tap input.

   The platform deck has two modes, toggled by double-tap:
     nav  — 4 major ticks; drag rotates, clockwise pull = level back
     axis — 3 static button arcs (X / Y / Z); tapping one spins the
            orb 360° on that axis and sets the drift axis; dragging
            only rotates (level navigation is disabled)
   In axis mode the toggle target is the deck's middle ring area.
================================================================ */

const VIEW = 440; // viewBox is -220..220
const P = 1000; // perspective distance
const TILT = 0.38; // fixed downward camera pitch
const R_ORB = 92;
const ORB_CY = 46; // orb center height (world y, up+)
const PLAT_Y = -84; // platform top plane
const PLAT_R = 148;
const PLAT_TH = 16; // platform thickness

const IDLE_W = 0.0022; // idle rotation (anti-clockwise), rad per 16.7ms frame — very slow
const DRAG_K = 0.006; // scene-px → radians
const GESTURE_RAD = 3.4; // ~195° forward drag = enter the front region
const BACK_RAD = 0.7; // ~40° clockwise (against idle) = spin 360° back to previous level
const BACK_FLICK = 0.05; // clockwise release velocity that also triggers the back spin
const TRANSITION_MS = 1250;
const AXIS_SPIN_MS = 1400; // full 360° spin triggered by an axis button

// deck ring layout: one prominent main ring + tightly-spaced depth rings
const RING_MAIN = 0.6;
const RING_DEPTHS = [0.3, 0.38, 0.46];

// axis button arcs (static, do not rotate with the deck)
// circle param α: 0 = front (bottom of the ellipse), grows anticlockwise
const AXIS_SECTIONS = [
  { axis: 0, label: 'X', center: 0 },
  { axis: 1, label: 'Y', center: (Math.PI * 2) / 3 },
  { axis: 2, label: 'Z', center: (Math.PI * 4) / 3 },
];
const ARC_HALF = Math.PI / 3 - 0.06; // 120° sections with a small gap
const ARC_IN = 0.7;
const ARC_OUT = 0.96;

/* ================================================================
   Math helpers
================================================================ */

type V3 = [number, number, number];
type M3 = [number, number, number, number, number, number, number, number, number];

const ct = Math.cos(TILT);
const st = Math.sin(TILT);

const IDENTITY: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/** row-major 3x3 multiply: a·b */
function matMul(a: M3, b: M3): M3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

function matApply(m: M3, v: V3): V3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** rotation about world axis 0=X, 1=Y, 2=Z */
function matRot(axis: number, ang: number): M3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  if (axis === 0) return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 1) return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

/** cheap Gram-Schmidt so accumulated multiplies never drift */
function matRenorm(m: M3): M3 {
  let x: V3 = [m[0], m[3], m[6]];
  let y: V3 = [m[1], m[4], m[7]];
  const xl = Math.hypot(...x) || 1;
  x = [x[0] / xl, x[1] / xl, x[2] / xl];
  const d = y[0] * x[0] + y[1] * x[1] + y[2] * x[2];
  y = [y[0] - d * x[0], y[1] - d * x[1], y[2] - d * x[2]];
  const yl = Math.hypot(...y) || 1;
  y = [y[0] / yl, y[1] / yl, y[2] / yl];
  const z: V3 = [
    x[1] * y[2] - x[2] * y[1],
    x[2] * y[0] - x[0] * y[2],
    x[0] * y[1] - x[1] * y[0],
  ];
  return [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
}

/** platform-space point (already in world coords) → screen */
function projPt(x: number, y: number, z: number, bob: number) {
  const y1 = y + bob;
  const y2 = y1 * ct - z * st;
  const z2 = y1 * st + z * ct;
  const k = P / (P - z2);
  return { x: x * k, y: -y2 * k, z: z2 };
}

/** orb unit direction → screen point at radius R (orientation matrix applied) */
function projOrb(unit: V3, R: number, m: M3, bob: number) {
  const v = matApply(m, unit);
  return projPt(v[0] * R, v[1] * R + ORB_CY, v[2] * R, bob);
}

/** camera-space depth of an oriented direction — for backface culling */
function camZ(unit: V3, m: M3): number {
  const v = matApply(m, unit);
  return v[1] * st + v[2] * ct;
}

const LIGHT: V3 = (() => {
  const l: V3 = [-0.35, 0.55, 0.78];
  const m = Math.hypot(...l);
  return [l[0] / m, l[1] / m, l[2] / m];
})();

/** light intensity for an oriented normal (camera space) */
function lightOf(unit: V3, m: M3): number {
  const v = matApply(m, unit);
  const cy = v[1] * ct - v[2] * st;
  const cz = v[1] * st + v[2] * ct;
  return 0.42 + 0.68 * Math.max(0, v[0] * LIGHT[0] + cy * LIGHT[1] + cz * LIGHT[2]);
}

function inPoly(px: number, py: number, pts: number[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Hover panel content: name, attached tool icons, and a minimal 5-dot rating
 * meter — never a raw percentage (per spec). Rebuilt only when the hovered
 * node changes, not every animation frame.
 */
function buildLabelHTML(node: SkillNode): string {
  const iconHtml = node.icon
    ? `<span class="sl-explorer__label-icon">${escapeHtml(node.icon)}</span>`
    : '';
  const nameHtml = `<span class="sl-explorer__label-name">${iconHtml}${escapeHtml(node.label)}</span>`;

  let toolsHtml = '';
  if (node.tools.length > 0) {
    const parts = node.tools.map((t) => {
      const glyph = t.icon ? `${t.icon} ` : '';
      return `${escapeHtml(glyph)}${escapeHtml(t.name)}`;
    });
    toolsHtml = `<span class="sl-explorer__label-tools">${parts.join(
      ' <span class="sl-explorer__label-sep">·</span> ',
    )}</span>`;
  }

  let meterHtml = '';
  if (node.rating !== null) {
    const filled = Math.round(clamp(node.rating, 0, 5));
    let dots = '';
    for (let i = 0; i < 5; i++) {
      dots += `<span class="sl-explorer__meter-dot${i < filled ? ' sl-explorer__meter-dot--filled' : ''}"></span>`;
    }
    meterHtml = `<span class="sl-explorer__label-meter">${dots}</span>`;
  }

  return `${nameHtml}${toolsHtml}${meterHtml}`;
}

/* ================================================================
   Region mesh — a treemap over the sphere's surface, proportional
   to sibling weights. Alternates horizontal and vertical cuts (like
   a mosaic) instead of pure longitude "orange slices".
================================================================ */

interface Face {
  corners: V3[]; // unit-sphere corners
  normal: V3; // unit centroid direction
  region: number;
}

interface Region {
  node: SkillNode;
  phi0: number;
  phi1: number;
  psi0: number;
  psi1: number;
  centroid: V3; // unit dir for the label anchor
}

interface Mesh {
  regions: Region[];
  faces: Face[];
  boundaries: { region: number; pts: V3[] }[];
}

function sph(psi: number, phi: number): V3 {
  return [Math.cos(psi) * Math.sin(phi), Math.sin(psi), Math.cos(psi) * Math.cos(phi)];
}

interface TreeRect {
  node: SkillNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Recursive proportional-area split: picks the container's longer axis,
 * splits the weighted list at the point that best balances the two
 * halves, and recurses. This alternates vertical and horizontal cuts
 * naturally based on the sub-rectangle's aspect ratio, producing a
 * mosaic of areas sized to weight rather than a single row of "slices".
 */
function treemap(
  items: { node: SkillNode; weight: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  out: TreeRect[]
) {
  if (items.length === 0) return;
  if (items.length === 1) {
    out.push({ node: items[0].node, x, y, w, h });
    return;
  }

  const total = items.reduce((s, it) => s + it.weight, 0);
  let bestK = 1;
  let bestDiff = Infinity;
  let running = 0;
  for (let k = 1; k < items.length; k++) {
    running += items[k - 1].weight;
    const diff = Math.abs(running - total / 2);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestK = k;
    }
  }

  const groupA = items.slice(0, bestK);
  const groupB = items.slice(bestK);
  const wA = groupA.reduce((s, it) => s + it.weight, 0);
  const wB = groupB.reduce((s, it) => s + it.weight, 0);

  if (w >= h) {
    const wa = (w * wA) / (wA + wB);
    treemap(groupA, x, y, wa, h, out);
    treemap(groupB, x + wa, y, w - wa, h, out);
  } else {
    const ha = (h * wA) / (wA + wB);
    treemap(groupA, x, y, w, ha, out);
    treemap(groupB, x, y + ha, w, h - ha, out);
  }
}

const BOUNDARY_STEPS = 8;

function buildMesh(node: SkillNode): Mesh {
  const children = node.children ?? [];
  const items = children.map((c) => ({ node: c, weight: c.weight }));
  const rects: TreeRect[] = [];
  treemap(items, 0, 0, Math.PI * 2, Math.PI, rects);

  const regions: Region[] = rects.map((r) => ({
    node: r.node,
    phi0: -Math.PI + r.x,
    phi1: -Math.PI + r.x + r.w,
    psi0: -Math.PI / 2 + r.y,
    psi1: -Math.PI / 2 + r.y + r.h,
    centroid: sph(-Math.PI / 2 + r.y + r.h / 2, -Math.PI + r.x + r.w / 2),
  }));

  const faces: Face[] = [];
  const boundaries: { region: number; pts: V3[] }[] = [];

  regions.forEach((rg, idx) => {
    const dPhi = rg.phi1 - rg.phi0;
    const dPsi = rg.psi1 - rg.psi0;
    const cols = Math.max(1, Math.round(dPhi / 0.3));
    const rows = Math.max(1, Math.round(dPsi / 0.3));

    for (let ri = 0; ri < rows; ri++) {
      for (let ci = 0; ci < cols; ci++) {
        const pa = rg.phi0 + (dPhi * ci) / cols;
        const pb = rg.phi0 + (dPhi * (ci + 1)) / cols;
        const sa = rg.psi0 + (dPsi * ri) / rows;
        const sb = rg.psi0 + (dPsi * (ri + 1)) / rows;
        const corners = [sph(sa, pa), sph(sa, pb), sph(sb, pb), sph(sb, pa)];
        const n: V3 = [0, 0, 0];
        corners.forEach((p) => {
          n[0] += p[0]; n[1] += p[1]; n[2] += p[2];
        });
        const m = Math.hypot(...n) || 1;
        faces.push({ corners, normal: [n[0] / m, n[1] / m, n[2] / m], region: idx });
      }
    }

    // full rectangle outline — both vertical and horizontal edges, so
    // divisions read clearly as a mosaic even before hovering
    const pts: V3[] = [];
    for (let i = 0; i <= BOUNDARY_STEPS; i++) pts.push(sph(rg.psi1, rg.phi0 + (dPhi * i) / BOUNDARY_STEPS));
    for (let i = 1; i <= BOUNDARY_STEPS; i++) pts.push(sph(rg.psi1 - (dPsi * i) / BOUNDARY_STEPS, rg.phi1));
    for (let i = 1; i <= BOUNDARY_STEPS; i++) pts.push(sph(rg.psi0, rg.phi1 - (dPhi * i) / BOUNDARY_STEPS));
    for (let i = 1; i <= BOUNDARY_STEPS; i++) pts.push(sph(rg.psi0 + (dPsi * i) / BOUNDARY_STEPS, rg.phi0));
    boundaries.push({ region: idx, pts });
  });

  return { regions, faces, boundaries };
}

/* ================================================================
   Component
================================================================ */

type Mode = 'idle' | 'held' | 'dragging';
type PressOrigin = 'platform' | 'orb' | null;
type DeckMode = 'nav' | 'axis';

/** used only while the tree is loading — buildMesh(EMPTY_NODE) yields an empty orb */
const EMPTY_NODE: SkillNode = {
  id: 'empty', label: '', weight: 1, rating: null,
  description: null, icon: null, color: null, tools: [],
};

export function SkillsExplorer() {
  // level stack — internal only; never touches the avatar's context
  const [path, setPath] = useState<SkillNode[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    loadExplorerTree()
      .then((root) => {
        if (cancelled) return;
        setPath([root]);
        setStatus('ready');
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = path.length > 0 ? path[path.length - 1] : EMPTY_NODE;
  const mesh = useMemo(() => buildMesh(current), [current]);

  const svgRef = useRef<SVGSVGElement>(null);
  const platformRef = useRef<SVGGElement>(null);
  const objectRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // ---- physics state (refs — the rAF loop owns these) ----
  const orient = useRef<M3>([...IDENTITY] as M3); // orb orientation
  const platTheta = useRef(0); // deck tick rotation (yaw only — it's a turntable)
  const omega = useRef(IDLE_W);
  const mode = useRef<Mode>('idle');
  const deckMode = useRef<DeckMode>('nav');
  const spinAxis = useRef(1); // 0=X 1=Y 2=Z — drift axis while in axis mode
  const axisSpin = useRef<{ axis: number; t: number } | null>(null); // 360° button spin
  const axisHoverT = useRef<number[]>([0, 0, 0]);
  const axisPress = useRef<number[]>([0, 0, 0]);
  const hoveredAxis = useRef<number | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const drag = useRef({
    lastX: 0, x0: 0, y0: 0, t0: 0, moved: false, accum: 0, vel: 0,
    origin: null as PressOrigin,
  });
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const hovered = useRef<number | null>(null);
  const hoverT = useRef<number[]>([]);
  const lastLabelId = useRef<string | null>(null);
  const pulse = useRef(0);
  const transition = useRef<{
    t: number;
    dir: number;
    next: SkillNode[];
    swapped: boolean;
  } | null>(null);

  // render caches for hit testing (scene coords)
  const visFaces = useRef<{ pts: number[]; region: number }[]>([]);
  const platPoly = useRef<number[]>([]);
  const mainRingPoly = useRef<number[]>([]);
  const axisArcs = useRef<{ pts: number[]; axis: number }[]>([]);

  const meshRef = useRef(mesh);
  meshRef.current = mesh;
  const pathRef = useRef(path);
  pathRef.current = path;
  useEffect(() => {
    hoverT.current = new Array(mesh.regions.length).fill(0);
    hovered.current = null;
  }, [mesh]);

  /* ------------------------- rotation helpers ------------------------- */

  /** yaw the whole mechanism — deck ticks and orb together */
  const applyYaw = (d: number) => {
    platTheta.current += d;
    orient.current = matMul(matRot(1, d), orient.current);
  };

  /** rotate the orb about the current drift axis (deck only follows yaw) */
  const applyAxis = (axis: number, d: number) => {
    orient.current = matMul(matRot(axis, d), orient.current);
    if (axis === 1) platTheta.current += d;
  };

  /* ------------------------- navigation ------------------------- */

  const startTransition = (next: SkillNode[], dir: number) => {
    if (transition.current) return;
    transition.current = { t: 0, dir: dir >= 0 ? 1 : -1, next, swapped: false };
    hovered.current = null;
    mode.current = 'idle';
  };

  const enterRegion = (r: number, dir: number) => {
    const node = meshRef.current.regions[r]?.node;
    if (!node) return;
    if (node.children?.length) {
      startTransition([...pathRef.current, node], dir);
    } else {
      pulse.current = 1; // leaf — a gentle physical "this is the end" pulse
    }
  };

  const popLevel = (dir: number) => {
    if (pathRef.current.length > 1) {
      startTransition(pathRef.current.slice(0, -1), dir);
    }
  };

  const toggleDeckMode = () => {
    deckMode.current = deckMode.current === 'nav' ? 'axis' : 'nav';
    spinAxis.current = 1;
    hoveredAxis.current = null;
    if (svgRef.current) svgRef.current.dataset.mode = deckMode.current;
  };

  /* ------------------------ pointer input ----------------------- */

  const toScene = (e: { clientX: number; clientY: number }) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW - VIEW / 2,
      y: ((e.clientY - rect.top) / rect.height) * VIEW - VIEW / 2,
      scale: VIEW / rect.width,
    };
  };

  const hitRegion = (sx: number, sy: number): number | null => {
    for (const f of visFaces.current) {
      if (inPoly(sx, sy, f.pts)) return f.region;
    }
    return null;
  };

  const hitAxisArc = (sx: number, sy: number): number | null => {
    for (const a of axisArcs.current) {
      if (inPoly(sx, sy, a.pts)) return a.axis;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (transition.current || status !== 'ready') return;
    const s = toScene(e);
    const onOrb = hitRegion(s.x, s.y) !== null;
    const onPlatform = !onOrb && inPoly(s.x, s.y, platPoly.current);

    // the orb is mounted but not a rotation handle — only the platform
    // beneath it accepts press/drag/hold input
    if (!onOrb && !onPlatform) return;

    svgRef.current?.setPointerCapture(e.pointerId);
    drag.current = {
      lastX: s.x, x0: s.x, y0: s.y, t0: performance.now(),
      moved: false, accum: 0, vel: 0,
      origin: onPlatform ? 'platform' : 'orb',
    };
    if (onPlatform) {
      mode.current = 'held'; // press-and-hold pauses the mechanism
      const arc = deckMode.current === 'axis' ? hitAxisArc(s.x, s.y) : null;
      if (arc !== null) axisPress.current[arc] = 1; // press-down flash
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const s = toScene(e);
    pointer.current = { x: s.x, y: s.y };
    if (drag.current.origin !== 'platform') return; // orb presses never rotate anything

    if (mode.current === 'held' || mode.current === 'dragging') {
      const d = drag.current;
      if (!d.moved && Math.hypot(s.x - d.x0, s.y - d.y0) > 6) {
        d.moved = true;
        mode.current = 'dragging';
      }
      if (mode.current === 'dragging') {
        const dTheta = (s.x - d.lastX) * DRAG_K;
        applyYaw(dTheta);
        d.accum += dTheta;
        d.vel = d.vel * 0.75 + dTheta * 0.25;
        d.lastX = s.x;

        // physical navigation is a nav-mode behavior; in axis mode a drag
        // in either direction only rotates the model
        if (deckMode.current === 'nav') {
          // a deliberate clockwise pull (against the idle spin) backs out
          // one level with a full 360° clockwise spin
          if (d.accum <= -BACK_RAD && pathRef.current.length > 1) {
            endDrag(e);
            popLevel(-1);
          } else if (d.accum >= GESTURE_RAD) {
            const front = frontRegion();
            if (front !== null && meshRef.current.regions[front].node.children?.length) {
              endDrag(e);
              enterRegion(front, 1);
            } else {
              d.accum = 0;
              pulse.current = 1;
            }
          }
        }
      }
    }
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    mode.current = 'idle';
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const wasHeld = mode.current === 'held';
    const quick = performance.now() - d.t0 < 400;
    const origin = d.origin;
    endDrag(e);

    if (origin === 'orb') {
      // tapping the orb enters a region; dragging it does nothing physical
      if (quick && !d.moved && !transition.current) {
        const s = toScene(e);
        const w = hitRegion(s.x, s.y);
        if (w !== null) enterRegion(w, omega.current >= 0 ? 1 : -1);
      }
      return;
    }

    if (wasHeld && quick && !transition.current) {
      const s = toScene(e);
      const w = hitRegion(s.x, s.y);
      const now = performance.now();
      const prev = lastTap.current;

      // axis mode: a single tap on an X/Y/Z arc spins the orb 360° on that
      // axis and makes it the drift axis — no double-tap ambiguity because
      // the mode toggle target is the middle-ring area, not the arcs
      if (w === null && deckMode.current === 'axis') {
        const arc = hitAxisArc(s.x, s.y);
        if (arc !== null) {
          lastTap.current = null;
          spinAxis.current = arc;
          if (!axisSpin.current) axisSpin.current = { axis: arc, t: 0 };
          axisPress.current[arc] = 1;
          return;
        }
      }

      // manual double-tap: the SVG is rebuilt every frame, so native
      // click/dblclick never synthesize (press target is destroyed)
      if (prev && now - prev.t < 450 && Math.hypot(s.x - prev.x, s.y - prev.y) < 24) {
        lastTap.current = null;
        if (w === null && inPoly(s.x, s.y, platPoly.current)) {
          // nav mode: double-tap anywhere on the deck enters axis mode.
          // axis mode: only the middle-ring area returns to nav mode.
          if (deckMode.current === 'nav' || inPoly(s.x, s.y, mainRingPoly.current)) {
            toggleDeckMode();
          }
        }
      } else {
        lastTap.current = { t: now, x: s.x, y: s.y };
        if (w !== null) enterRegion(w, omega.current >= 0 ? 1 : -1);
      }
    } else if (d.moved) {
      // heavy release momentum, then ease back to idle drift
      omega.current = clamp(d.vel, -0.085, 0.085);
      // a clockwise flick inside a level also spins back out (nav mode only)
      if (
        deckMode.current === 'nav' &&
        d.vel <= -BACK_FLICK &&
        pathRef.current.length > 1 &&
        !transition.current
      ) {
        popLevel(-1);
      }
    }
  };

  const onPointerLeave = () => {
    pointer.current = null;
    hoveredAxis.current = null;
  };

  /** region most facing the camera — used for the forward-drag "enter" gesture */
  const frontRegion = (): number | null => {
    let best = -Infinity;
    let bestIdx: number | null = null;
    const regions = meshRef.current.regions;
    for (let i = 0; i < regions.length; i++) {
      const z = camZ(regions[i].centroid, orient.current);
      if (z > best) {
        best = z;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  /* -------------------------- render loop ----------------------- */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const frames = dt / 16.7;

      const trans = transition.current;
      let thetaOff = 0;
      let transScale = 1;
      let objOpacity = 1;
      let objBlur = 0;

      if (trans) {
        trans.t = Math.min(1, trans.t + dt / TRANSITION_MS);
        const e = easeInOut(trans.t);
        // a full satisfying turn, following the gesture direction
        thetaOff = e * Math.PI * 2 * trans.dir;
        const wave = Math.sin(Math.PI * trans.t);
        transScale = 1 + 0.2 * wave;
        objOpacity = 1 - 0.55 * wave;
        objBlur = 5 * wave;
        if (trans.t >= 0.5 && !trans.swapped) {
          trans.swapped = true;
          setPath(trans.next);
        }
        if (trans.t >= 1) {
          transition.current = null;
          omega.current = IDLE_W * trans.dir;
        }
      } else if (mode.current === 'held') {
        omega.current *= Math.pow(0.75, frames); // heavy — settles fast under the hand
      } else if (mode.current === 'idle') {
        omega.current += (IDLE_W - omega.current) * (1 - Math.pow(0.975, frames));
        const d = omega.current * frames;
        if (deckMode.current === 'axis') applyAxis(spinAxis.current, d);
        else applyYaw(d);
      }

      // 360° axis-button spin (axis mode)
      const spin = axisSpin.current;
      if (spin) {
        const prevT = spin.t;
        spin.t = Math.min(1, spin.t + dt / AXIS_SPIN_MS);
        const delta = (easeInOut(spin.t) - easeInOut(prevT)) * Math.PI * 2;
        applyAxis(spin.axis, delta);
        if (spin.t >= 1) axisSpin.current = null;
      }

      orient.current = matRenorm(orient.current);

      // render orientation: transition spin is an extra yaw on top
      const orbM =
        thetaOff !== 0 ? matMul(matRot(1, thetaOff), orient.current) : orient.current;
      const deckTh = platTheta.current + thetaOff;
      const bob = Math.sin(now * 0.0011) * 5;
      const m = meshRef.current;
      const depth = pathRef.current.length - 1;
      const isAxisMode = deckMode.current === 'axis';

      // drag feedback (nav mode): pull back = the layer retracts,
      // push forward = it leans in
      let gestureScale = 1;
      let armT = 0;
      if (mode.current === 'dragging' && !isAxisMode) {
        const a = drag.current.accum;
        if (a < 0) gestureScale = 1 - 0.1 * clamp(-a / BACK_RAD, 0, 1);
        else {
          gestureScale = 1 + 0.06 * clamp(a / GESTURE_RAD, 0, 1);
          armT = clamp((a - 1.1) / (GESTURE_RAD - 1.1), 0, 1);
        }
      }
      if (pulse.current > 0) {
        pulse.current = Math.max(0, pulse.current - dt / 450);
        gestureScale += 0.05 * Math.sin(Math.PI * (1 - pulse.current));
      }
      const R = R_ORB * transScale * gestureScale;

      /* ---- hover pick (idle rotation keeps drifting underneath) ---- */
      if (!trans && mode.current !== 'dragging' && pointer.current) {
        hovered.current = hitRegion(pointer.current.x, pointer.current.y);
        hoveredAxis.current =
          isAxisMode && hovered.current === null
            ? hitAxisArc(pointer.current.x, pointer.current.y)
            : null;
      } else if (!pointer.current) {
        hovered.current = null;
        hoveredAxis.current = null;
      }
      const fw = armT > 0 ? frontRegion() : null;
      for (let i = 0; i < m.regions.length; i++) {
        const want =
          hovered.current === i ? 1 : fw === i ? armT * 0.85 : 0;
        const cur = hoverT.current[i] ?? 0;
        hoverT.current[i] = cur + (want - cur) * (1 - Math.pow(0.82, frames));
      }
      for (let i = 0; i < 3; i++) {
        const want = hoveredAxis.current === i ? 1 : 0;
        axisHoverT.current[i] += (want - axisHoverT.current[i]) * (1 - Math.pow(0.8, frames));
        axisPress.current[i] = Math.max(0, axisPress.current[i] - dt / 420);
      }

      /* ----------------------- platform ----------------------- */
      let plat = '';
      const topPts: number[] = [];
      let topPath = '';
      for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const p = projPt(PLAT_R * Math.sin(a), PLAT_Y, PLAT_R * Math.cos(a), bob);
        topPath += `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        if (i < 36) topPts.push(p.x, p.y);
      }
      platPoly.current = topPts;

      // side wall — near arc only
      let wall = '';
      const wallBack: string[] = [];
      for (let i = 0; i <= 18; i++) {
        const a = -Math.PI / 2 + (i / 18) * Math.PI;
        const pt = projPt(PLAT_R * Math.sin(a), PLAT_Y, PLAT_R * Math.cos(a), bob);
        const pb = projPt(PLAT_R * Math.sin(a), PLAT_Y - PLAT_TH, PLAT_R * Math.cos(a), bob);
        wall += `${i ? 'L' : 'M'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        wallBack.unshift(`L${pb.x.toFixed(1)},${pb.y.toFixed(1)}`);
      }
      plat += `<path d="${wall}${wallBack.join('')}Z" fill="url(#slxWall)"/>`;
      plat += `<path d="${topPath}Z" fill="url(#slxTop)" stroke="rgba(242,239,231,0.1)" stroke-width="1"/>`;

      // orb's soft shadow resting on the deck — the only visual hint
      // that the two pieces belong together, never a literal rod
      let orbShadow = '';
      const shR = 78 * gestureScale;
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const p = projPt(shR * Math.sin(a), PLAT_Y + 0.5, shR * Math.cos(a), bob);
        orbShadow += `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }
      plat += `<path d="${orbShadow}Z" fill="url(#slxOrbShadow)"/>`;

      // tightly-spaced depth rings — the device itself shows how deep you are
      RING_DEPTHS.forEach((f, i) => {
        let ring = '';
        for (let j = 0; j <= 30; j++) {
          const a = (j / 30) * Math.PI * 2;
          const p = projPt(PLAT_R * f * Math.sin(a), PLAT_Y + 0.5, PLAT_R * f * Math.cos(a), bob);
          ring += `${j ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }
        const lit = i < depth;
        plat += `<path d="${ring}Z" fill="none" stroke="${
          lit ? 'rgba(245,138,31,0.75)' : 'rgba(242,239,231,0.07)'
        }" stroke-width="${lit ? 1.6 : 1}"/>`;
        if (lit) {
          plat += `<path d="${ring}Z" fill="none" stroke="rgba(245,138,31,0.2)" stroke-width="5"/>`;
        }
      });

      // main ring — the deck's primary ring and the mode toggle target;
      // glows brighter while the axis controls are active
      {
        let ring = '';
        const ringPts: number[] = [];
        for (let j = 0; j <= 36; j++) {
          const a = (j / 36) * Math.PI * 2;
          const p = projPt(
            PLAT_R * RING_MAIN * Math.sin(a),
            PLAT_Y + 0.5,
            PLAT_R * RING_MAIN * Math.cos(a),
            bob,
          );
          ring += `${j ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          if (j < 36) ringPts.push(p.x, p.y);
        }
        mainRingPoly.current = ringPts;
        plat += `<path d="${ring}Z" fill="none" stroke="rgba(245,138,31,${isAxisMode ? 0.28 : 0.14})" stroke-width="6"/>`;
        plat += `<path d="${ring}Z" fill="none" stroke="rgba(245,138,31,${isAxisMode ? 0.9 : 0.45})" stroke-width="1.8"/>`;
      }

      if (isAxisMode) {
        // three static button arcs: X / Y / Z
        const arcs: { pts: number[]; axis: number }[] = [];
        for (const sec of AXIS_SECTIONS) {
          const a0 = sec.center - ARC_HALF;
          const a1 = sec.center + ARC_HALF;
          const hT = axisHoverT.current[sec.axis];
          const pT = axisPress.current[sec.axis];
          let d = '';
          const pts: number[] = [];
          for (let j = 0; j <= 14; j++) {
            const a = a0 + ((a1 - a0) * j) / 14;
            const p = projPt(PLAT_R * ARC_OUT * Math.sin(a), PLAT_Y + 0.5, PLAT_R * ARC_OUT * Math.cos(a), bob);
            d += `${j ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            pts.push(p.x, p.y);
          }
          for (let j = 14; j >= 0; j--) {
            const a = a0 + ((a1 - a0) * j) / 14;
            const p = projPt(PLAT_R * ARC_IN * Math.sin(a), PLAT_Y + 0.5, PLAT_R * ARC_IN * Math.cos(a), bob);
            d += `L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            pts.push(p.x, p.y);
          }
          const active = spinAxis.current === sec.axis;
          const fillA = 0.05 + 0.16 * hT + 0.2 * pT + (active ? 0.05 : 0);
          plat += `<path d="${d}Z" fill="rgba(245,138,31,${fillA.toFixed(3)})" stroke="rgba(223,19,138,${(0.14 + 0.4 * hT + 0.2 * pT).toFixed(3)})" stroke-width="1.1"/>`;

          const mid = sec.center;
          const lp = projPt(
            PLAT_R * ((ARC_IN + ARC_OUT) / 2) * Math.sin(mid),
            PLAT_Y + 0.5,
            PLAT_R * ((ARC_IN + ARC_OUT) / 2) * Math.cos(mid),
            bob,
          );
          const labelA = 0.55 + 0.45 * Math.max(hT, active ? 1 : 0);
          plat += `<text x="${lp.x.toFixed(1)}" y="${lp.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="rgba(${active ? '245,138,31' : '242,239,231'},${labelA.toFixed(2)})" style="letter-spacing:1px">${sec.label}</text>`;

          arcs.push({ pts, axis: sec.axis });
        }
        axisArcs.current = arcs;

        // faint rotating micro-ticks inside the main ring keep the deck alive
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2 + deckTh;
          const r0 = PLAT_R * 0.63;
          const r1 = PLAT_R * 0.675;
          const p0 = projPt(r0 * Math.sin(a), PLAT_Y + 0.5, r0 * Math.cos(a), bob);
          const p1 = projPt(r1 * Math.sin(a), PLAT_Y + 0.5, r1 * Math.cos(a), bob);
          plat += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="rgba(242,239,231,0.1)" stroke-width="1"/>`;
        }
      } else {
        axisArcs.current = [];
        // nav mode: rotating ticks with 4 majors — make the drift tactile
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2 + deckTh;
          const major = i % 6 === 0;
          const r0 = PLAT_R * (major ? 0.74 : 0.8);
          const r1 = PLAT_R * 0.94;
          const p0 = projPt(r0 * Math.sin(a), PLAT_Y + 0.5, r0 * Math.cos(a), bob);
          const p1 = projPt(r1 * Math.sin(a), PLAT_Y + 0.5, r1 * Math.cos(a), bob);
          plat += `<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="${
            major ? 'rgba(245,138,31,0.5)' : 'rgba(242,239,231,0.14)'
          }" stroke-width="${major ? 1.8 : 1}"/>`;
        }
      }

      if (platformRef.current) platformRef.current.innerHTML = plat;

      /* ------------------------- orb -------------------------- */
      let orb = '';
      const vis: { pts: number[]; region: number }[] = [];

      for (const f of m.faces) {
        if (camZ(f.normal, orbM) < 0.02) continue; // backface

        const pts: number[] = [];
        let d = '';
        for (let i = 0; i < f.corners.length; i++) {
          const p = projOrb(f.corners[i], R, orbM, bob);
          pts.push(p.x, p.y);
          d += `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }

        const light = lightOf(f.normal, orbM);
        const alt = f.region % 2 === 0;
        let r = (alt ? 66 : 47) * light;
        let g = (alt ? 35 : 25) * light;
        let b = (alt ? 31 : 23) * light;
        const hT = hoverT.current[f.region] ?? 0;
        if (hT > 0.01) {
          // warm orange surface glow — the whole region, not just edges
          const mix = hT * 0.9;
          r += (245 * light - r) * mix;
          g += (138 * light - g) * mix;
          b += (31 * light - b) * mix;
        }
        const fill = `rgb(${r | 0},${g | 0},${b | 0})`;
        orb += `<path d="${d}Z" fill="${fill}" stroke="${fill}" stroke-width="0.6"/>`;
        vis.push({ pts, region: f.region });
      }

      // region outlines: subtle always-on mosaic lines, brighter pink glow
      // around whichever region is hovered
      for (const bd of m.boundaries) {
        const hT = hoverT.current[bd.region] ?? 0;
        let dSeam = '';
        let drawing = false;
        for (const p3 of bd.pts) {
          if (camZ(p3, orbM) > 0.03) {
            const p = projOrb(p3, R, orbM, bob);
            dSeam += `${drawing ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            drawing = true;
          } else {
            drawing = false;
          }
        }
        if (!dSeam) continue;
        if (hT > 0.05) {
          orb += `<path d="${dSeam}" fill="none" stroke="rgba(223,19,138,${(0.3 * hT).toFixed(2)})" stroke-width="4"/>`;
        }
        orb += `<path d="${dSeam}" fill="none" stroke="rgba(223,19,138,${(0.2 + 0.55 * hT).toFixed(2)})" stroke-width="1.2"/>`;
      }

      visFaces.current = vis;
      if (objectRef.current) {
        objectRef.current.innerHTML = orb;
        objectRef.current.style.opacity = String(objOpacity);
        objectRef.current.style.filter = objBlur > 0.2 ? `blur(${objBlur.toFixed(1)}px)` : 'none';
      }

      /* --------------------- ground shadow -------------------- */
      if (shadowRef.current) {
        const lift = (bob + 5) / 10; // 0..1
        shadowRef.current.setAttribute('rx', String(118 - lift * 10));
        shadowRef.current.setAttribute('ry', String(16 - lift * 3));
        shadowRef.current.style.opacity = String(0.55 - lift * 0.18);
      }

      /* ------------------------ label ------------------------- */
      const lbl = labelRef.current;
      const svg = svgRef.current;
      if (lbl && svg) {
        const hw = hovered.current;
        if (hw !== null && !trans) {
          const rg = m.regions[hw];
          const p = projOrb(rg.centroid, R * 1.22, orbM, bob);
          const px = svg.clientWidth / VIEW;
          // only rebuild the DOM when the hovered node changes — position
          // updates every frame, content doesn't need to
          if (lastLabelId.current !== rg.node.id) {
            lastLabelId.current = rg.node.id;
            lbl.innerHTML = buildLabelHTML(rg.node);
          }
          lbl.style.transform = `translate(-50%, -50%) translate(${(p.x * px).toFixed(1)}px, ${(p.y * px).toFixed(1)}px)`;
          lbl.style.opacity = '1';
        } else {
          lbl.style.opacity = '0';
          lastLabelId.current = null;
        }
        svg.style.cursor =
          mode.current === 'dragging'
            ? 'grabbing'
            : hovered.current !== null || hoveredAxis.current !== null
              ? 'pointer'
              : 'grab';
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------- markup ---------------------------- */

  return (
    <motion.div
      className="sl-explorer"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <div className="sl-explorer__scene">
        <svg
          ref={svgRef}
          viewBox={`-${VIEW / 2} -${VIEW / 2} ${VIEW} ${VIEW}`}
          className="sl-explorer__svg"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          data-mode="nav"
          data-depth={Math.max(0, path.length - 1)}
          aria-label="3D skills explorer — drag the platform to rotate, click a region to enter it, double-tap the platform for axis controls"
        >
          <defs>
            <linearGradient id="slxWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b1a18" />
              <stop offset="100%" stopColor="#150c0b" />
            </linearGradient>
            <radialGradient id="slxTop" cx="42%" cy="38%" r="75%">
              <stop offset="0%" stopColor="#332020" />
              <stop offset="70%" stopColor="#241514" />
              <stop offset="100%" stopColor="#1c100f" />
            </radialGradient>
            <radialGradient id="slxOrbShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.42)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* page-floor shadow — the device floats above it */}
          <ellipse ref={shadowRef} cx="0" cy="186" rx="118" ry="16" fill="rgba(0,0,0,0.5)" style={{ filter: 'blur(9px)' }} />

          <g ref={platformRef} />
          <g ref={objectRef} style={{ willChange: 'opacity, filter' }} />
        </svg>

        {/* the only floating element — appears strictly on hover */}
        <div ref={labelRef} className="sl-explorer__label" aria-hidden />

        <AnimatePresence>
          {status === 'loading' && (
            <motion.div
              className="sl-explorer__status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="sl-explorer__status-dot" />
              Loading the knowledge core…
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              className="sl-explorer__status sl-explorer__status--error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              Couldn&apos;t load the skills data.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
