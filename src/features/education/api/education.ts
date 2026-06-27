/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type EducationInput = {
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
  description: string | null;
  sort_order: number;
};

export type EducationUpdate = Partial<EducationInput>;

function sortByOrder(items: Education[]): Education[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getEducation(): Promise<Education[]> {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return sortByOrder(data ?? []);
}

export async function createEducation(input: EducationInput): Promise<Education> {
  const { data, error } = await supabase
    .from('education')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateEducation(
  id: string,
  input: EducationUpdate,
): Promise<Education> {
  const { data, error } = await supabase
    .from('education')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEducation(id: string): Promise<void> {
  const { error } = await supabase.from('education').delete().eq('id', id);
  if (error) throw error;
}

export async function swapEducationOrder(
  items: Education[],
  id: string,
  direction: 'up' | 'down',
): Promise<Education[]> {
  const sorted = sortByOrder(items);
  const index = sorted.findIndex((item) => item.id === id);

  if (index === -1) throw new Error('Entry not found');

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;

  const current = sorted[index];
  const neighbor = sorted[targetIndex];

  const [updatedCurrent, updatedNeighbor] = await Promise.all([
    updateEducation(current.id, { sort_order: neighbor.sort_order }),
    updateEducation(neighbor.id, { sort_order: current.sort_order }),
  ]);

  return sortByOrder(
    sorted.map((item) => {
      if (item.id === updatedCurrent.id) return updatedCurrent;
      if (item.id === updatedNeighbor.id) return updatedNeighbor;
      return item;
    }),
  );
}
