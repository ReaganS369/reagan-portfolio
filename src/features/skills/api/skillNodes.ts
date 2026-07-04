/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type SkillNodeRow = {
  id: string;
  parent_id: string | null;
  level: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  rating: number | null;
  sort_order: number;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SkillNodeInput = {
  parent_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  rating: number | null;
  sort_order: number;
  is_active: boolean;
  notes: string | null;
};

export type SkillNodeUpdate = Partial<SkillNodeInput>;

function sortByOrder(items: SkillNodeRow[]): SkillNodeRow[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

/** Fetches the entire tree flat — callers build hierarchy client-side. */
export async function getAllSkillNodes(): Promise<SkillNodeRow[]> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return sortByOrder(data ?? []);
}

export async function createSkillNode(
  input: SkillNodeInput,
  parentLevel: number | null,
): Promise<SkillNodeRow> {
  const level = parentLevel === null ? 0 : parentLevel + 1;
  const { data, error } = await supabase
    .from('skill_nodes')
    .insert({ ...input, level })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSkillNode(
  id: string,
  input: SkillNodeUpdate,
): Promise<SkillNodeRow> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/** Moves a node to a new parent, recalculating its (and its descendants') level. */
export async function moveSkillNode(
  node: SkillNodeRow,
  allNodes: SkillNodeRow[],
  newParentId: string | null,
): Promise<SkillNodeRow[]> {
  const newParent = newParentId ? allNodes.find((n) => n.id === newParentId) : null;
  const newLevel = newParent ? newParent.level + 1 : 0;
  const delta = newLevel - node.level;

  const { data: updatedNode, error } = await supabase
    .from('skill_nodes')
    .update({ parent_id: newParentId, level: newLevel })
    .eq('id', node.id)
    .select('*')
    .single();

  if (error) throw error;

  // cascade the level shift to descendants so Level stays accurate everywhere
  const byParent = new Map<string, SkillNodeRow[]>();
  for (const n of allNodes) {
    if (!n.parent_id) continue;
    const list = byParent.get(n.parent_id) ?? [];
    list.push(n);
    byParent.set(n.parent_id, list);
  }

  const descendants: SkillNodeRow[] = [];
  const collect = (id: string) => {
    for (const child of byParent.get(id) ?? []) {
      descendants.push(child);
      collect(child.id);
    }
  };
  collect(node.id);

  const updatedDescendants = delta !== 0
    ? await Promise.all(
        descendants.map(async (d) => {
          const { data, error: descError } = await supabase
            .from('skill_nodes')
            .update({ level: d.level + delta })
            .eq('id', d.id)
            .select('*')
            .single();
          if (descError) throw descError;
          return data as SkillNodeRow;
        }),
      )
    : descendants;

  const updatedIds = new Set([updatedNode.id, ...updatedDescendants.map((d) => d.id)]);
  return sortByOrder([
    ...allNodes.filter((n) => !updatedIds.has(n.id)),
    updatedNode,
    ...updatedDescendants,
  ]);
}

export async function deleteSkillNode(id: string): Promise<void> {
  const { error } = await supabase.from('skill_nodes').delete().eq('id', id);
  if (error) throw error;
}

/** Reorders a node among its siblings (same parent_id). */
export async function swapSkillNodeOrder(
  siblings: SkillNodeRow[],
  id: string,
  direction: 'up' | 'down',
): Promise<SkillNodeRow[]> {
  const sorted = sortByOrder(siblings);
  const index = sorted.findIndex((n) => n.id === id);
  if (index === -1) throw new Error('Node not found among siblings');

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;

  const current = sorted[index];
  const neighbor = sorted[targetIndex];

  const [updatedCurrent, updatedNeighbor] = await Promise.all([
    updateSkillNode(current.id, { sort_order: neighbor.sort_order }),
    updateSkillNode(neighbor.id, { sort_order: current.sort_order }),
  ]);

  return sortByOrder(
    sorted.map((n) => {
      if (n.id === updatedCurrent.id) return updatedCurrent;
      if (n.id === updatedNeighbor.id) return updatedNeighbor;
      return n;
    }),
  );
}
