/** @format */

/** A tool attached to a skill — shown only in the hover panel, never a wedge of its own. */
export interface ExplorerTool {
  id: string;
  name: string;
  icon: string | null;
  rating: number | null;
}

/**
 * A node in the 3D Skills Explorer, built entirely from admin-managed rows
 * (see `src/features/skills/api`). `weight` is derived from `rating` at load
 * time — the surface area a node occupies is always weight / sum(siblings'
 * weight), never a hand-entered percentage.
 */
export interface ExplorerNode {
  id: string;
  label: string;
  weight: number;
  rating: number | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  tools: ExplorerTool[];
  children?: ExplorerNode[];
}
