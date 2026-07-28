/** @format */

/**
 * One brain mesh mapped to one content card — admin-authored, matched to the
 * GLB at render time by `mesh_name`. Flat by design: no children/tree, unlike
 * the old skill-node hierarchy this replaces.
 */
export interface BrainRegion {
  id: string;
  meshName: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  displayOrder: number;
}
