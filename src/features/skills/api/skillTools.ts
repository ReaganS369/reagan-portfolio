/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type SkillToolRow = {
  id: string;
  skill_node_id: string;
  name: string;
  icon: string | null;
  rating: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export type SkillToolInput = {
  skill_node_id: string;
  name: string;
  icon: string | null;
  rating: number | null;
  notes: string | null;
  sort_order: number;
};

export type SkillToolUpdate = Partial<Omit<SkillToolInput, 'skill_node_id'>>;

function sortByOrder(items: SkillToolRow[]): SkillToolRow[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAllSkillTools(): Promise<SkillToolRow[]> {
  const { data, error } = await supabase
    .from('skill_tools')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return sortByOrder(data ?? []);
}

export async function getSkillToolsForNode(skillNodeId: string): Promise<SkillToolRow[]> {
  const { data, error } = await supabase
    .from('skill_tools')
    .select('*')
    .eq('skill_node_id', skillNodeId)
    .order('sort_order');

  if (error) throw error;
  return sortByOrder(data ?? []);
}

export async function createSkillTool(input: SkillToolInput): Promise<SkillToolRow> {
  const { data, error } = await supabase
    .from('skill_tools')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSkillTool(
  id: string,
  input: SkillToolUpdate,
): Promise<SkillToolRow> {
  const { data, error } = await supabase
    .from('skill_tools')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSkillTool(id: string): Promise<void> {
  const { error } = await supabase.from('skill_tools').delete().eq('id', id);
  if (error) throw error;
}

export async function swapSkillToolOrder(
  tools: SkillToolRow[],
  id: string,
  direction: 'up' | 'down',
): Promise<SkillToolRow[]> {
  const sorted = sortByOrder(tools);
  const index = sorted.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Tool not found');

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;

  const current = sorted[index];
  const neighbor = sorted[targetIndex];

  const [updatedCurrent, updatedNeighbor] = await Promise.all([
    updateSkillTool(current.id, { sort_order: neighbor.sort_order }),
    updateSkillTool(neighbor.id, { sort_order: current.sort_order }),
  ]);

  return sortByOrder(
    sorted.map((t) => {
      if (t.id === updatedCurrent.id) return updatedCurrent;
      if (t.id === updatedNeighbor.id) return updatedNeighbor;
      return t;
    }),
  );
}
