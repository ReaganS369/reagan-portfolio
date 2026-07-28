/** @format */

import type { SkillTreeNode } from '@/src/features/skills/lib/tree';
import { ALLOCATION_ORDER, REGION_SLOTS } from '../data/brainRegions';

/** Matches the explorer: an un-rated node still gets a fair sliver. */
const MIN_WEIGHT = 0.5;

export function nodeWeight(node: SkillTreeNode): number {
  return node.rating && node.rating > 0 ? node.rating : MIN_WEIGHT;
}

export interface RegionAllocation {
  /** region id -> the node that owns it. Every slot is owned when there is ≥1 node. */
  ownerByRegion: Map<string, SkillTreeNode>;
  /** node id -> the region ids it owns, in allocation order. */
  regionsByNode: Map<string, string[]>;
  /** node id -> share of the brain, 0-1. */
  shareByNode: Map<string, number>;
  /** Nodes that got no lobe because the level has more children than the artwork has parts. */
  overflow: SkillTreeNode[];
}

/**
 * Projects one level of the skill tree onto the brain's parts.
 *
 * Slots are handed out by largest remainder on `rating`, with a floor of one
 * slot per node, and assigned as contiguous runs in `ALLOCATION_ORDER` — so a
 * bigger rating literally occupies more of the brain, and two evenly-rated
 * children land as a clean left half / right half.
 *
 * The artwork has a fixed number of parts, so a level with more children than
 * parts puts the lowest-rated ones in `overflow`: they stay fully visible and
 * clickable in the side list, they just don't claim a lobe. Rate them up (or
 * split them under another parent) to pull them onto the brain.
 */
export function allocateRegions(nodes: SkillTreeNode[]): RegionAllocation {
  const empty: RegionAllocation = {
    ownerByRegion: new Map(),
    regionsByNode: new Map(),
    shareByNode: new Map(),
    overflow: [],
  };
  if (nodes.length === 0) return empty;

  // Which children earn a lobe: the heaviest ones, but keep author sort order
  // for anything that touches layout or reading order.
  const ranked = [...nodes].sort((a, b) => nodeWeight(b) - nodeWeight(a));
  const lobed = new Set(ranked.slice(0, REGION_SLOTS).map((n) => n.id));
  const visible = nodes.filter((n) => lobed.has(n.id));
  const overflow = nodes.filter((n) => !lobed.has(n.id));

  const total = visible.reduce((sum, n) => sum + nodeWeight(n), 0);
  const exact = visible.map((n) => (nodeWeight(n) / total) * REGION_SLOTS);

  // Floor of 1, then distribute what's left by largest fractional remainder.
  const counts = visible.map(() => 1);
  let remaining = REGION_SLOTS - visible.length;

  const above = exact.map((e) => Math.max(0, e - 1));
  const aboveTotal = above.reduce((s, v) => s + v, 0);

  if (remaining > 0 && aboveTotal > 0) {
    const shares = above.map((v) => (v / aboveTotal) * remaining);
    shares.forEach((s, i) => {
      const whole = Math.floor(s);
      counts[i] += whole;
      remaining -= whole;
    });
    const byRemainder = shares
      .map((s, i) => ({ i, frac: s - Math.floor(s) }))
      .sort((a, b) => b.frac - a.frac);
    for (const { i } of byRemainder) {
      if (remaining <= 0) break;
      counts[i] += 1;
      remaining -= 1;
    }
  }
  // Anything still unassigned (all weights equal at the floor) goes round-robin.
  for (let i = 0; remaining > 0; i = (i + 1) % counts.length) {
    counts[i] += 1;
    remaining -= 1;
  }

  const ownerByRegion = new Map<string, SkillTreeNode>();
  const regionsByNode = new Map<string, string[]>();
  const shareByNode = new Map<string, number>();

  let cursor = 0;
  visible.forEach((node, i) => {
    const ids = ALLOCATION_ORDER.slice(cursor, cursor + counts[i]);
    cursor += counts[i];
    ids.forEach((id) => ownerByRegion.set(id, node));
    regionsByNode.set(node.id, ids);
    shareByNode.set(node.id, ids.length / REGION_SLOTS);
  });

  for (const node of overflow) {
    regionsByNode.set(node.id, []);
    shareByNode.set(node.id, 0);
  }

  return { ownerByRegion, regionsByNode, shareByNode, overflow };
}

/* Colour is deliberately NOT part of the allocation: the brain is painted in a
   single amber, and only the hovered part turns magenta. Giving each skill its
   own hue made eight touching lobes compete for attention and buried the one
   thing hover is meant to say. Tints live in brain-skills.css. */
