/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type Experience = {
  id: string;
  company: string;
  position: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  sort_order: number;
  created_at: string;
};

export type ExperienceInput = {
  company: string;
  position: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  sort_order: number;
};

export type ExperienceUpdate = Partial<ExperienceInput>;

function sortByOrder(items: Experience[]): Experience[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getExperience(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return sortByOrder(data ?? []);
}

export async function createExperience(input: ExperienceInput): Promise<Experience> {
  const { data, error } = await supabase
    .from('experience')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateExperience(
  id: string,
  input: ExperienceUpdate,
): Promise<Experience> {
  const { data, error } = await supabase
    .from('experience')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExperience(id: string): Promise<void> {
  const { error } = await supabase.from('experience').delete().eq('id', id);
  if (error) throw error;
}

export async function swapExperienceOrder(
  items: Experience[],
  id: string,
  direction: 'up' | 'down',
): Promise<Experience[]> {
  const sorted = sortByOrder(items);
  const index = sorted.findIndex((item) => item.id === id);

  if (index === -1) throw new Error('Entry not found');

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;

  const current = sorted[index];
  const neighbor = sorted[targetIndex];

  const [updatedCurrent, updatedNeighbor] = await Promise.all([
    updateExperience(current.id, { sort_order: neighbor.sort_order }),
    updateExperience(neighbor.id, { sort_order: current.sort_order }),
  ]);

  return sortByOrder(
    sorted.map((item) => {
      if (item.id === updatedCurrent.id) return updatedCurrent;
      if (item.id === updatedNeighbor.id) return updatedNeighbor;
      return item;
    }),
  );
}
