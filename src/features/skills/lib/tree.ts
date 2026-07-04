/** @format */

import type { SkillNodeRow } from '../api/skillNodes';

export type SkillTreeNode = SkillNodeRow & { children: SkillTreeNode[] };

/** Groups flat rows into a nested tree, sorted by sort_order at every level. */
export function buildSkillTree(rows: SkillNodeRow[]): SkillTreeNode[] {
  const byId = new Map<string, SkillTreeNode>();
  for (const row of rows) byId.set(row.id, { ...row, children: [] });

  const roots: SkillTreeNode[] = [];
  for (const row of rows) {
    const node = byId.get(row.id)!;
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRec = (list: SkillTreeNode[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order);
    list.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

/** All descendant ids of a node (not including itself) — used to block cyclic moves. */
export function getDescendantIds(nodeId: string, rows: SkillNodeRow[]): Set<string> {
  const byParent = new Map<string, SkillNodeRow[]>();
  for (const r of rows) {
    if (!r.parent_id) continue;
    const list = byParent.get(r.parent_id) ?? [];
    list.push(r);
    byParent.set(r.parent_id, list);
  }

  const out = new Set<string>();
  const walk = (id: string) => {
    for (const child of byParent.get(id) ?? []) {
      out.add(child.id);
      walk(child.id);
    }
  };
  walk(nodeId);
  return out;
}

export function getSiblings(node: SkillNodeRow, rows: SkillNodeRow[]): SkillNodeRow[] {
  return rows.filter((r) => r.parent_id === node.parent_id);
}

/** Un-rated (or zero-rated) nodes still get a fair sliver instead of vanishing. */
const MIN_WEIGHT = 0.5;

function toWeight(rating: number | null): number {
  return rating && rating > 0 ? rating : MIN_WEIGHT;
}

/**
 * Read-only preview of the surface area a node would occupy in the 3D
 * explorer, purely derived from sibling ratings — never stored, never
 * hand-entered. Admin-facing only, so the operator can see the effect of a
 * rating change without percentages ever becoming a field to edit.
 */
export function computeSharePercent(node: SkillNodeRow, siblings: SkillNodeRow[]): number {
  const total = siblings.reduce((s, n) => s + toWeight(n.rating), 0);
  if (total <= 0) return 0;
  return (toWeight(node.rating) / total) * 100;
}

/** Keeps a node if its name matches, or any descendant matches — preserves ancestor context. */
export function filterTreeForSearch(nodes: SkillTreeNode[], query: string): SkillTreeNode[] {
  const q = query.toLowerCase();
  const out: SkillTreeNode[] = [];
  for (const n of nodes) {
    const children = filterTreeForSearch(n.children, query);
    if (n.name.toLowerCase().includes(q) || children.length > 0) {
      out.push({ ...n, children });
    }
  }
  return out;
}
